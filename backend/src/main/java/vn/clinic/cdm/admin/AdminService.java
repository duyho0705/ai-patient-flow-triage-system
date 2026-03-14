package vn.clinic.cdm.admin;

import lombok.RequiredArgsConstructor;
import vn.clinic.cdm.api.dto.auth.*;
import vn.clinic.cdm.api.dto.common.PagedResponse;
import vn.clinic.cdm.api.dto.clinical.AuditLogDto;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.common.exception.ApiException;
import vn.clinic.cdm.common.exception.ErrorCode;
import org.springframework.http.HttpStatus;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.cdm.identity.domain.IdentityRole;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.identity.domain.IdentityUserRole;
import vn.clinic.cdm.identity.repository.IdentityRoleRepository;
import vn.clinic.cdm.identity.repository.IdentityUserRepository;
import vn.clinic.cdm.identity.repository.IdentityUserRoleRepository;
import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.tenant.domain.TenantBranch;
import vn.clinic.cdm.tenant.service.TenantService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import vn.clinic.cdm.common.service.AuditLogService;
import vn.clinic.cdm.common.repository.AuditLogRepository;
import vn.clinic.cdm.common.repository.SystemSettingRepository;
import vn.clinic.cdm.identity.repository.IdentityPermissionRepository;
import vn.clinic.cdm.identity.repository.IdentityRolePermissionRepository;
import vn.clinic.cdm.common.domain.AuditLog;
import vn.clinic.cdm.common.domain.SystemSetting;
import vn.clinic.cdm.identity.domain.IdentityRolePermission;
import vn.clinic.cdm.api.dto.admin.SystemSettingDto;
import vn.clinic.cdm.common.tenant.TenantContext;

