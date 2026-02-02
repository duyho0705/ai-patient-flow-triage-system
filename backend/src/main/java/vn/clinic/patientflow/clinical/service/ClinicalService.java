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

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClinicalService {

    private final ClinicalConsultationRepository consultationRepository;
    private final ClinicalVitalRepository vitalRepository;
    private final vn.clinic.patientflow.queue.repository.QueueEntryRepository queueEntryRepository;
    private final vn.clinic.patientflow.identity.service.IdentityService identityService;

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
        return consultationRepository.save(cons);
    }
}
