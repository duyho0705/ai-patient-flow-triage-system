package vn.clinic.patientflow.clinical.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.billing.domain.Invoice;
import vn.clinic.patientflow.billing.domain.InvoiceItem;
import vn.clinic.patientflow.billing.service.BillingService;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.clinical.repository.DiagnosticImageRepository;
import vn.clinic.patientflow.clinical.repository.LabResultRepository;
import vn.clinic.patientflow.clinical.repository.PrescriptionRepository;

import java.math.BigDecimal;
import java.util.ArrayList;

/**
 * Enterprise Billing Orchestrator for Clinical Consultations.
 * Handles the automated invoice generation based on encounter artifacts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClinicalBillingService {

    private final BillingService billingService;
    private final PrescriptionRepository prescriptionRepository;
    private final LabResultRepository labResultRepository;
    private final DiagnosticImageRepository diagnosticImageRepository;

    @Transactional
    public Invoice generateConsultationInvoice(ClinicalConsultation cons) {
        log.info("Generating automated invoice for consultation: {}", cons.getId());

        Invoice invoice = Invoice.builder()
                .tenant(cons.getTenant())
                .branch(cons.getBranch())
                .patient(cons.getPatient())
                .consultation(cons)
                .status("PENDING")
                .items(new ArrayList<>())
                .discountAmount(BigDecimal.ZERO)
                .build();

        // 1. Base Consultation Fee
        addInvoiceItem(invoice, "Phí khám bệnh / Consultation Fee", BigDecimal.ONE, new BigDecimal("150000"));

        // 2. Prescription Items
        prescriptionRepository.findByConsultationId(cons.getId()).ifPresent(prescription -> {
            prescription.getItems().forEach(item -> {
                String name = item.getProduct() != null ? item.getProduct().getNameVi() : item.getProductNameCustom();
                BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                addInvoiceItem(invoice, "Thuốc: " + name, item.getQuantity(), price);
            });
        });

        // 3. Lab Results
        labResultRepository.findByConsultation(cons).forEach(lab -> {
            BigDecimal price = resolveLabPrice(lab.getTestName());
            addInvoiceItem(invoice, "Xét nghiệm: " + lab.getTestName(), BigDecimal.ONE, price);
        });

        // 4. Diagnostic Imaging
        diagnosticImageRepository.findByConsultation(cons).forEach(img -> {
            BigDecimal price = resolveImagingPrice(img.getTitle());
            addInvoiceItem(invoice, "Cận lâm sàng: " + img.getTitle(), BigDecimal.ONE, price);
        });

        return billingService.createInvoice(invoice);
    }

    private void addInvoiceItem(Invoice invoice, String name, BigDecimal qty, BigDecimal unitPrice) {
        invoice.getItems().add(InvoiceItem.builder()
                .invoice(invoice)
                .itemName(name)
                .quantity(qty)
                .unitPrice(unitPrice)
                .lineTotal(unitPrice.multiply(qty))
                .build());
    }

    private BigDecimal resolveLabPrice(String testName) {
        if (testName.toLowerCase().contains("glucose"))
            return new BigDecimal("120000");
        return new BigDecimal("85000"); // Standard enterprise fee
    }

    private BigDecimal resolveImagingPrice(String title) {
        if (title.toLowerCase().contains("siêu âm"))
            return new BigDecimal("180000");
        return new BigDecimal("250000"); // Standard XR fee
    }
}
