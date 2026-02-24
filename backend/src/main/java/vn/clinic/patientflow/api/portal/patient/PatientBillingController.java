package vn.clinic.patientflow.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.InvoiceDto;
import vn.clinic.patientflow.api.dto.PagedResponse;
import vn.clinic.patientflow.billing.service.PaymentService;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientPortalService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal/billing")
@RequiredArgsConstructor
@Tag(name = "Patient Billing", description = "Quản lý hóa đơn và thanh toán")
@Slf4j
public class PatientBillingController {

    private final PatientPortalService portalService;
    private final PaymentService paymentService;

    @GetMapping("/invoices")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Danh sách hóa đơn (Có phân trang)")
    public ResponseEntity<ApiResponse<PagedResponse<InvoiceDto>>> getInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.getInvoices(p.getId(), page, size)));
    }

    @PostMapping("/invoices/{id}/pay")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Thanh toán hóa đơn")
    public ResponseEntity<ApiResponse<InvoiceDto>> payInvoice(
            @PathVariable UUID id,
            @RequestBody String paymentMethod) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.payInvoice(p.getId(), id, paymentMethod)));
    }

    @GetMapping("/invoices/{id}/vnpay-url")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Lấy link thanh toán VNPAY")
    public ResponseEntity<ApiResponse<Map<String, String>>> getVnpayUrl(
            @PathVariable UUID id,
            @RequestParam String returnUrl) {
        Patient p = portalService.getAuthenticatedPatient();
        String url = portalService.getVnpayUrl(p.getId(), id, returnUrl);
        return ResponseEntity.ok(ApiResponse.success(Map.of("paymentUrl", url)));
    }

    @GetMapping("/invoices/vnpay-callback")
    @Operation(summary = "Xử lý kết quả thanh toán từ VNPAY")
    public String vnpayCallback(@RequestParam Map<String, String> params) {
        log.info("VNPAY Callback received: {}", params);
        return paymentService.processCallback(params);
    }
}
