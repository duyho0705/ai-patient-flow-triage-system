package vn.clinic.patientflow.identity.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.clinic.patientflow.identity.domain.IdentityUser;

import java.util.Optional;
import java.util.UUID;

public interface IdentityUserRepository extends JpaRepository<IdentityUser, UUID> {

    Optional<IdentityUser> findByEmail(String email);

    Optional<IdentityUser> findByEmailAndIsActiveTrue(String email);

    boolean existsByEmail(String email);

    /** User có ít nhất một role trong tenant (cho admin list). */
    @Query("SELECT DISTINCT u FROM IdentityUser u JOIN u.userRoles ur WHERE ur.tenant.id = :tenantId")
    Page<IdentityUser> findDistinctByTenantId(@Param("tenantId") UUID tenantId, Pageable pageable);
}
