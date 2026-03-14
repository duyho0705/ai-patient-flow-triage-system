package vn.clinic.cdm.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.identity.domain.IdentityPermission;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdentityPermissionRepository extends JpaRepository<IdentityPermission, UUID> {
    Optional<IdentityPermission> findByCode(String code);
}
