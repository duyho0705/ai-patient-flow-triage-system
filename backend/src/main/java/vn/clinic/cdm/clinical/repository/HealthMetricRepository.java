package vn.clinic.cdm.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.clinical.domain.HealthMetric;

import java.util.List;
import java.util.UUID;

public interface HealthMetricRepository extends JpaRepository<HealthMetric, UUID> {
    List<HealthMetric> findByPatientIdOrderByRecordedAtDesc(UUID patientId);

    List<HealthMetric> findByPatientIdAndMetricTypeOrderByRecordedAtDesc(UUID patientId, String metricType);

    List<HealthMetric> findByPatientIdAndMetricTypeAndRecordedAtBetweenOrderByRecordedAtAsc(UUID patientId,
            String metricType, java.time.Instant start, java.time.Instant end);
}

