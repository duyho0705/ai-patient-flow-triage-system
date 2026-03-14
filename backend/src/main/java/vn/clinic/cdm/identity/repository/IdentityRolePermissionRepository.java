package vn.clinic.cdm.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.identity.domain.IdentityRolePermission;
import java.util.List;
import java.util.UUID;

@Repository
public interface IdentityRolePermissionRepository extends JpaRepository<IdentityRolePermission, UUID> {

    @Query("SELECT rp.permission.code FROM IdentityRolePermission rp WHERE rp.role.id IN :roleIds")
    List<String> findPermissionCodesByRoleIds(List<UUID> roleIds);

    List<IdentityRolePermission> findByRoleId(UUID roleId);
}
