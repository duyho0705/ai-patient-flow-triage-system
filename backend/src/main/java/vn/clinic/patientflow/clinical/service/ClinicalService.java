package vn.clinic.patientflow.clinical.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.api.dto.ConsultationSummaryPdfDto;
import vn.clinic.patientflow.api.dto.CreatePrescriptionRequest;
import vn.clinic.patientflow.api.dto.PrescriptionDto;
import vn.clinic.patientflow.api.dto.PrescriptionItemDto;
import vn.clinic.patientflow.billing.service.BillingService;
import vn.clinic.patientflow.clinical.domain.*;
import vn.clinic.patientflow.clinical.event.ConsultationCompletedEvent;
import vn.clinic.patientflow.clinical.repository.*;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.service.AuditLogService;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.identity.service.IdentityService;
import vn.clinic.patientflow.pharmacy.repository.PharmacyInventoryRepository;
import vn.clinic.patientflow.pharmacy.repository.PharmacyProductRepository;
import vn.clinic.patientflow.pharmacy.service.PharmacyService;
import vn.clinic.patientflow.queue.repository.QueueEntryRepository;
import vn.clinic.patientflow.queue.service.QueueBroadcastService;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Enterprise Clinical Service Orchestrator.
 * Handles the core medical encounter lifecycle.
 * Refactored for modularity, SRP, and high maintainability.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClinicalService {

    // Repositories
    private final ClinicalConsultationRepository consultationRepository;
    private final ClinicalVitalRepository vitalRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PharmacyProductRepository productRepository;
    private final PharmacyInventoryRepository inventoryRepository;
    private final LabResultRepository labResultRepository;
    private final DiagnosticImageRepository diagnosticImageRepository;

    // Services
    private final IdentityService identityService;
    private final BillingService billingService;
    private final PharmacyService pharmacyService;
    private final QueueBroadcastService queueBroadcastService;
    private final AuditLogService auditLogService;
    private final ApplicationEventPublisher eventPublisher;

    // Refactored Components
    private final ClinicalBillingService clinicalBillingService;
    private final ClinicalSimulationService simulationService;
    private final ClinicalMapper clinicalMapper;

    @Transactional(readOnly = true)
    public ClinicalConsultation getById(UUID id) {
        log.debug("Fetching consultation by id: {}", id);
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return consultationRepository.findById(id)
                .filter(c -> c.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("ClinicalConsultation", id));
    }

    @Transactional(readOnly = true)
    public List<ClinicalConsultation> getPatientHistory(UUID patientId) {
        return consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId);
    }

    @Transactional
    public ClinicalConsultation startConsultation(UUID queueEntryId, UUID doctorId) {
        var queueEntry = queueEntryRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("QueueEntry", queueEntryId));

        if (!"WAITING".equalsIgnoreCase(queueEntry.getStatus()) && !"CALLED".equalsIgnoreCase(queueEntry.getStatus())) {
            throw new IllegalStateException("Queue entry not in WAITING or CALLED state");
        }

        ClinicalConsultation consultation = ClinicalConsultation.builder()
                .tenant(queueEntry.getTenant())
                .branch(queueEntry.getBranch())
                .patient(queueEntry.getPatient())
                .queueEntry(queueEntry)
                .doctorUser(doctorId != null ? identityService.getUserById(doctorId) : null)
                .startedAt(Instant.now())
                .status("IN_PROGRESS")
                .chiefComplaintSummary(queueEntry.getTriageSession() != null
                        ? queueEntry.getTriageSession().getChiefComplaintText()
                        : null)
                .build();

        consultation = consultationRepository.save(consultation);
        auditLogService.log("START_CONSULTATION", "CLINICAL_CONSULTATION", consultation.getId().toString(),
                "Bắt đầu phiên khám: " + consultation.getPatient().getFullNameVi());

        queueEntry.setStatus("COMPLETED");
        queueEntry.setCompletedAt(Instant.now());
        queueEntryRepository.save(queueEntry);

        return consultation;
    }

    @Transactional
    public ClinicalConsultation updateConsultation(UUID id, String diagnosis, String prescription) {
        var cons = getById(id);
        cons.setDiagnosisNotes(diagnosis);
        cons.setPrescriptionNotes(prescription);
        return consultationRepository.save(cons);
    }

    @Transactional
    public ClinicalConsultation completeConsultation(UUID id) {
        var cons = getById(id);
        cons.setStatus("COMPLETED");
        cons.setEndedAt(Instant.now());
        cons = consultationRepository.save(cons);

        auditLogService.log("COMPLETE_CONSULTATION", "CLINICAL_CONSULTATION", cons.getId().toString(),
                "Hoàn thành phiên khám: " + cons.getPatient().getFullNameVi());

        // 1. Enterprise Billing
        var invoice = clinicalBillingService.generateConsultationInvoice(cons);

        // 2. Simulation (Demo/R&D data)
        simulationService.generateSimulatedData(cons);

        // 3. Communications
        queueBroadcastService.notifyBillingReady(
                cons.getPatient().getId(),
                invoice.getId(),
                invoice.getFinalAmount().stripTrailingZeros().toPlainString());

        // 4. Async Post-processing
        eventPublisher.publishEvent(new ConsultationCompletedEvent(this, cons));

        log.info("Successfully completed consultation process for id: {}", id);
        return cons;
    }

    @Transactional
    public Prescription createPrescription(CreatePrescriptionRequest request) {
        var cons = getById(request.getConsultationId());
        Prescription prescription = Prescription.builder()
                .consultation(cons)
                .patient(cons.getPatient())
                .doctorUserId(cons.getDoctorUser() != null ? cons.getDoctorUser().getId() : null)
                .status(Prescription.PrescriptionStatus.ISSUED)
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        request.getItems().forEach(itemReq -> {
            var item = PrescriptionItem.builder()
                    .prescription(prescription)
                    .quantity(itemReq.getQuantity())
                    .dosageInstruction(itemReq.getDosageInstruction())
                    .productNameCustom(itemReq.getProductNameCustom())
                    .unitPrice(itemReq.getUnitPrice())
                    .build();

            if (itemReq.getProductId() != null) {
                productRepository.findById(itemReq.getProductId()).ifPresent(p -> {
                    item.setProduct(p);
                    if (item.getUnitPrice() == null)
                        item.setUnitPrice(p.getStandardPrice());
                });
            }
            prescription.getItems().add(item);
        });

        var saved = prescriptionRepository.save(prescription);
        auditLogService.log("CREATE_PRESCRIPTION", "PRESCRIPTION", saved.getId().toString(),
                String.format("Tạo đơn thuốc cho BN: %s (Gồm %d mục)", cons.getPatient().getFullNameVi(),
                        saved.getItems().size()));
        log.info("Prescription created for consultation: {}", cons.getId());
        return saved;
    }

    @Transactional
    public void dispensePrescription(UUID prescriptionId, UUID performedByUserId) {
        var prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", prescriptionId));

        if (prescription.getStatus() == Prescription.PrescriptionStatus.DISPENSED) {
            throw new IllegalStateException("Prescription already dispensed");
        }

        boolean isPaid = billingService.getInvoiceByConsultation(prescription.getConsultation().getId())
                .map(inv -> "PAID".equalsIgnoreCase(inv.getStatus()))
                .orElse(false);

        if (!isPaid) {
            throw new IllegalStateException("Invoice not paid yet");
        }

        prescription.getItems().stream()
                .filter(i -> i.getProduct() != null)
                .forEach(i -> pharmacyService.dispenseStock(
                        prescription.getConsultation().getBranch().getId(),
                        i.getProduct().getId(),
                        i.getQuantity(),
                        prescription.getId(),
                        performedByUserId,
                        "Prescription " + prescription.getId()));

        prescription.setStatus(Prescription.PrescriptionStatus.DISPENSED);
        prescription.setDispensedAt(Instant.now());
        prescription.setDispenserUserId(performedByUserId);
        prescriptionRepository.save(prescription);

        auditLogService.log("DISPENSE_PRESCRIPTION", "PRESCRIPTION", prescriptionId.toString(),
                "Xác nhận cấp phát thuốc cho đơn: " + prescriptionId);
        log.info("Prescription dispensed: {} by user: {}", prescriptionId, performedByUserId);

        queueBroadcastService.notifyPharmacyReady(prescription.getPatient().getId(), prescription.getId());
    }

    @Transactional(readOnly = true)
    public List<ClinicalConsultation> getConsultationsByPatient(UUID patientId) {
        return consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public Page<ClinicalConsultation> getConsultationsByPatientPageable(UUID patientId, Pageable pageable) {
        return consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId, pageable);
    }

    @Transactional(readOnly = true)
    public List<ClinicalConsultation> getRecentConsultationsByPatient(UUID patientId, int limit) {
        return consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId)
                .stream().limit(limit).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Prescription> getPrescriptionByConsultation(UUID consultationId) {
        return prescriptionRepository.findByConsultationId(consultationId);
    }

    @Transactional(readOnly = true)
    public List<Prescription> getPendingPrescriptions(UUID branchId) {
        return prescriptionRepository.findByStatusAndConsultationBranchIdOrderByCreatedAtDesc(
                Prescription.PrescriptionStatus.ISSUED, branchId);
    }

    @Transactional(readOnly = true)
    public ConsultationSummaryPdfDto getConsultationSummaryForPdf(UUID id) {
        var cons = getById(id);
        var vitals = vitalRepository.findByConsultationIdOrderByRecordedAtAsc(id);
        var labs = labResultRepository.findByConsultation(cons);
        var images = diagnosticImageRepository.findByConsultation(cons);
        var prescription = prescriptionRepository.findByConsultationId(id).orElse(null);
        var pDto = prescription != null ? mapPrescriptionToDto(prescription) : null;

        return clinicalMapper.toPdfDto(cons, vitals, labs, images, prescription, pDto);
    }

    // --- Helper Methods ---

    public PrescriptionDto mapPrescriptionToDto(Prescription p) {
        String invoiceStatus = billingService.getInvoiceByConsultation(p.getConsultation().getId())
                .map(inv -> inv.getStatus())
                .orElse("UNKNOWN");

        return PrescriptionDto.builder()
                .id(p.getId())
                .consultationId(p.getConsultation().getId())
                .patientId(p.getPatient().getId())
                .patientName(p.getPatient().getFullNameVi())
                .status(p.getStatus().name())
                .notes(p.getNotes())
                .invoiceStatus(invoiceStatus)
                .items(p.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList()))
                .build();
    }

    private PrescriptionItemDto mapItemToDto(PrescriptionItem item) {
        BigDecimal stock = item.getProduct() != null
                ? inventoryRepository.findByBranchIdAndProductId(
                        item.getPrescription().getConsultation().getBranch().getId(),
                        item.getProduct().getId())
                        .map(inv -> inv.getCurrentStock()).orElse(BigDecimal.ZERO)
                : BigDecimal.ZERO;

        return PrescriptionItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getNameVi() : item.getProductNameCustom())
                .quantity(item.getQuantity())
                .dosageInstruction(item.getDosageInstruction())
                .unitPrice(item.getUnitPrice())
                .availableStock(stock)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ClinicalVital> getVitals(UUID consultationId) {
        return vitalRepository.findByConsultationIdOrderByRecordedAtAsc(consultationId);
    }

    @Transactional(readOnly = true)
    public List<LabResult> getLabResults(UUID consultationId) {
        return labResultRepository.findByConsultation(getById(consultationId));
    }

    @Transactional(readOnly = true)
    public List<DiagnosticImage> getDiagnosticImages(UUID consultationId) {
        return diagnosticImageRepository.findByConsultation(getById(consultationId));
    }

    @Transactional
    public void orderDiagnosticImage(UUID consultationId, String title) {
        diagnosticImageRepository.save(DiagnosticImage.builder()
                .consultation(getById(consultationId))
                .title(title)
                .description("Yêu cầu chụp: " + title)
                .build());
    }
}
