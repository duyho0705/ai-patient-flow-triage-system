package vn.clinic.patientflow.aiaudit.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import vn.clinic.patientflow.aiaudit.domain.AiTriageAudit;

public interface AiTriageAuditRepository extends JpaRepository<AiTriageAudit, UUID> {

    List<AiTriageAudit> findByTriageSessionIdOrderByCalledAtAsc(UUID triageSessionId);

    /** Danh sách audit theo chi nhánh + tenant, mới nhất trước. */
    Page<AiTriageAudit> findByTriageSessionBranchIdAndTriageSessionTenantIdOrderByCalledAtDesc(
            UUID branchId, UUID tenantId, Pageable pageable);

    /** Count AI calls by branch and time range. */
    long countByTriageSessionBranchIdAndCalledAtBetween(UUID branchId, java.time.Instant from, java.time.Instant to);

    /** Count matched AI calls by branch. */
    long countByTriageSessionBranchIdAndMatchedTrueAndCalledAtBetween(UUID branchId, java.time.Instant from,
            java.time.Instant to);

    /** Count AI calls by tenant (all branches). */
    long countByTriageSessionTenantIdAndCalledAtBetween(UUID tenantId, java.time.Instant from, java.time.Instant to);

    /** Count matched AI calls by tenant. */
    long countByTriageSessionTenantIdAndMatchedTrueAndCalledAtBetween(UUID tenantId, java.time.Instant from,
            java.time.Instant to);
}
