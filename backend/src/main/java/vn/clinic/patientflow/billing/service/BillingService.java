package vn.clinic.patientflow.billing.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.billing.domain.Invoice;
import vn.clinic.patientflow.billing.domain.InvoiceItem;
import vn.clinic.patientflow.billing.repository.InvoiceRepository;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepository;

    @Transactional
    public Invoice createInvoice(Invoice invoice) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        // Generate invoice number if not present
        if (invoice.getInvoiceNumber() == null) {
            String prefix = "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmm"));
            long count = invoiceRepository.countByTenantIdAndCreatedAtBetween(
                    tenantId,
                    Instant.now().minusSeconds(60),
                    Instant.now().plusSeconds(60));
            invoice.setInvoiceNumber(prefix + "-" + (count + 1));
        }

        // Ensure totals match items
        BigDecimal total = invoice.getItems().stream()
                .map(InvoiceItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setTotalAmount(total);
        invoice.setFinalAmount(
                total.subtract(invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : BigDecimal.ZERO));

        invoice.getItems().forEach(item -> item.setInvoice(invoice));
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice markAsPaid(UUID invoiceId, String paymentMethod) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));

        invoice.setStatus("PAID");
        invoice.setPaymentMethod(paymentMethod);
        invoice.setPaidAt(Instant.now());
        return invoiceRepository.save(invoice);
    }

    @Transactional(readOnly = true)
    public Invoice getById(UUID id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
    }

    @Transactional(readOnly = true)
    public java.util.List<Invoice> getInvoices(UUID branchId, String status) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        if (status != null && !status.isEmpty()) {
            return invoiceRepository.findByTenantIdAndBranchIdAndStatusOrderByCreatedAtDesc(tenantId, branchId, status);
        }
        return invoiceRepository.findByTenantIdAndBranchIdOrderByCreatedAtDesc(tenantId, branchId);
    }

    @Transactional(readOnly = true)
    public Optional<Invoice> getInvoiceByConsultation(UUID consultationId) {
        return invoiceRepository.findByConsultationId(consultationId);
    }
}
