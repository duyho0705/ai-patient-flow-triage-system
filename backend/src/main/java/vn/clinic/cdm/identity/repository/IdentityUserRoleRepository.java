package vn.clinic.cdm.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.clinic.cdm.identity.domain.IdentityUserRole;

import java.util.List;
import java.util.UUID;

public interface IdentityUserRoleRepository extends JpaRepository<IdentityUserRole, UUID> {

    List<IdentityUserRole> findByUserId(UUID userId);

    List<IdentityUserRole> findByUserIdAndTenantId(UUID userId, UUID tenantId);

    /**
     * Roles Ã¡p dá»¥ng cho user trong tenant táº¡i chi nhÃ¡nh: (branch_id IS NULL hoáº·c branch_id = :branchId).
     */
    @Query("SELECT ur FROM IdentityUserRole ur WHERE ur.user.id = :userId AND ur.tenant.id = :tenantId " +
           "AND (ur.branch IS NULL OR ur.branch.id = :branchId)")
    List<IdentityUserRole> findByUserIdAndTenantIdAndBranchNullOrBranchId(
            @Param("userId") UUID userId,
            @Param("tenantId") UUID tenantId,
            @Param("branchId") UUID branchId);

    List<IdentityUserRole> findByTenantId(UUID tenantId);
}

