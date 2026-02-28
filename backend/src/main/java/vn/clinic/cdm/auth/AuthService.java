package vn.clinic.cdm.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.api.dto.auth.AuthUserDto;
import vn.clinic.cdm.api.dto.auth.LoginRequest;
import vn.clinic.cdm.api.dto.auth.LoginResponse;
import vn.clinic.cdm.config.JwtProperties;
import vn.clinic.cdm.config.JwtUtil;
import vn.clinic.cdm.common.ManagementConstants;
import vn.clinic.cdm.common.exception.ApiException;
import vn.clinic.cdm.common.exception.ErrorCode;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.identity.service.IdentityService;
import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.tenant.repository.TenantRepository;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import vn.clinic.cdm.api.dto.auth.SocialLoginRequest;

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
    private final TenantRepository tenantRepository;
    private final RegisterService registerService;
    private final vn.clinic.cdm.identity.repository.RefreshTokenRepository refreshTokenRepository;
    private final vn.clinic.cdm.common.service.AuditService auditService;

    /**
     * Đăng nhập: kiểm tra email/password, lấy roles theo tenant (và branch nếu có),
     * phát JWT.
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        IdentityUser user = identityService.getActiveUserByEmail(request.getEmail());
        if (user == null || user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            log.warn("Login failed: User not found or no password set for email {}", request.getEmail());
            throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Login failed: Password mismatch for email {}", request.getEmail());
            throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
        }
        UUID tenantId = request.getTenantId();
        if (tenantId == null && user.getTenant() != null) {
            tenantId = user.getTenant().getId();
        }
        UUID branchId = request.getBranchId();
        List<String> roles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId, branchId);
        List<String> permissions = identityService.getPermissionCodesForUserInTenantAndBranch(user.getId(), tenantId,
                branchId);
        if (roles.isEmpty()) {
            log.warn("Login failed: No roles found for user {} in tenant {}", request.getEmail(), tenantId);
            throw new BadCredentialsException("Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p tenant/chi nhÃ¡nh nÃ y");
        }
        identityService.updateLastLoginAt(user);
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getExpirationMs());
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), tenantId, branchId, roles,
                permissions, user.getTokenVersion());
        String refreshToken = createRefreshToken(user);

        // Audit Logging
        auditService.logSuccess(user.getId(), user.getEmail(), "LOGIN", "Logged in via Email/Password", null, null);

        AuthUserDto userDto = AuthUserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullNameVi(user.getFullNameVi())
                .roles(roles)
                .tenantId(tenantId)
                .branchId(branchId)
                .build();

        return LoginResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken) // Added temporarily for controller to set cookie
                .expiresAt(expiresAt)
                .user(userDto)
                .build();
    }

    @Transactional
    public LoginResponse register(vn.clinic.cdm.api.dto.auth.RegisterRequest request) {
        if (identityService.existsByEmail(request.getEmail())) {
            throw new ApiException(ErrorCode.RESOURCE_ALREADY_EXISTS, HttpStatus.BAD_REQUEST,
                    "Email này đã được sử dụng");
        }

        registerService.registerNewPatient(
                request.getEmail(),
                request.getFullNameVi(),
                request.getPassword(),
                request.getTenantId(),
                request.getBranchId());

        return login(new LoginRequest(request.getEmail(), request.getPassword(), request.getTenantId(),
                request.getBranchId()));
    }

    @Transactional
    public LoginResponse socialLogin(SocialLoginRequest request) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
            String email = decodedToken.getEmail();

            // Fallback for providers that don't always return email (like Facebook)
            if (email == null || email.isBlank()) {
                log.warn("Social login token has no email. Falling back to UID based identifier for UID: {}",
                        decodedToken.getUid());
                email = decodedToken.getUid() + "@social-login.local";
            }
            email = email.trim().toLowerCase();

            IdentityUser user = identityService.getActiveUserByEmail(email);
            UUID tenantId = request.getTenantId();
            UUID branchId = request.getBranchId();

            if (tenantId == null) {
                if (user != null && user.getTenant() != null) {
                    tenantId = user.getTenant().getId();
                } else {
                    throw new ApiException(ErrorCode.AUTH_TENANT_REQUIRED, HttpStatus.BAD_REQUEST,
                            "REQUIRE_TENANT_SELECTION");
                }
            }

            if (user == null) {
                // Register new user automatically using RegisterService
                String name = decodedToken.getName() != null ? decodedToken.getName() : "Người dùng Social";
                user = registerService.registerNewPatient(email, name, null, tenantId, branchId);
            }

            List<String> roles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId, branchId);
            if (roles.isEmpty()) {
                // User exists but has no roles here -> add patient role
                identityService.assignRole(user.getId(), tenantId, branchId, ManagementConstants.Roles.PATIENT);
                roles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId, branchId);

                Tenant tenant = tenantRepository.findById(tenantId).orElse(null);
                if (tenant != null) {
                    registerService.createPatientProfile(user, tenant);
                }
            }

            List<String> permissions = identityService.getPermissionCodesForUserInTenantAndBranch(user.getId(),
                    tenantId, branchId);
            identityService.updateLastLoginAt(user);
            Instant expiresAt = Instant.now().plusMillis(jwtProperties.getExpirationMs());
            String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), tenantId, branchId, roles,
                    permissions, user.getTokenVersion());
            String refreshToken = createRefreshToken(user);

            auditService.logSuccess(user.getId(), user.getEmail(), "SOCIAL_LOGIN", "Logged in via Social Provider",
                    null, null);

            AuthUserDto userDto = AuthUserDto.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullNameVi(user.getFullNameVi())
                    .roles(roles)
                    .tenantId(tenantId)
                    .branchId(branchId)
                    .build();
            return LoginResponse.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .expiresAt(expiresAt)
                    .user(userDto)
                    .build();

        } catch (BadCredentialsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Firebase social login failed", e);
            throw new ApiException(ErrorCode.AUTH_SOCIAL_LOGIN_FAILED, HttpStatus.UNAUTHORIZED, e.getMessage());
        }
    }

    @Transactional
    public String createRefreshToken(IdentityUser user) {
        // Delete existing refresh tokens for this user (optional: logout from all
        // devices)
        // For simple rotation, we can keep multiple or just one.
        // Let's delete old ones to be strict (Single active session per user)
        refreshTokenRepository.deleteByUser(user);

        String token = jwtUtil.generateRefreshToken(user.getId());
        vn.clinic.cdm.identity.domain.RefreshToken refreshToken = vn.clinic.cdm.identity.domain.RefreshToken.builder()
                .user(user)
                .token(token)
                .expiryDate(Instant.now().plusMillis(jwtProperties.getRefreshExpirationMs()))
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    @Transactional
    public LoginResponse rotateRefreshToken(String requestToken) {
        return refreshTokenRepository.findByToken(requestToken)
                .map(token -> {
                    if (token.isExpired()) {
                        refreshTokenRepository.delete(token);
                        throw new ApiException(ErrorCode.AUTH_BAD_CREDENTIALS, HttpStatus.UNAUTHORIZED,
                                "Refresh token expired");
                    }

                    IdentityUser user = token.getUser();
                    // Rotation: Generate new access + new refresh, revoke old refresh
                    refreshTokenRepository.delete(token);

                    // We need tenant/branch info for the new access token.
                    // Simplified: Use the user's primary tenant or previous context.
                    // Better: Store tenantId/branchId in RefreshToken entity.
                    // For now, let's assume primary tenant or just re-login if needed.
                    // But in Enterprise, we usually store context in RefreshToken.

                    UUID tenantId = user.getTenant() != null ? user.getTenant().getId() : null;
                    List<String> roles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId,
                            null);
                    List<String> permissions = identityService.getPermissionCodesForUserInTenantAndBranch(user.getId(),
                            tenantId, null);

                    String newAccessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), tenantId, null, roles,
                            permissions, user.getTokenVersion());
                    String newRefreshToken = createRefreshToken(user);

                    AuthUserDto userDto = AuthUserDto.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .fullNameVi(user.getFullNameVi())
                            .roles(roles)
                            .tenantId(tenantId)
                            .build();

                    return LoginResponse.builder()
                            .token(newAccessToken)
                            .refreshToken(newRefreshToken)
                            .expiresAt(Instant.now().plusMillis(jwtProperties.getExpirationMs()))
                            .user(userDto)
                            .build();
                })
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_BAD_CREDENTIALS, HttpStatus.UNAUTHORIZED,
                        "Invalid refresh token"));
    }

    @Transactional
    public void changePassword(UUID userId, vn.clinic.cdm.api.dto.auth.ChangePasswordRequest request) {
        IdentityUser user = identityService.getUserById(userId);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        identityService.saveUser(user);
    }

    @Transactional
    public void revokeAllSessions(UUID userId) {
        IdentityUser user = identityService.getUserById(userId);
        user.setTokenVersion(user.getTokenVersion() + 1);
        identityService.saveUser(user);
        refreshTokenRepository.deleteByUser(user);
    }
}
