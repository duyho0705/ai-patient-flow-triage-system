package vn.clinic.cdm.service.identity.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.exception.ApiException;
import vn.clinic.cdm.exception.ErrorCode;
import vn.clinic.cdm.entity.identity.IdentityRole;
import vn.clinic.cdm.entity.identity.IdentityUser;
import vn.clinic.cdm.entity.identity.IdentityUserRole;
import vn.clinic.cdm.repository.identity.IdentityRolePermissionRepository;
import vn.clinic.cdm.repository.identity.IdentityRoleRepository;
import vn.clinic.cdm.repository.identity.IdentityUserRepository;
import vn.clinic.cdm.repository.identity.IdentityUserRoleRepository;
import vn.clinic.cdm.service.identity.IdentityService;
import vn.clinic.cdm.repository.tenant.TenantBranchRepository;
import vn.clinic.cdm.repository.tenant.TenantRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IdentityServiceImpl implements IdentityService {

    private final IdentityUserRepository identityUserRepository;
    private final IdentityUserRoleRepository identityUserRoleRepository;
    private final IdentityRoleRepository identityRoleRepository;
    private final TenantRepository tenantRepository;
    private final TenantBranchRepository tenantBranchRepository;
    private final IdentityRolePermissionRepository identityRolePermissionRepository;

    @Override
    @Transactional(readOnly = true)
    public IdentityUser getUserById(UUID id) {
        return identityUserRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", id);
                    return new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy người dùng");
                });
    }

    @Override
    @Transactional(readOnly = true)
    public IdentityUser getActiveUserByEmail(String email) {
        return identityUserRepository.findByEmailAndIsActiveTrue(email).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public IdentityUser getActiveUserByUsername(String username) {
        return identityUserRepository.findByUsernameAndIsActiveTrue(username).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IdentityUserRole> getUserRolesForTenant(UUID userId, UUID tenantId) {
        return identityUserRoleRepository.findByUserIdAndTenantId(userId, tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getRoleCodesForUserInTenantAndBranch(UUID userId, UUID tenantId, UUID branchId) {
        List<IdentityUserRole> list = identityUserRoleRepository
                .findByUserIdAndTenantIdAndBranchNullOrBranchId(userId, tenantId, branchId);
        return list.stream()
                .map(ur -> ur.getRole().getCode())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getPermissionCodesForUserInTenantAndBranch(UUID userId, UUID tenantId, UUID branchId) {
        List<IdentityUserRole> list = identityUserRoleRepository
                .findByUserIdAndTenantIdAndBranchNullOrBranchId(userId, tenantId, branchId);
        List<UUID> roleIds = list.stream()
                .map(ur -> ur.getRole().getId())
                .collect(Collectors.toList());
        if (roleIds.isEmpty())
            return List.of();
        return identityRolePermissionRepository.findPermissionCodesByRoleIds(roleIds);
    }

    @Override
    @Transactional
    public void updateLastLoginAt(IdentityUser user) {
        user.setLastLoginAt(Instant.now());
        identityUserRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return identityUserRepository.existsByEmail(email);
    }

    @Override
    @Transactional
    public IdentityUser saveUser(IdentityUser user) {
        return identityUserRepository.save(user);
    }

    @Override
    @Transactional
    public void assignRole(UUID userId, UUID tenantId, UUID branchId, String roleCode) {
        log.info("Assigning role {} to user {} in tenant {} (branch: {})", roleCode, userId, tenantId, branchId);
        IdentityUser user = getUserById(userId);
        IdentityRole role = identityRoleRepository.findByCode(roleCode)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Vai trò không hợp lệ: " + roleCode));

        IdentityUserRole userRole = new IdentityUserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRole.setTenant(tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy Tenant")));

        if (branchId != null) {
            userRole.setBranch(tenantBranchRepository.findById(branchId)
                    .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy Chi nhánh")));
        }

        identityUserRoleRepository.saveAndFlush(userRole);
        log.info("Role assigned successfully");
    }
}
