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

import java.util.List;
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

        TriageSession session = TriageSession.builder()
                .tenant(tenant)
                .branch(branch)
                .patient(patient)
                .appointment(appointment)
                .triagedByUser(triagedByUser)
                .startedAt(request.getStartedAt())
                .acuityLevel(request.getAcuityLevel())
                .acuitySource(request.getAcuitySource())
                .aiSuggestedAcuity(request.getAiSuggestedAcuity())
                .aiConfidenceScore(request.getAiConfidenceScore())
                .chiefComplaintText(request.getChiefComplaintText())
                .notes(request.getNotes())
                .build();
        session = triageSessionRepository.save(session);

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
}
