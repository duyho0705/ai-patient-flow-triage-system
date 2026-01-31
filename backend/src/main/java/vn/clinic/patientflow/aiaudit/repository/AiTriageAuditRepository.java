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
}
