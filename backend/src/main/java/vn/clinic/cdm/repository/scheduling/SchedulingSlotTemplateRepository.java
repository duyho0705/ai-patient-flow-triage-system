package vn.clinic.cdm.repository.scheduling;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.scheduling.SchedulingSlotTemplate;

import java.util.List;
import java.util.UUID;

public interface SchedulingSlotTemplateRepository extends JpaRepository<SchedulingSlotTemplate, UUID> {

    List<SchedulingSlotTemplate> findByTenantIdAndIsActiveTrueOrderByStartTime(UUID tenantId);
}

