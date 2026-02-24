package vn.clinic.patientflow.aiaudit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.aiaudit.domain.AiAuditLog;

import java.util.List;
import java.util.UUID;

public interface AiAuditLogRepository extends JpaRepository<AiAuditLog, UUID> {
    long countByStatus(String status);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(a.latencyMs) FROM AiAuditLog a WHERE a.status = 'SUCCESS'")
    Double getAverageSuccessLatency();

    @org.springframework.data.jpa.repository.Query("SELECT a.featureType, COUNT(a) FROM AiAuditLog a GROUP BY a.featureType")
    List<Object[]> getCountByFeatureType();

    @org.springframework.data.jpa.repository.Query("SELECT a.status, COUNT(a) FROM AiAuditLog a GROUP BY a.status")
    List<Object[]> getCountByStatusGrouped();
}
