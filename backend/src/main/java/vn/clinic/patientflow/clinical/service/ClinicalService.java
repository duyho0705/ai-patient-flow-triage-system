package vn.clinic.patientflow.clinical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.clinical.domain.ClinicalVital;
import vn.clinic.patientflow.clinical.repository.ClinicalConsultationRepository;
import vn.clinic.patientflow.clinical.repository.ClinicalVitalRepository;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClinicalService {

    private final ClinicalConsultationRepository consultationRepository;
    private final ClinicalVitalRepository vitalRepository;
    private final vn.clinic.patientflow.queue.repository.QueueEntryRepository queueEntryRepository;
    private final vn.clinic.patientflow.identity.service.IdentityService identityService;
    private final vn.clinic.patientflow.billing.service.BillingService billingService;
    private final vn.clinic.patientflow.clinical.repository.PrescriptionRepository prescriptionRepository;
    private final vn.clinic.patientflow.pharmacy.repository.PharmacyProductRepository productRepository;
    private final vn.clinic.patientflow.pharmacy.service.PharmacyService pharmacyService;
    private final vn.clinic.patientflow.pharmacy.repository.PharmacyInventoryRepository inventoryRepository;

    @Transactional(readOnly = true)
    public ClinicalConsultation getById(UUID id) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return consultationRepository.findById(id)
                .filter(c -> c.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("ClinicalConsultation", id));
    }

    @Transactional(readOnly = true)
    public List<ClinicalConsultation> getPatientHistory(UUID patientId) {
        return consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<ClinicalVital> getVitals(UUID consultationId) {
        getById(consultationId);
        return vitalRepository.findByConsultationIdOrderByRecordedAtAsc(consultationId);
    }

    @Transactional
    public ClinicalConsultation startConsultation(UUID queueEntryId, UUID doctorId) {
        var queueEntry = queueEntryRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("QueueEntry", queueEntryId));

        if (!"WAITING".equalsIgnoreCase(queueEntry.getStatus()) && !"CALLED".equalsIgnoreCase(queueEntry.getStatus())) {
            throw new IllegalStateException("Queue entry not in WAITING or CALLED state");
        }

        // Create new consultation
        ClinicalConsultation consultation = ClinicalConsultation.builder()
                .tenant(queueEntry.getTenant())
                .branch(queueEntry.getBranch())
                .patient(queueEntry.getPatient())
                .queueEntry(queueEntry)
                .doctorUser(doctorId != null ? identityService.getUserById(doctorId) : null)
                .startedAt(java.time.Instant.now())
                .status("IN_PROGRESS")
                .chiefComplaintSummary(
                        queueEntry.getTriageSession() != null ? queueEntry.getTriageSession().getChiefComplaintText()
                                : null)
                .build();

        consultation = consultationRepository.save(consultation);

        // Update queue entry
        queueEntry.setStatus("COMPLETED");
        queueEntry.setCompletedAt(java.time.Instant.now());
        queueEntryRepository.save(queueEntry);

        return consultation;
    }

    @Transactional
    public ClinicalConsultation updateConsultation(UUID id, String diagnosis, String prescription) {
        var cons = getById(id);
        if (!"IN_PROGRESS".equals(cons.getStatus())) {
            // throw new IllegalStateException("Consultation is not in progress");
        }
        cons.setDiagnosisNotes(diagnosis);
        cons.setPrescriptionNotes(prescription);
        return consultationRepository.save(cons);
    }

    @Transactional
    public ClinicalConsultation completeConsultation(UUID id) {
        var cons = getById(id);
        cons.setStatus("COMPLETED");
        cons.setEndedAt(java.time.Instant.now());
        cons = consultationRepository.save(cons);

        // Create default invoice for Consultation Fee
        vn.clinic.patientflow.billing.domain.Invoice invoice = vn.clinic.patientflow.billing.domain.Invoice.builder()
                .tenant(cons.getTenant())
                .branch(cons.getBranch())
                .patient(cons.getPatient())
                .consultation(cons)
                .status("PENDING")
                .items(new java.util.ArrayList<>())
                .discountAmount(BigDecimal.ZERO)
                .build();

        invoice.getItems().add(vn.clinic.patientflow.billing.domain.InvoiceItem.builder()
                .invoice(invoice)
                .itemName("Phí khám bệnh / Consultation Fee")
                .quantity(BigDecimal.ONE)
                .unitPrice(new BigDecimal("150000")) // Default fee
                .lineTotal(new BigDecimal("150000"))
                .build());

        // Add Prescription items if exists
        prescriptionRepository.findByConsultationId(cons.getId()).ifPresent(prescription -> {
            for (var item : prescription.getItems()) {
                String name = item.getProductNameCustom();
                if (item.getProduct() != null) {
                    name = item.getProduct().getNameVi();
                }

                BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;

                invoice.getItems().add(vn.clinic.patientflow.billing.domain.InvoiceItem.builder()
                        .invoice(invoice)
                        .itemName("Thuốc: " + name)
                        .quantity(item.getQuantity())
                        .unitPrice(price)
                        .lineTotal(price.multiply(item.getQuantity()))
                        .build());
            }
        });

        billingService.createInvoice(invoice);

        return cons;
    }

    @Transactional
    public vn.clinic.patientflow.clinical.domain.Prescription createPrescription(
            vn.clinic.patientflow.api.dto.CreatePrescriptionRequest request) {
        var cons = getById(request.getConsultationId());

        vn.clinic.patientflow.clinical.domain.Prescription prescription = vn.clinic.patientflow.clinical.domain.Prescription
                .builder()
                .consultation(cons)
                .patient(cons.getPatient())
                .doctorUserId(cons.getDoctorUser() != null ? cons.getDoctorUser().getId() : null)
                .status(vn.clinic.patientflow.clinical.domain.Prescription.PrescriptionStatus.ISSUED)
                .notes(request.getNotes())
                .items(new java.util.ArrayList<>())
                .build();

        for (var itemReq : request.getItems()) {
            vn.clinic.patientflow.clinical.domain.PrescriptionItem item = vn.clinic.patientflow.clinical.domain.PrescriptionItem
                    .builder()
                    .prescription(prescription)
                    .quantity(itemReq.getQuantity())
                    .dosageInstruction(itemReq.getDosageInstruction())
                    .productNameCustom(itemReq.getProductNameCustom())
                    .unitPrice(itemReq.getUnitPrice())
                    .build();

            if (itemReq.getProductId() != null) {
                var product = productRepository.findById(itemReq.getProductId()).orElse(null);
                item.setProduct(product);
                if (item.getUnitPrice() == null && product != null) {
                    item.setUnitPrice(product.getStandardPrice());
                }
            }
            prescription.getItems().add(item);
        }

        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public void dispensePrescription(UUID prescriptionId, UUID performedByUserId) {
        var prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", prescriptionId));

        if (prescription
                .getStatus() == vn.clinic.patientflow.clinical.domain.Prescription.PrescriptionStatus.DISPENSED) {
            throw new IllegalStateException("Prescription already dispensed");
        }

        // Check if invoice is paid
        boolean isPaid = billingService.getInvoiceByConsultation(prescription.getConsultation().getId())
                .map(inv -> "PAID".equalsIgnoreCase(inv.getStatus()))
                .orElse(false);

        if (!isPaid) {
            throw new IllegalStateException("Invoice for this prescription has not been paid yet");
        }

        for (var item : prescription.getItems()) {
            if (item.getProduct() != null) {
                pharmacyService.dispenseStock(
                        prescription.getConsultation().getBranch().getId(),
                        item.getProduct().getId(),
                        item.getQuantity(),
                        prescription.getId(),
                        performedByUserId,
                        "Dispensed for prescription " + prescription.getId());
            }
        }

        prescription.setStatus(vn.clinic.patientflow.clinical.domain.Prescription.PrescriptionStatus.DISPENSED);
        prescriptionRepository.save(prescription);
    }

    @Transactional(readOnly = true)
    public List<vn.clinic.patientflow.clinical.domain.Prescription> getPendingPrescriptions(UUID branchId) {
        return prescriptionRepository.findByStatusAndConsultationBranchIdOrderByCreatedAtDesc(
                vn.clinic.patientflow.clinical.domain.Prescription.PrescriptionStatus.ISSUED, branchId);
    }

    @Transactional(readOnly = true)
    public List<ClinicalConsultation> getRecentConsultationsByPatient(UUID patientId, int limit) {
        return consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId)
                .stream().limit(limit).collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClinicalConsultation> getConsultationsByPatient(UUID patientId) {
        return consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public java.util.Optional<vn.clinic.patientflow.clinical.domain.Prescription> getPrescriptionByConsultation(
            UUID consultationId) {
        return prescriptionRepository.findByConsultationId(consultationId);
    }

    public vn.clinic.patientflow.api.dto.PrescriptionDto mapPrescriptionToDto(
            vn.clinic.patientflow.clinical.domain.Prescription p) {
        String invoiceStatus = billingService.getInvoiceByConsultation(p.getConsultation().getId())
                .map(vn.clinic.patientflow.billing.domain.Invoice::getStatus)
                .orElse("UNKNOWN");

        return vn.clinic.patientflow.api.dto.PrescriptionDto.builder()
                .id(p.getId())
                .consultationId(p.getConsultation().getId())
                .patientId(p.getPatient().getId())
                .patientName(p.getPatient().getFullNameVi())
                .doctorUserId(p.getDoctorUserId())
                .status(p.getStatus().name())
                .notes(p.getNotes())
                .invoiceStatus(invoiceStatus)
                .items(p.getItems().stream().map(item -> {
                    java.math.BigDecimal stock = java.math.BigDecimal.ZERO;
                    if (item.getProduct() != null) {
                        stock = inventoryRepository
                                .findByBranchIdAndProductId(p.getConsultation().getBranch().getId(),
                                        item.getProduct().getId())
                                .map(vn.clinic.patientflow.pharmacy.domain.PharmacyInventory::getCurrentStock)
                                .orElse(java.math.BigDecimal.ZERO);
                    }

                    return vn.clinic.patientflow.api.dto.PrescriptionItemDto.builder()
                            .id(item.getId())
                            .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                            .productName(
                                    item.getProduct() != null ? item.getProduct().getNameVi()
                                            : item.getProductNameCustom())
                            .quantity(item.getQuantity())
                            .dosageInstruction(item.getDosageInstruction())
                            .unitPrice(item.getUnitPrice())
                            .availableStock(stock)
                            .build();
                }).collect(java.util.stream.Collectors.toList()))
                .build();
    }
}
