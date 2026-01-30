package vn.clinic.patientflow.aiaudit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.aiaudit.domain.AiTriageAudit;

import java.util.List;
import java.util.UUID;

public interface AiTriageAuditRepository extends JpaRepository<AiTriageAudit, UUID> {

    List<AiTriageAudit> findByTriageSessionIdOrderByCalledAtAsc(UUID triageSessionId);
}
