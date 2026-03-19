package vn.clinic.cdm.service.identity;

import vn.clinic.cdm.entity.identity.IdentityUser;
import vn.clinic.cdm.entity.identity.IdentityUserRole;

import java.util.List;
import java.util.UUID;

public interface IdentityService {
    IdentityUser getUserById(UUID id);
    IdentityUser getActiveUserByEmail(String email);
    IdentityUser getActiveUserByUsername(String username);
    List<IdentityUserRole> getUserRolesForTenant(UUID userId, UUID tenantId);
    List<String> getRoleCodesForUserInTenantAndBranch(UUID userId, UUID tenantId, UUID branchId);
    List<String> getPermissionCodesForUserInTenantAndBranch(UUID userId, UUID tenantId, UUID branchId);
    void updateLastLoginAt(IdentityUser user);
    boolean existsByEmail(String email);
    IdentityUser saveUser(IdentityUser user);
    void assignRole(UUID userId, UUID tenantId, UUID branchId, String roleCode);
}
