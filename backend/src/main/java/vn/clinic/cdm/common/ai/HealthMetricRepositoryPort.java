package vn.clinic.cdm.common.ai;

import vn.clinic.cdm.entity.clinical.HealthMetric;
import java.util.List;
import java.util.UUID;

/**
 * Output Port: Interface for retrieving health metrics, decoupled from JPA.
 */
public interface HealthMetricRepositoryPort {
    List<HealthMetric> findLatestMetricsByPatientId(UUID patientId);
}
