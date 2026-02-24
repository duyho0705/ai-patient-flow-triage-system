package vn.clinic.patientflow.billing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.billing.domain.Invoice;
import vn.clinic.patientflow.billing.repository.InvoiceRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;

/**
 * Service for VNPAY payment integration.
 * Handles payment URL generation, callback verification, and invoice updates.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final InvoiceRepository invoiceRepository;

    @Value("${vnpay.url}")
    private String vnpPayUrl;
    @Value("${vnpay.tmn-code}")
    private String vnpTmnCode;
    @Value("${vnpay.hash-secret}")
    private String vnpHashSecret;
    @Value("${vnpay.version}")
    private String vnpVersion;
    @Value("${vnpay.command}")
    private String vnpCommand;

    /**
     * Creates a VNPAY payment URL for the given invoice.
     */
    public String createVnpayPaymentUrl(Invoice invoice, String returnUrl) {
        long amount = invoice.getFinalAmount().longValue() * 100;
        String txnRef = invoice.getId().toString();

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", vnpVersion);
        params.put("vnp_Command", vnpCommand);
        params.put("vnp_TmnCode", vnpTmnCode);
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan hoa don y te #" + invoice.getId());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", "127.0.0.1");

        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        params.put("vnp_CreateDate", formatter.format(new Date()));

        String queryUrl = buildQueryString(params);
        String secureHash = hmacSHA512(vnpHashSecret, buildHashData(params));
        queryUrl += "&vnp_SecureHash=" + secureHash;

        return vnpPayUrl + "?" + queryUrl;
    }

    /**
     * Verifies VNPAY callback signature.
     */
    public boolean verifyCallback(Map<String, String> fields) {
        String secureHash = fields.get("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        String checkHash = hmacSHA512(vnpHashSecret, buildHashData(new TreeMap<>(fields)));
        return checkHash.equalsIgnoreCase(secureHash);
    }

    /**
     * Processes VNPAY callback: verifies signature and updates invoice status.
     */
    @Transactional
    public String processCallback(Map<String, String> params) {
        boolean isValid = verifyCallback(new TreeMap<>(params));
        if (!isValid) {
            log.warn("VNPAY callback with invalid signature: txnRef={}",
                    params.get("vnp_TxnRef"));
            return "INVALID_SIGNATURE";
        }

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");

        if ("00".equals(responseCode)) {
            UUID invoiceId = UUID.fromString(txnRef);
            var invoice = invoiceRepository.findById(invoiceId).orElse(null);
            if (invoice != null && !"PAID".equals(invoice.getStatus())) {
                invoice.setStatus("PAID");
                invoice.setPaymentMethod("VNPAY");
                invoice.setPaidAt(Instant.now());
                invoiceRepository.save(invoice);
                log.info("Invoice {} marked as PAID via VNPAY", invoiceId);
            }
            return "SUCCESS";
        }

        log.warn("VNPAY payment failed for txnRef={}, responseCode={}", txnRef, responseCode);
        return "FAILED";
    }

    // ── Private Helpers ──────────────────────────────────────────────

    private String buildQueryString(Map<String, String> params) {
        StringBuilder query = new StringBuilder();
        var itr = params.entrySet().iterator();
        while (itr.hasNext()) {
            var entry = itr.next();
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                }
            }
        }
        return query.toString();
    }

    private String buildHashData(Map<String, String> sortedParams) {
        StringBuilder hashData = new StringBuilder();
        var itr = sortedParams.entrySet().iterator();
        while (itr.hasNext()) {
            var entry = itr.next();
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                hashData.append(entry.getKey());
                hashData.append('=');
                hashData.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }
        return hashData.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) {
                return "";
            }
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("HMAC-SHA512 computation failed", ex);
            return "";
        }
    }
}
