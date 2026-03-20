package vn.clinic.cdm.service.admin.impl;

import lombok.RequiredArgsConstructor;
import vn.clinic.cdm.dto.auth.*;
import vn.clinic.cdm.dto.common.PagedResponse;
import vn.clinic.cdm.dto.clinical.AuditLogDto;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.exception.ApiException;
import vn.clinic.cdm.exception.ErrorCode;
import org.springframework.http.HttpStatus;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.cdm.entity.identity.IdentityRole;
import vn.clinic.cdm.entity.identity.IdentityUser;
import vn.clinic.cdm.entity.identity.IdentityUserRole;
import vn.clinic.cdm.repository.identity.IdentityRoleRepository;
import vn.clinic.cdm.repository.identity.IdentityUserRepository;
import vn.clinic.cdm.repository.identity.IdentityUserRoleRepository;
import vn.clinic.cdm.entity.tenant.Tenant;
import vn.clinic.cdm.entity.tenant.TenantBranch;
import vn.clinic.cdm.service.tenant.TenantService;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import vn.clinic.cdm.service.common.AuditLogService;
import vn.clinic.cdm.repository.common.AuditLogRepository;
import vn.clinic.cdm.repository.common.SystemSettingRepository;
import vn.clinic.cdm.repository.identity.IdentityPermissionRepository;
import vn.clinic.cdm.repository.identity.IdentityRolePermissionRepository;
import vn.clinic.cdm.entity.common.AuditLog;
import vn.clinic.cdm.entity.common.SystemSetting;
import vn.clinic.cdm.entity.identity.IdentityRolePermission;
import vn.clinic.cdm.dto.admin.SystemSettingDto;
import vn.clinic.cdm.dto.admin.AdminDashboardDto;
import vn.clinic.cdm.repository.tenant.TenantRepository;
import vn.clinic.cdm.repository.tenant.TenantBranchRepository;
import vn.clinic.cdm.repository.patient.PatientRepository;

import vn.clinic.cdm.service.admin.AdminService;

/**
 * Admin – quản lý user, gán role theo tenant/branch. Chỉ role ADMIN.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

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
        private final TenantRepository tenantRepository;
        private final TenantBranchRepository tenantBranchRepository;
        private final PatientRepository patientRepository;

        @Transactional(readOnly = true)
        public AdminDashboardDto getDashboard() {
                long totalUsers = identityUserRepository.count();
                long activeUsers = identityUserRepository.countByIsActive(true);
                long totalRoles = identityRoleRepository.count();
                long totalTenants = tenantRepository.count();
                long totalBranches = tenantBranchRepository.count();
                long totalPatients = patientRepository.count();
                long highRiskPatients = patientRepository.countByRiskLevelIn(
                        java.util.List.of("HIGH", "CRITICAL"));

                // Audit log counts for today
                java.time.Instant startOfDay = java.time.LocalDate.now()
                        .atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
                long todayLogs = auditLogRepository.countByCreatedAtAfter(startOfDay);
                long failedLogs = auditLogRepository.countByStatusAndCreatedAtAfter("FAILED", startOfDay);

                // Count doctors from user roles
                long totalDoctors = identityUserRoleRepository.countDistinctUserByRoleCode("DOCTOR");

                return AdminDashboardDto.builder()
                        .totalUsers(totalUsers)
                        .activeUsers(activeUsers)
                        .totalPatients(totalPatients)
                        .totalDoctors(totalDoctors)
                        .totalRoles(totalRoles)
                        .totalTenants(totalTenants)
                        .totalBranches(totalBranches)
                        .todayAuditLogs(todayLogs)
                        .failedAuditLogs(failedLogs)
                        .highRiskPatients(highRiskPatients)
                        .build();
        }

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
                                .username(request.getEmail().trim().toLowerCase()) // Set username to email
                                .email(request.getEmail().trim().toLowerCase())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .fullNameVi(request.getFullNameVi().trim())
                                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                                .isActive(true)
                                .tenant(request.getTenantId() != null ? tenantService.getById(request.getTenantId()) : null)
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

        @Transactional
        public void deleteUser(UUID userId) {
                IdentityUser user = identityUserRepository.findById(userId)
                                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
                
                // Remove all role assignments first
                List<IdentityUserRole> roles = identityUserRoleRepository.findByUserId(userId);
                identityUserRoleRepository.deleteAll(roles);
                identityUserRoleRepository.flush();

                
                String email = user.getEmail();
                identityUserRepository.delete(user);
                
                auditLogService.log("DELETE", "USER", userId.toString(),
                                "Xóa người dùng: " + email);
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
        public PagedResponse<AuditLogDto> listAuditLogs(UUID tenantId, String action, java.time.Instant startDate, Pageable pageable) {
                // Nếu không truyền tenantId, admin có thể xem tất cả (hoặc lọc theo TenantContext nếu cần)
                // Tuy nhiên ở role ADMIN hệ thống, thường muốn xem tất cả log nếu không chọn tenant cụ thể.
                
                org.springframework.data.domain.Page<AuditLog> page = auditLogRepository
                                .findWithFilters(tenantId, action, startDate, pageable);

                List<UUID> userIds = page.getContent().stream()
                        .map(AuditLog::getUserId)
                        .filter(id -> id != null)
                        .distinct()
                        .collect(Collectors.toList());
                
                java.util.Map<UUID, String> userNameMap = identityUserRepository.findAllById(userIds)
                        .stream()
                        .collect(Collectors.toMap(IdentityUser::getId, IdentityUser::getFullNameVi));

                List<AuditLogDto> content = page.getContent().stream()
                                .map(log -> AuditLogDto.fromEntity(log, log.getUserId() != null ? userNameMap.getOrDefault(log.getUserId(), log.getEmail()) : log.getEmail()))
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
