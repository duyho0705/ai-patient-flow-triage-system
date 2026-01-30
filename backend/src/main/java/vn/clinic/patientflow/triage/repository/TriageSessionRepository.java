package vn.clinic.patientflow.triage.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.triage.domain.TriageSession;

import java.util.List;
import java.util.UUID;

public interface TriageSessionRepository extends JpaRepository<TriageSession, UUID> {

    Page<TriageSession> findByTenantIdAndBranchIdOrderByStartedAtDesc(
            UUID tenantId, UUID branchId, Pageable pageable);

    List<TriageSession> findByPatientIdOrderByStartedAtDesc(UUID patientId, Pageable pageable);
}
