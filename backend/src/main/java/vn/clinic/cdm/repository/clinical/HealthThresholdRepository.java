package vn.clinic.cdm.repository.clinical;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.clinical.HealthThreshold;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HealthThresholdRepository extends JpaRepository<HealthThreshold, UUID> {

    List<HealthThreshold> findByPatientId(UUID patientId);

    Optional<HealthThreshold> findByPatientIdAndMetricType(UUID patientId, String metricType);
}