/**
 * Admin – quản lý user, gán role theo tenant/branch. Chỉ role ADMIN.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

        private final IdentityUserRepository identityUserRepository;
        private final IdentityUserRoleRepository identityUserRoleRepository;
        private final IdentityRoleRepository identityRoleRepository;
        private final TenantService tenantService;
        private final PasswordEncoder passwordEncoder;
        private final AuditLogService auditLogService;
        private final AuditLogRepository auditLogRepository;
        private final SystemSettingRepository systemSettingRepository;
        private final IdentityPermissionRepository identityPermissionRepository;
        private final IdentityRolePermissionRepository identityRolePermissionRepository;

        @Transactional(readOnly = true)
        public PagedResponse<AdminUserDto> listUsers(UUID tenantId, Pageable pageable) {
                org.springframework.data.domain.Page<IdentityUser> page = tenantId != null
                                ? identityUserRepository.findDistinctByTenantId(tenantId, pageable)
                                : identityUserRepository.findAll(pageable);
                List<AdminUserDto> content = page.getContent().stream()
                                .map(this::toAdminUserDto)
                                .collect(Collectors.toList());
                return PagedResponse.of(page, content);
        }

        @Transactional(readOnly = true)
        public AdminUserDto getUser(UUID userId) {
                log.debug("Fetching user details for ID: {}", userId);
                IdentityUser user = identityUserRepository.findById(userId)
                                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
                return toAdminUserDto(user);
        }

        @Transactional
        public AdminUserDto createUser(CreateUserRequest request) {
                log.info("Creating user: {}", request.getEmail());
                if (identityUserRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
                        throw new ApiException(ErrorCode.USER_ALREADY_EXISTS, HttpStatus.BAD_REQUEST, "Email đã tồn tại trên hệ thống");
                }
                IdentityUser user = IdentityUser.builder()
                                .email(request.getEmail().trim().toLowerCase())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .fullNameVi(request.getFullNameVi().trim())
                                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                                .isActive(true)
                                .build();
                user = identityUserRepository.save(user);

                saveRoleAssignment(user, request.getRoleCode(), request.getTenantId(), request.getBranchId());

                auditLogService.log("CREATE", "USER", user.getId().toString(),
                                "Tạo mới người dùng: " + user.getEmail());

                return toAdminUserDto(identityUserRepository.findById(user.getId()).orElse(user));
        }

        @Transactional
        public AdminUserDto updateUser(UUID userId, UpdateUserRequest request) {
                log.info("Updating user ID: {}", userId);
                IdentityUser user = identityUserRepository.findById(userId)
                                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
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
				if (ra.getTenantId() == null || ra.getRoleCode() == null)
					continue;
				saveRoleAssignment(user, ra.getRoleCode(), ra.getTenantId(), ra.getBranchId());
			}
		}

                auditLogService.log("UPDATE", "USER", userId.toString(),
                                "Cập nhật thông tin người dùng: " + user.getEmail());

                return toAdminUserDto(identityUserRepository.findById(userId).orElse(user));
        }

        @Transactional
        public void setPassword(UUID userId, SetPasswordRequest request) {
                IdentityUser user = identityUserRepository.findById(userId)
                                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
                user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
                identityUserRepository.save(user);
                auditLogService.log("SET_PASSWORD", "USER", userId.toString(),
                                "Đặt lại mật khẩu cho người dùng: " + user.getEmail());
        }

        @Transactional(readOnly = true)
        public List<RoleDto> getRoles() {
                return identityRoleRepository.findAll().stream()
                                .map(r -> {
                                        List<PermissionDto> perms = identityRolePermissionRepository.findByRoleId(r.getId())
                                                        .stream()
                                                        .map(rp -> PermissionDto.fromEntity(rp.getPermission()))
                                                        .collect(Collectors.toList());
                                        return RoleDto.fromEntity(r, perms);
                                })
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<PermissionDto> getPermissions() {
                return identityPermissionRepository.findAll().stream()
                                .map(PermissionDto::fromEntity)
                                .collect(Collectors.toList());
        }

        @Transactional
        public RoleDto createRole(RoleDto request) {
                IdentityRole roleToSave = IdentityRole.builder()
                                .code(request.getCode().toUpperCase())
                                .nameVi(request.getNameVi())
                                .description(request.getDescription())
                                .build();
                final IdentityRole role = identityRoleRepository.save(roleToSave);

                if (request.getPermissions() != null) {
                        for (PermissionDto p : request.getPermissions()) {
                                identityPermissionRepository.findByCode(p.getCode()).ifPresent(perm -> {
                                        identityRolePermissionRepository.save(IdentityRolePermission.builder()
                                                        .role(role)
                                                        .permission(perm)
                                                        .build());
                                });
                        }
                }
                return getRole(role.getId());
        }

        @Transactional(readOnly = true)
        public RoleDto getRole(UUID id) {
                IdentityRole r = identityRoleRepository.findById(id)
                                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy vai trò"));
                List<PermissionDto> perms = identityRolePermissionRepository.findByRoleId(r.getId())
                                .stream()
                                .map(rp -> PermissionDto.fromEntity(rp.getPermission()))
                                .collect(Collectors.toList());
                return RoleDto.fromEntity(r, perms);
        }

        @Transactional
        public RoleDto updateRole(UUID id, RoleDto request) {
                final IdentityRole role = identityRoleRepository.findById(id)
                                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy vai trò"));
                role.setNameVi(request.getNameVi());
                role.setDescription(request.getDescription());
                identityRoleRepository.save(role);

                if (request.getPermissions() != null) {
                        List<IdentityRolePermission> existing = identityRolePermissionRepository.findByRoleId(id);
                        identityRolePermissionRepository.deleteAll(existing);
                        for (PermissionDto p : request.getPermissions()) {
                                identityPermissionRepository.findByCode(p.getCode()).ifPresent(perm -> {
                                        identityRolePermissionRepository.save(IdentityRolePermission.builder()
                                                        .role(role)
                                                        .permission(perm)
                                                        .build());
                                });
                        }
                }
                return getRole(id);
        }

        @Transactional
        public void deleteRole(UUID id) {
                identityRoleRepository.deleteById(id);
        }

        @Transactional(readOnly = true)
        public PagedResponse<AuditLogDto> listAuditLogs(UUID tenantId, Pageable pageable) {
                if (tenantId == null)
                        tenantId = TenantContext.getTenantId().orElse(null);

                org.springframework.data.domain.Page<AuditLog> page = auditLogRepository
                                .findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);

		List<AuditLogDto> content = page.getContent().stream()
				.map(AuditLogDto::fromEntity)
				.collect(Collectors.toList());

                return PagedResponse.of(page, content);
        }

        @Transactional(readOnly = true)
        public List<SystemSettingDto> listSystemSettings() {
                return systemSettingRepository.findAll().stream()
                                .map(SystemSettingDto::fromEntity)
                                .collect(Collectors.toList());
        }

        @Transactional
        public SystemSettingDto updateSystemSetting(String key, String value) {
                SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                                .orElse(SystemSetting.builder()
                                                .settingKey(key)
                                                .category("GENERAL")
                                                .build());
                setting.setSettingValue(value);
                setting = systemSettingRepository.save(setting);

                auditLogService.log("UPDATE_SETTING", "SYSTEM", setting.getId().toString(),
                                "Cập nhật cấu hình: " + key + " = " + value);

                return SystemSettingDto.fromEntity(setting);
        }

	private void saveRoleAssignment(IdentityUser user, String roleCode, UUID tenantId, UUID branchId) {
		IdentityRole role = identityRoleRepository.findByCode(roleCode)
				.orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy vai trò: " + roleCode));
		Tenant tenant = tenantService.getById(tenantId);
		TenantBranch branch = branchId != null
				? tenantService.getBranchById(branchId)
				: null;
		IdentityUserRole userRole = IdentityUserRole.builder()
				.user(user)
				.role(role)
				.tenant(tenant)
				.branch(branch)
				.build();
		identityUserRoleRepository.save(userRole);
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
                                        ur.getRole() != null ? ur.getRole().getCode() : null));
                }
                return AdminUserDto.fromEntity(user, assignments);
        }

}
