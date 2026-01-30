package vn.clinic.patientflow.triage.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.triage.domain.TriageComplaint;
import vn.clinic.patientflow.triage.domain.TriageSession;
import vn.clinic.patientflow.triage.domain.TriageVital;
import vn.clinic.patientflow.triage.repository.TriageComplaintRepository;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;
import vn.clinic.patientflow.triage.repository.TriageVitalRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TriageService {

    private final TriageSessionRepository triageSessionRepository;
    private final TriageComplaintRepository triageComplaintRepository;
    private final TriageVitalRepository triageVitalRepository;

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
}
