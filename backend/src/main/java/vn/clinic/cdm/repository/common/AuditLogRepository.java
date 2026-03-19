package vn.clinic.cdm.repository.common;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.entity.common.AuditLog;
import java.time.Instant;
import java.util.UUID;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<AuditLog> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    @Query(value = "SELECT l FROM AuditLog l WHERE (CAST(:tenantId AS uuid) IS NULL OR l.tenantId = :tenantId) " +
           "AND (:action IS NULL OR l.action = :action) " +
           "AND (CAST(:startDate AS timestamp) IS NULL OR l.createdAt >= :startDate) " +
           "ORDER BY l.createdAt DESC",
           countQuery = "SELECT COUNT(l) FROM AuditLog l WHERE (CAST(:tenantId AS uuid) IS NULL OR l.tenantId = :tenantId) " +
           "AND (:action IS NULL OR l.action = :action) " +
           "AND (CAST(:startDate AS timestamp) IS NULL OR l.createdAt >= :startDate)")
    Page<AuditLog> findWithFilters(@Param("tenantId") UUID tenantId, 
                                  @Param("action") String action, 
                                  @Param("startDate") Instant startDate, 
                                  Pageable pageable);

    long countByCreatedAtAfter(Instant after);

    long countByStatusAndCreatedAtAfter(String status, Instant after);
}
