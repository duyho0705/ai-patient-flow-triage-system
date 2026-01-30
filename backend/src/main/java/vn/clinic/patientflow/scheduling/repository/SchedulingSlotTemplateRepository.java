package vn.clinic.patientflow.scheduling.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.scheduling.domain.SchedulingSlotTemplate;

import java.util.List;
import java.util.UUID;

public interface SchedulingSlotTemplateRepository extends JpaRepository<SchedulingSlotTemplate, UUID> {

    List<SchedulingSlotTemplate> findByTenantIdAndIsActiveTrueOrderByStartTime(UUID tenantId);
}
