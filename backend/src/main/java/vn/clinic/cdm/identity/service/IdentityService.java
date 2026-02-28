package vn.clinic.cdm.identity.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.common.exception.ResourceNotFoundException;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.identity.domain.IdentityUserRole;
import vn.clinic.cdm.identity.repository.IdentityUserRepository;
import vn.clinic.cdm.identity.repository.IdentityUserRoleRepository;
import vn.clinic.cdm.identity.repository.IdentityRoleRepository;
import vn.clinic.cdm.tenant.repository.TenantBranchRepository;
import vn.clinic.cdm.tenant.repository.TenantRepository;
import vn.clinic.cdm.identity.domain.IdentityRole;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Identity (user, roles) â€“ lookup and tenant-scoped role resolution.
 */
@Service
@RequiredArgsConstructor
public class IdentityService {

    private final IdentityUserRepository identityUserRepository;
    private final IdentityUserRoleRepository identityUserRoleRepository;
    private final IdentityRoleRepository identityRoleRepository;
    private final TenantRepository tenantRepository;
    private final TenantBranchRepository tenantBranchRepository;

    @Transactional(readOnly = true)
    public IdentityUser getUserById(UUID id) {
        return identityUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IdentityUser", id));
    }

    @Transactional(readOnly = true)
    public IdentityUser getActiveUserByEmail(String email) {
        return identityUserRepository.findByEmailAndIsActiveTrue(email).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<IdentityUserRole> getUserRolesForTenant(UUID userId, UUID tenantId) {
        return identityUserRoleRepository.findByUserIdAndTenantId(userId, tenantId);
    }

    /**
     * Role codes Ã¡p dá»¥ng cho user trong tenant táº¡i chi nhÃ¡nh (branch_id IS NULL
     * hoáº·c = branchId).
     */
    @Transactional(readOnly = true)
    public List<String> getRoleCodesForUserInTenantAndBranch(UUID userId, UUID tenantId, UUID branchId) {
        List<IdentityUserRole> list = identityUserRoleRepository
                .findByUserIdAndTenantIdAndBranchNullOrBranchId(userId, tenantId, branchId);
        return list.stream()
                .map(ur -> ur.getRole().getCode())
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateLastLoginAt(IdentityUser user) {
        user.setLastLoginAt(Instant.now());
        identityUserRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return identityUserRepository.existsByEmail(email);
    }

    @Transactional
    public IdentityUser saveUser(IdentityUser user) {
        return identityUserRepository.save(user);
    }

    @Transactional
    public void assignRole(UUID userId, UUID tenantId, UUID branchId, String roleCode) {
        IdentityUser user = getUserById(userId);
        IdentityRole role = identityRoleRepository.findByCode(roleCode)
                .orElseThrow(() -> new ResourceNotFoundException("Role", roleCode));

        IdentityUserRole userRole = new IdentityUserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRole.setTenant(tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId)));

        if (branchId != null) {
            userRole.setBranch(tenantBranchRepository.findById(branchId)
                    .orElseThrow(() -> new ResourceNotFoundException("TenantBranch", branchId)));
        }

        identityUserRoleRepository.save(userRole);
    }
}

