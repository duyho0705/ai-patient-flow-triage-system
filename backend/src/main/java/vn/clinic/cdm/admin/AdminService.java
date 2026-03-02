package vn.clinic.cdm.admin;

import lombok.RequiredArgsConstructor;
import vn.clinic.cdm.api.dto.auth.*;
import vn.clinic.cdm.api.dto.common.PagedResponse;
import vn.clinic.cdm.api.dto.clinical.AuditLogDto;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.common.exception.ResourceNotFoundException;
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

/**
 * Admin â€“ quáº£n lÃ½ user, gÃ¡n role theo tenant/branch. Chá»‰ role ADMIN.
 */
@Service
@RequiredArgsConstructor
public class AdminService {

        private final IdentityUserRepository identityUserRepository;
        private final IdentityUserRoleRepository identityUserRoleRepository;
        private final IdentityRoleRepository identityRoleRepository;
        private final TenantService tenantService;
        private final PasswordEncoder passwordEncoder;
        private final vn.clinic.cdm.common.service.AuditLogService auditLogService;

        private final vn.clinic.cdm.common.repository.AuditLogRepository auditLogRepository;

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
                IdentityUser user = identityUserRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("IdentityUser", userId));
                return toAdminUserDto(user);
        }

        @Transactional
        public AdminUserDto createUser(CreateUserRequest request) {
                if (identityUserRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
                        throw new IllegalArgumentException("Email Ä‘Ã£ tá»“n táº¡i");
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
                                .orElseThrow(() -> new ResourceNotFoundException("IdentityRole",
                                                request.getRoleCode()));
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

                auditLogService.log("CREATE", "USER", user.getId().toString(),
                                "Táº¡o má»›i ngÆ°á»i dÃ¹ng: " + user.getEmail());

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
                                if (ra.getTenantId() == null || ra.getRoleCode() == null)
                                        continue;
                                IdentityRole role = identityRoleRepository.findByCode(ra.getRoleCode())
                                                .orElseThrow(() -> new ResourceNotFoundException("IdentityRole",
                                                                ra.getRoleCode()));
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

                auditLogService.log("UPDATE", "USER", userId.toString(),
                                "Cáº­p nháº­t thÃ´ng tin ngÆ°á»i dÃ¹ng: " + user.getEmail());

                return toAdminUserDto(identityUserRepository.findById(userId).orElse(user));
        }

        @Transactional
        public void setPassword(UUID userId, SetPasswordRequest request) {
                IdentityUser user = identityUserRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("IdentityUser", userId));
                user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
                identityUserRepository.save(user);
                auditLogService.log("SET_PASSWORD", "USER", userId.toString(),
                                "Äáº·t láº¡i máº­t kháº©u cho ngÆ°á»i dÃ¹ng: " + user.getEmail());
        }

        @Transactional(readOnly = true)
        public List<RoleDto> getRoles() {
                return identityRoleRepository.findAll().stream()
                                .map(RoleDto::fromEntity)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public PagedResponse<AuditLogDto> listAuditLogs(UUID tenantId, Pageable pageable) {
                if (tenantId == null)
                        tenantId = vn.clinic.cdm.common.tenant.TenantContext.getTenantId().orElse(null);

                org.springframework.data.domain.Page<vn.clinic.cdm.common.domain.AuditLog> page = auditLogRepository
                                .findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);

                List<AuditLogDto> content = page.getContent().stream()
                                .map((vn.clinic.cdm.common.domain.AuditLog l) -> AuditLogDto.builder()
                                                .id(l.getId())
                                                .userId(l.getUserId())
                                                .userEmail(l.getEmail())
                                                .action(l.getAction())
                                                .details(l.getDetails())
                                                .ipAddress(l.getIpAddress())
                                                .userAgent(l.getUserAgent())
                                                .timestamp(l.getCreatedAt())
                                                .status(l.getStatus())
                                                .build())
                                .collect(Collectors.toList());

                return PagedResponse.of(page, content);
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
