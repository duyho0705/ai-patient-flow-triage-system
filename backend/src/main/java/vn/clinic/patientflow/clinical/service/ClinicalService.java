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
import vn.clinic.patientflow.clinical.domain.*;
import vn.clinic.patientflow.clinical.event.ConsultationCompletedEvent;
import vn.clinic.patientflow.clinical.repository.*;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.service.AuditLogService;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.identity.service.IdentityService;
import vn.clinic.patientflow.scheduling.service.SchedulingService;

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
 * Refactored for CDM - Removed Triage, Queue, Billing, and Pharmacy modules.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClinicalService {

    // Repositories
    private final ClinicalConsultationRepository consultationRepository;
    private final ClinicalVitalRepository vitalRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabResultRepository labResultRepository;
    private final DiagnosticImageRepository diagnosticImageRepository;

    // Services
    private final IdentityService identityService;
    private final AuditLogService auditLogService;
    private final ApplicationEventPublisher eventPublisher;

    // Refactored Components
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
    public ClinicalConsultation startConsultation(UUID patientId, UUID doctorId) {
        // In CDM, we start from a patient directly (or through an appointment)
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        UUID branchId = TenantContext.getBranchIdOrThrow();

        ClinicalConsultation consultation = ClinicalConsultation.builder()
                .tenant(new vn.clinic.patientflow.tenant.domain.Tenant(tenantId))
                .branch(new vn.clinic.patientflow.tenant.domain.TenantBranch(branchId))
                .patient(new vn.clinic.patientflow.patient.domain.Patient(patientId))
                .doctorUser(doctorId != null ? identityService.getUserById(doctorId) : null)
                .startedAt(Instant.now())
                .status("IN_PROGRESS")
                .build();

        consultation = consultationRepository.save(consultation);
        auditLogService.log("START_CONSULTATION", "CLINICAL_CONSULTATION", consultation.getId().toString(),
                "Bắt đầu phiên khám CDM cho BN: " + consultation.getPatient().getId());

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
                "Hoàn thành phiên khám: " + cons.getPatient().getId());

        // Async Post-processing
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

            // Link to actual product if provided (optional in CDM if catalog is simplified)
            prescription.getItems().add(item);
        });

        var saved = prescriptionRepository.save(prescription);
        auditLogService.log("CREATE_PRESCRIPTION", "PRESCRIPTION", saved.getId().toString(),
                String.format("Tạo đơn thuốc cho BN: %s", cons.getPatient().getId()));
        return saved;
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
        return PrescriptionDto.builder()
                .id(p.getId())
                .consultationId(p.getConsultation().getId())
                .patientId(p.getPatient().getId())
                .patientName(p.getPatient().getFullNameVi())
                .status(p.getStatus().name())
                .notes(p.getNotes())
                .items(p.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList()))
                .build();
    }

    private PrescriptionItemDto mapItemToDto(PrescriptionItem item) {
        return PrescriptionItemDto.builder()
                .id(item.getId())
                .productName(item.getProductNameCustom())
                .quantity(item.getQuantity())
                .dosageInstruction(item.getDosageInstruction())
                .unitPrice(item.getUnitPrice())
                .availableStock(BigDecimal.ZERO) // Pharmacy removed
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
