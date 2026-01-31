package vn.clinic.patientflow.triage.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.service.IdentityService;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientService;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;
import vn.clinic.patientflow.scheduling.repository.SchedulingAppointmentRepository;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.service.TenantService;
import vn.clinic.patientflow.triage.domain.TriageComplaint;
import vn.clinic.patientflow.triage.domain.TriageSession;
import vn.clinic.patientflow.triage.domain.TriageVital;
import vn.clinic.patientflow.triage.repository.TriageComplaintRepository;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;
import vn.clinic.patientflow.triage.repository.TriageVitalRepository;
import vn.clinic.patientflow.api.dto.CreateTriageSessionRequest;
import vn.clinic.patientflow.triage.ai.AiTriageService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TriageService {

    private final TriageSessionRepository triageSessionRepository;
    private final TriageComplaintRepository triageComplaintRepository;
    private final TriageVitalRepository triageVitalRepository;
    private final TenantService tenantService;
    private final PatientService patientService;
    private final IdentityService identityService;
    private final SchedulingAppointmentRepository schedulingAppointmentRepository;
    private final AiTriageService aiTriageService;

    @Transactional(readOnly = true)
    public TriageSession getById(UUID id) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return triageSessionRepository.findById(id)
                .filter(t -> t.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("TriageSession", id));
    }

    @Transactional(readOnly = true)
    public Page<TriageSession> listByBranch(UUID branchId, Pageable pageable) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return triageSessionRepository.findByTenantIdAndBranchIdOrderByStartedAtDesc(tenantId, branchId, pageable);
    }

    @Transactional(readOnly = true)
    public List<TriageComplaint> getComplaints(UUID triageSessionId) {
        getById(triageSessionId);
        return triageComplaintRepository.findByTriageSessionIdOrderByDisplayOrderAsc(triageSessionId);
    }

    @Transactional(readOnly = true)
    public List<TriageVital> getVitals(UUID triageSessionId) {
        getById(triageSessionId);
        return triageVitalRepository.findByTriageSessionIdOrderByRecordedAtAsc(triageSessionId);
    }

    @Transactional
    public TriageSession createSession(CreateTriageSessionRequest request) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        Tenant tenant = tenantService.getById(tenantId);
        TenantBranch branch = tenantService.getBranchById(request.getBranchId());
        if (!branch.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Branch does not belong to current tenant");
        }
        Patient patient = patientService.getById(request.getPatientId());
        SchedulingAppointment appointment = request.getAppointmentId() != null
                ? schedulingAppointmentRepository.findById(request.getAppointmentId()).orElse(null)
                : null;
        IdentityUser triagedByUser = request.getTriagedByUserId() != null
                ? identityService.getUserById(request.getTriagedByUserId())
                : null;

        String acuityLevel = request.getAcuityLevel();
        String acuitySource = request.getAcuitySource();
        String aiSuggestedAcuity = request.getAiSuggestedAcuity();
        BigDecimal aiConfidenceScore = request.getAiConfidenceScore();

        AiTriageService.TriageInput aiInput = null;
        AiTriageService.TriageSuggestionResult aiResult = null;

        if (Boolean.TRUE.equals(request.getUseAiSuggestion())) {
            aiInput = buildTriageInput(request, patient);
            aiResult = aiTriageService.suggest(aiInput);
            acuityLevel = aiResult.getSuggestedAcuity();
            acuitySource = "AI";
            aiSuggestedAcuity = aiResult.getSuggestedAcuity();
            aiConfidenceScore = aiResult.getConfidence();
        } else if (request.getAcuityLevel() == null || request.getAcuityLevel().isBlank()) {
            throw new IllegalArgumentException("acuityLevel is required when useAiSuggestion is false");
        }

        TriageSession session = TriageSession.builder()
                .tenant(tenant)
                .branch(branch)
                .patient(patient)
                .appointment(appointment)
                .triagedByUser(triagedByUser)
                .startedAt(request.getStartedAt())
                .acuityLevel(acuityLevel)
                .acuitySource(acuitySource)
                .aiSuggestedAcuity(aiSuggestedAcuity)
                .aiConfidenceScore(aiConfidenceScore)
                .chiefComplaintText(request.getChiefComplaintText())
                .notes(request.getNotes())
                .overrideReason(request.getOverrideReason())
                .build();
        session = triageSessionRepository.save(session);

        if (Boolean.TRUE.equals(request.getUseAiSuggestion()) && aiInput != null && aiResult != null) {
            aiTriageService.recordAudit(session.getId(), aiInput, aiResult);
        }

        if (request.getComplaints() != null) {
            for (var c : request.getComplaints()) {
                TriageComplaint complaint = TriageComplaint.builder()
                        .triageSession(session)
                        .complaintType(c.getComplaintType())
                        .complaintText(c.getComplaintText())
                        .displayOrder(c.getDisplayOrder())
                        .build();
                triageComplaintRepository.save(complaint);
            }
        }
        if (request.getVitals() != null) {
            for (var v : request.getVitals()) {
                TriageVital vital = TriageVital.builder()
                        .triageSession(session)
                        .vitalType(v.getVitalType())
                        .valueNumeric(v.getValueNumeric())
                        .unit(v.getUnit())
                        .recordedAt(v.getRecordedAt())
                        .build();
                triageVitalRepository.save(vital);
            }
        }
        return triageSessionRepository.findById(session.getId()).orElseThrow();
    }

    private AiTriageService.TriageInput buildTriageInput(CreateTriageSessionRequest request, Patient patient) {
        int ageInYears = patient.getDateOfBirth() != null
                ? (int) ChronoUnit.YEARS.between(patient.getDateOfBirth(), LocalDate.now())
                : 0;
        Map<String, BigDecimal> vitals = new HashMap<>();
        if (request.getVitals() != null) {
            for (var v : request.getVitals()) {
                if (v.getVitalType() != null && v.getValueNumeric() != null) {
                    vitals.put(v.getVitalType(), v.getValueNumeric());
                }
            }
        }
        List<String> complaintTypes = request.getComplaints() != null
                ? request.getComplaints().stream()
                .map(CreateTriageSessionRequest.ComplaintItem::getComplaintType)
                .filter(java.util.Objects::nonNull)
                .toList()
                : List.of();
        return AiTriageService.TriageInput.builder()
                .chiefComplaintText(request.getChiefComplaintText())
                .ageInYears(ageInYears)
                .vitals(vitals)
                .complaintTypes(complaintTypes)
                .build();
    }
}
