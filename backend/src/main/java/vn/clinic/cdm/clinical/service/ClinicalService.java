package vn.clinic.cdm.clinical.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.api.dto.clinical.ConsultationSummaryPdfDto;
import vn.clinic.cdm.api.dto.medication.CreatePrescriptionRequest;
import vn.clinic.cdm.api.dto.medication.PrescriptionDto;
import vn.clinic.cdm.api.dto.medication.PrescriptionItemDto;
import vn.clinic.cdm.clinical.domain.*;
import vn.clinic.cdm.clinical.event.ConsultationCompletedEvent;
import vn.clinic.cdm.clinical.repository.*;
import vn.clinic.cdm.common.exception.ResourceNotFoundException;
import vn.clinic.cdm.common.service.AuditLogService;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.identity.service.IdentityService;

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
    private final DoctorRepository doctorRepository;

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
                .tenant(new vn.clinic.cdm.tenant.domain.Tenant(tenantId))
                .branch(new vn.clinic.cdm.tenant.domain.TenantBranch(branchId))
                .patient(new vn.clinic.cdm.patient.domain.Patient(patientId))
                .doctorUser(doctorId != null ? identityService.getUserById(doctorId) : null)
                .startedAt(Instant.now())
                .status("IN_PROGRESS")
                .build();

        consultation = consultationRepository.save(consultation);
        auditLogService.log("START_CONSULTATION", "CLINICAL_CONSULTATION", consultation.getId().toString(),
                "Báº¯t Ä‘áº§u phiÃªn khÃ¡m CDM cho BN: " + consultation.getPatient().getId());

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
                "HoÃ n thÃ nh phiÃªn khÃ¡m: " + cons.getPatient().getId());

        // Async Post-processing
        eventPublisher.publishEvent(new ConsultationCompletedEvent(this, cons));

        log.info("Successfully completed consultation process for id: {}", id);
        return cons;
    }

    @Transactional
    public Prescription createPrescription(CreatePrescriptionRequest request) {
        var cons = getById(request.getConsultationId());

        Doctor doctor = null;
        if (cons.getDoctorUser() != null) {
            doctor = doctorRepository.findByIdentityUser_Id(cons.getDoctorUser().getId()).orElse(null);
        }

        Prescription prescription = Prescription.builder()
                .consultation(cons)
                .patient(cons.getPatient())
                .doctor(doctor)
                .status(Prescription.PrescriptionStatus.ISSUED)
                .notes(request.getNotes())
                .medications(new ArrayList<>())
                .build();

        request.getItems().forEach(itemReq -> {
            var medication = Medication.builder()
                    .prescription(prescription)
                    .medicineName(itemReq.getProductNameCustom())
                    .dosage(itemReq.getDosageInstruction()) // Assuming dosage instruction is mapped to dosage for now
                    .frequency("Daily") // Default, can be refined
                    .durationDays(7) // Default, can be refined
                    .build();

            prescription.getItems().add(medication);
        });

        var saved = prescriptionRepository.save(prescription);
        auditLogService.log("CREATE_PRESCRIPTION", "PRESCRIPTION", saved.getId().toString(),
                String.format("Táº¡o Ä‘Æ¡n thuá»‘c cho BN: %s", cons.getPatient().getId()));
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
                .consultationId(p.getConsultation() != null ? p.getConsultation().getId() : null)
                .patientId(p.getPatient().getId())
                .patientName(p.getPatient().getFullNameVi())
                .status(p.getStatus() != null ? p.getStatus().name() : "ISSUED")
                .notes(p.getNotes())
                .items(p.getMedications().stream().map(this::mapMedicationToDto).collect(Collectors.toList()))
                .build();
    }

    private PrescriptionItemDto mapMedicationToDto(Medication med) {
        return PrescriptionItemDto.builder()
                .id(med.getId())
                .productName(med.getMedicineName())
                .dosageInstruction(med.getDosage())
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
                .description("YÃªu cáº§u chá»¥p: " + title)
                .build());
    }
}

