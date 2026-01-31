package vn.clinic.patientflow.clinical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.clinical.domain.ClinicalVital;
import vn.clinic.patientflow.clinical.repository.ClinicalConsultationRepository;
import vn.clinic.patientflow.clinical.repository.ClinicalVitalRepository;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.service.IdentityService;
import vn.clinic.patientflow.queue.domain.QueueEntry;
import vn.clinic.patientflow.queue.service.QueueService;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClinicalService {

    private final ClinicalConsultationRepository consultationRepository;
    private final ClinicalVitalRepository vitalRepository;
    private final QueueService queueService;
    private final IdentityService identityService;

    @Transactional(readOnly = true)
    public ClinicalConsultation getById(UUID id) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return consultationRepository.findById(id)
                .filter(c -> c.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("ClinicalConsultation", id));
    }

    @Transactional(readOnly = true)
    public List<ClinicalVital> getVitals(UUID consultationId) {
        getById(consultationId);
        return vitalRepository.findByConsultationIdOrderByRecordedAtAsc(consultationId);
    }

    @Transactional(readOnly = true)
    public List<ClinicalConsultation> getPatientHistory(UUID patientId) {
        return consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId);
    }

    @Transactional
    public ClinicalConsultation startConsultation(UUID queueEntryId, UUID doctorUserId) {
        QueueEntry entry = queueService.getEntryById(queueEntryId);
        // Validations can go here (check status, etc.)

        IdentityUser doctor = doctorUserId != null ? identityService.getUserById(doctorUserId) : null;

        ClinicalConsultation consultation = ClinicalConsultation.builder()
                .tenant(entry.getTenant())
                .branch(entry.getBranch())
                .patient(entry.getPatient())
                .queueEntry(entry)
                .doctorUser(doctor)
                .startedAt(Instant.now())
                .status("IN_PROGRESS")
                .build();
        
        consultation = consultationRepository.save(consultation);

        // Update Queue Status
        queueService.updateEntryStatus(entry.getId(), "PROCESSING", null, null, null);

        return consultation;
    }

    @Transactional
    public ClinicalConsultation updateConsultation(UUID id, String diagnosis, String prescription) {
        ClinicalConsultation consultation = getById(id);
        if (diagnosis != null) consultation.setDiagnosisNotes(diagnosis);
        if (prescription != null) consultation.setPrescriptionNotes(prescription);
        return consultationRepository.save(consultation);
    }

    @Transactional
    public ClinicalConsultation completeConsultation(UUID id) {
        ClinicalConsultation consultation = getById(id);
        consultation.setStatus("COMPLETED");
        consultation.setEndedAt(Instant.now());
        
        // Update Queue Status
        if (consultation.getQueueEntry() != null) {
             queueService.updateEntryStatus(consultation.getQueueEntry().getId(), "COMPLETED", null, Instant.now(), null);
        }

        return consultationRepository.save(consultation);
    }
}
