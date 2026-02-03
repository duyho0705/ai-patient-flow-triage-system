package vn.clinic.patientflow.masters.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.masters.domain.MedicalService;

import java.util.List;
import java.util.UUID;

public interface MedicalServiceRepository extends JpaRepository<MedicalService, UUID> {
    List<MedicalService> findByTenantIdOrderByCategoryAscNameViAsc(UUID tenantId);

    List<MedicalService> findByTenantIdAndIsActiveOrderByCategoryAscNameViAsc(UUID tenantId, boolean isActive);
}
