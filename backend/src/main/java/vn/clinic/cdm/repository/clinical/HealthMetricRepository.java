package vn.clinic.cdm.repository.clinical;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.clinical.HealthMetric;

import java.util.List;
import java.util.UUID;

public interface HealthMetricRepository extends JpaRepository<HealthMetric, UUID> {
    List<HealthMetric> findByPatientIdOrderByRecordedAtDesc(UUID patientId);

    List<HealthMetric> findByPatientIdAndMetricTypeOrderByRecordedAtDesc(UUID patientId, String metricType);

    List<HealthMetric> findByPatientIdAndMetricTypeAndRecordedAtBetweenOrderByRecordedAtAsc(UUID patientId,
            String metricType, java.time.Instant start, java.time.Instant end);

    @org.springframework.data.jpa.repository.Query("""
        SELECT COUNT(DISTINCT h.patient.id) FROM HealthMetric h
        WHERE h.recordedAt BETWEEN :start AND :end
          AND (
            (h.metricType = 'BLOOD_GLUCOSE' AND (h.value > 300 OR h.value < 55)) OR
            (h.metricType = 'BLOOD_PRESSURE_SYS' AND h.value > 180) OR
            (h.metricType = 'SPO2' AND h.value < 88)
          )
    """)
    long countPatientsWithCriticalMetrics(@org.springframework.data.repository.query.Param("start") java.time.Instant start,
                                          @org.springframework.data.repository.query.Param("end") java.time.Instant end);
}

