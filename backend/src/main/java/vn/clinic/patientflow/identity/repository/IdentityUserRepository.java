package vn.clinic.patientflow.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.identity.domain.IdentityUser;

import java.util.Optional;
import java.util.UUID;

public interface IdentityUserRepository extends JpaRepository<IdentityUser, UUID> {

    Optional<IdentityUser> findByEmail(String email);

    Optional<IdentityUser> findByEmailAndIsActiveTrue(String email);

    boolean existsByEmail(String email);
}
