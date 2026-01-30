package vn.clinic.patientflow.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.identity.domain.IdentityUserRole;

import java.util.List;
import java.util.UUID;

public interface IdentityUserRoleRepository extends JpaRepository<IdentityUserRole, UUID> {

    List<IdentityUserRole> findByUserId(UUID userId);

    List<IdentityUserRole> findByUserIdAndTenantId(UUID userId, UUID tenantId);

    List<IdentityUserRole> findByTenantId(UUID tenantId);
}
