package vn.clinic.cdm.repository.identity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.entity.identity.IdentityPermission;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdentityPermissionRepository extends JpaRepository<IdentityPermission, UUID> {
    Optional<IdentityPermission> findByCode(String code);
}
