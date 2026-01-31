package vn.clinic.patientflow.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.identity.domain.IdentityRole;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.domain.IdentityUserRole;
import vn.clinic.patientflow.identity.repository.IdentityRoleRepository;
import vn.clinic.patientflow.identity.repository.IdentityUserRepository;
import vn.clinic.patientflow.identity.repository.IdentityUserRoleRepository;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.service.TenantService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Admin – quản lý user, gán role theo tenant/branch. Chỉ role ADMIN.
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final IdentityUserRepository identityUserRepository;
    private final IdentityUserRoleRepository identityUserRoleRepository;
    private final IdentityRoleRepository identityRoleRepository;
    private final TenantService tenantService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PagedResponse<AdminUserDto> listUsers(UUID tenantId, Pageable pageable) {
        Page<IdentityUser> page = tenantId != null
                ? identityUserRepository.findDistinctByTenantId(tenantId, pageable)
                : identityUserRepository.findAll(pageable);
        List<AdminUserDto> content = page.getContent().stream()
                .map(this::toAdminUserDto)
                .collect(Collectors.toList());
        return PagedResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public AdminUserDto getUser(UUID userId) {
        IdentityUser user = identityUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("IdentityUser", userId));
        return toAdminUserDto(user);
    }

    @Transactional
    public AdminUserDto createUser(CreateUserRequest request) {
        if (identityUserRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        IdentityUser user = IdentityUser.builder()
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullNameVi(request.getFullNameVi().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .isActive(true)
                .build();
        user = identityUserRepository.save(user);

        IdentityRole role = identityRoleRepository.findByCode(request.getRoleCode())
                .orElseThrow(() -> new ResourceNotFoundException("IdentityRole", request.getRoleCode()));
        Tenant tenant = tenantService.getById(request.getTenantId());
        TenantBranch branch = request.getBranchId() != null
                ? tenantService.getBranchById(request.getBranchId())
                : null;
        IdentityUserRole userRole = IdentityUserRole.builder()
                .user(user)
                .role(role)
                .tenant(tenant)
                .branch(branch)
                .build();
        identityUserRoleRepository.save(userRole);

        return toAdminUserDto(identityUserRepository.findById(user.getId()).orElse(user));
    }

    @Transactional
    public AdminUserDto updateUser(UUID userId, UpdateUserRequest request) {
        IdentityUser user = identityUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("IdentityUser", userId));
        if (request.getFullNameVi() != null && !request.getFullNameVi().isBlank()) {
            user.setFullNameVi(request.getFullNameVi().trim());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim().isEmpty() ? null : request.getPhone().trim());
        }
        identityUserRepository.save(user);

        if (request.getRoleAssignments() != null) {
            List<IdentityUserRole> existing = identityUserRoleRepository.findByUserId(userId);
            identityUserRoleRepository.deleteAll(existing);
            for (UpdateUserRequest.UserRoleAssignmentInput ra : request.getRoleAssignments()) {
                if (ra.getTenantId() == null || ra.getRoleCode() == null) continue;
                IdentityRole role = identityRoleRepository.findByCode(ra.getRoleCode())
                        .orElseThrow(() -> new ResourceNotFoundException("IdentityRole", ra.getRoleCode()));
                Tenant tenant = tenantService.getById(ra.getTenantId());
                TenantBranch branch = ra.getBranchId() != null
                        ? tenantService.getBranchById(ra.getBranchId())
                        : null;
                IdentityUserRole newRole = IdentityUserRole.builder()
                        .user(user)
                        .role(role)
                        .tenant(tenant)
                        .branch(branch)
                        .build();
                identityUserRoleRepository.save(newRole);
            }
        }

        return toAdminUserDto(identityUserRepository.findById(userId).orElse(user));
    }

    @Transactional
    public void setPassword(UUID userId, SetPasswordRequest request) {
        IdentityUser user = identityUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("IdentityUser", userId));
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        identityUserRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<RoleDto> getRoles() {
        return identityRoleRepository.findAll().stream()
                .map(RoleDto::fromEntity)
                .collect(Collectors.toList());
    }

    private AdminUserDto toAdminUserDto(IdentityUser user) {
        List<IdentityUserRole> roles = identityUserRoleRepository.findByUserId(user.getId());
        List<UserRoleAssignmentDto> assignments = new ArrayList<>();
        for (IdentityUserRole ur : roles) {
            String tenantName = ur.getTenant() != null ? ur.getTenant().getNameVi() : null;
            UUID branchId = ur.getBranch() != null ? ur.getBranch().getId() : null;
            String branchName = ur.getBranch() != null ? ur.getBranch().getNameVi() : null;
            UUID tenantId = ur.getTenant() != null ? ur.getTenant().getId() : null;
            assignments.add(new UserRoleAssignmentDto(
                    tenantId, tenantName, branchId, branchName,
                    ur.getRole() != null ? ur.getRole().getCode() : null
            ));
        }
        return AdminUserDto.fromEntity(user, assignments);
    }
}
