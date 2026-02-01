package vn.clinic.patientflow.aiaudit.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.aiaudit.domain.AiTriageAudit;

import java.util.List;
import java.util.UUID;

public interface AiTriageAuditRepository extends JpaRepository<AiTriageAudit, UUID> {

    List<AiTriageAudit> findByTriageSessionIdOrderByCalledAtAsc(UUID triageSessionId);

    /** Danh sách audit theo chi nhánh + tenant, mới nhất trước. */
    Page<AiTriageAudit> findByTriageSession_Branch_IdAndTriageSession_Tenant_IdOrderByCalledAtDesc(
            UUID branchId, UUID tenantId, Pageable pageable);

    /** Count AI calls by branch and time range. */
    long countByTriageSession_Branch_IdAndCalledAtBetween(UUID branchId, java.time.Instant from, java.time.Instant to);

    /** Count matched AI calls by branch. */
    long countByTriageSession_Branch_IdAndMatchedTrueAndCalledAtBetween(UUID branchId, java.time.Instant from, java.time.Instant to);

    /** Count AI calls by tenant (all branches). */
    long countByTriageSession_Tenant_IdAndCalledAtBetween(UUID tenantId, java.time.Instant from, java.time.Instant to);

    /** Count matched AI calls by tenant. */
    long countByTriageSession_Tenant_IdAndMatchedTrueAndCalledAtBetween(UUID tenantId, java.time.Instant from, java.time.Instant to);
}
