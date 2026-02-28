package vn.clinic.cdm.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.clinical.domain.PrescriptionTemplate;
import java.util.List;
import java.util.UUID;

public interface PrescriptionTemplateRepository extends JpaRepository<PrescriptionTemplate, UUID> {
    List<PrescriptionTemplate> findByTenantId(UUID tenantId);

    List<PrescriptionTemplate> findByTenantIdAndCreatedBy(UUID tenantId, UUID createdBy);
}

