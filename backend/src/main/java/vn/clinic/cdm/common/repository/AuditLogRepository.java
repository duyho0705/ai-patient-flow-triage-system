package vn.clinic.cdm.common.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.common.domain.AuditLog;
import java.util.UUID;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<AuditLog> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);
}
