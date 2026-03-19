package vn.clinic.cdm.common.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import vn.clinic.cdm.entity.clinical.HealthMetric;
import vn.clinic.cdm.repository.clinical.HealthMetricRepository;

import java.util.List;
import java.util.UUID;

/**
 * Persistence Adapter implementing Outward Port.
 * Decouples Use Case from direct Spring Data JPA Repository.
 */
@Component
@RequiredArgsConstructor
public class HealthMetricPersistenceAdapter implements HealthMetricRepositoryPort {

    private final HealthMetricRepository repository;

    @Override
    public List<HealthMetric> findLatestMetricsByPatientId(UUID patientId) {
        return repository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }
}
