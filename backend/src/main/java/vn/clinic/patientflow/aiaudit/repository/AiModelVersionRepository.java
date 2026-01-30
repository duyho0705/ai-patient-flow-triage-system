package vn.clinic.patientflow.aiaudit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.aiaudit.domain.AiModelVersion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AiModelVersionRepository extends JpaRepository<AiModelVersion, UUID> {

    List<AiModelVersion> findByModelKeyOrderByDeployedAtDesc(String modelKey);

    Optional<AiModelVersion> findByModelKeyAndDeprecatedAtIsNull(String modelKey);
}
