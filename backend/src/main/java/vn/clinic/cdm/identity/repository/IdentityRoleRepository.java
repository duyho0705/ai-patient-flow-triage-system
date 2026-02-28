package vn.clinic.cdm.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.identity.domain.IdentityRole;

import java.util.Optional;
import java.util.UUID;

public interface IdentityRoleRepository extends JpaRepository<IdentityRole, UUID> {

    Optional<IdentityRole> findByCode(String code);

    boolean existsByCode(String code);
}

