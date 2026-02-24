package vn.clinic.patientflow.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.api.dto.AuthUserDto;
import vn.clinic.patientflow.api.dto.LoginRequest;
import vn.clinic.patientflow.api.dto.LoginResponse;
import vn.clinic.patientflow.config.JwtProperties;
import vn.clinic.patientflow.config.JwtUtil;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.service.IdentityService;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Xác thực đăng nhập – kiểm tra mật khẩu, resolve roles theo tenant/branch,
 * phát JWT.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final IdentityService identityService;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final PasswordEncoder passwordEncoder;

    /**
     * Đăng nhập: kiểm tra email/password, lấy roles theo tenant (và branch nếu có),
     * phát JWT.
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        IdentityUser user = identityService.getActiveUserByEmail(request.getEmail().trim().toLowerCase());
        if (user == null || user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            log.warn("Login failed: User not found or no password set for email {}", request.getEmail());
            throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Login failed: Password mismatch for email {}", request.getEmail());
            throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
        }
        UUID tenantId = request.getTenantId();
        UUID branchId = request.getBranchId();
        List<String> roles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId, branchId);
        if (roles.isEmpty()) {
            log.warn("Login failed: No roles found for user {} in tenant {}", request.getEmail(), tenantId);
            throw new BadCredentialsException("Bạn không có quyền truy cập tenant/chi nhánh này");
        }
        identityService.updateLastLoginAt(user);
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getExpirationMs());
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), tenantId, branchId, roles);
        AuthUserDto userDto = AuthUserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullNameVi(user.getFullNameVi())
                .roles(roles)
                .tenantId(tenantId)
                .branchId(branchId)
                .build();
        return LoginResponse.builder()
                .token(token)
                .expiresAt(expiresAt)
                .user(userDto)
                .build();
    }

    @Transactional
    public LoginResponse register(vn.clinic.patientflow.api.dto.RegisterRequest request) {
        if (identityService.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email này đã được sử dụng");
        }

        IdentityUser user = new IdentityUser();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setFullNameVi(request.getFullNameVi());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        user = identityService.saveUser(user);

        // Assign default role 'patient' for public registration
        identityService.assignRole(user.getId(), request.getTenantId(), request.getBranchId(), "patient");

        return login(new LoginRequest(request.getEmail(), request.getPassword(), request.getTenantId(),
                request.getBranchId()));
    }

    @Transactional
    public void changePassword(UUID userId, vn.clinic.patientflow.api.dto.ChangePasswordRequest request) {
        IdentityUser user = identityService.getUserById(userId);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        identityService.saveUser(user);
    }
}
