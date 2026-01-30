package vn.clinic.patientflow.tenant.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.clinic.patientflow.tenant.domain.Tenant;

import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    Optional<Tenant> findByCode(String code);

    @Query("SELECT t FROM Tenant t WHERE t.code = :code AND t.isActive = true")
    Optional<Tenant> findActiveByCode(String code);

    boolean existsByCode(String code);
}
