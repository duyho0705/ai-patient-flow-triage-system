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
import java.util.ArrayList;
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
        List<String> rawRoles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId, branchId);
        List<String> roles = new ArrayList<>(rawRoles);

        // Mọi tài khoản đăng nhập vô đều có mặc định role là PATIENT
        if (!roles.contains(ManagementConstants.Roles.PATIENT)) {
            roles.add(ManagementConstants.Roles.PATIENT);
        }

        List<String> permissions = identityService.getPermissionCodesForUserInTenantAndBranch(user.getId(), tenantId,
                branchId);
        identityService.updateLastLoginAt(user);
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getExpirationMs());
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), tenantId, branchId, roles,
                permissions, user.getTokenVersion());
        String refreshToken = createRefreshToken(user);

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
                .refreshToken(refreshToken)
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
        log.info("Social login attempt for TenantId: {}, BranchId: {}",
                request.getTenantId(), request.getBranchId());
        try {
            FirebaseToken decodedToken;
            try {
                decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
            } catch (Exception e) {
                log.error("Firebase ID token verification failed: {}", e.getMessage());
                throw new ApiException(ErrorCode.AUTH_BAD_CREDENTIALS, HttpStatus.UNAUTHORIZED,
                        "Token Firebase không hợp lệ");
            }

            String email = decodedToken.getEmail();
            if (email == null || email.isBlank()) {
                email = decodedToken.getUid() + "@social-login.local";
            }
            email = email.trim().toLowerCase();

            IdentityUser user = identityService.getActiveUserByEmail(email);
            if (user == null) {
                user = identityService.getActiveUserByUsername(decodedToken.getUid());
            }

            UUID tenantId = request.getTenantId();
            UUID branchId = request.getBranchId();

            if (tenantId == null) {
                if (user != null && user.getTenant() != null) {
                    tenantId = user.getTenant().getId();
                } else {
                    List<Tenant> allTenants = tenantRepository.findAll();
                    if (allTenants.size() == 1) {
                        tenantId = allTenants.get(0).getId();
                    } else {
                        tenantId = allTenants.stream()
                                .filter(t -> "DEFAULT".equals(t.getCode()))
                                .map(Tenant::getId)
                                .findFirst()
                                .orElse(allTenants.isEmpty() ? null : allTenants.get(0).getId());

                        if (tenantId == null) {
                            throw new ApiException(ErrorCode.AUTH_TENANT_REQUIRED, HttpStatus.BAD_REQUEST,
                                    "REQUIRE_TENANT_SELECTION");
                        }
                    }
                }
            }

            if (user == null) {
                String name = decodedToken.getName() != null ? decodedToken.getName() : "Người dùng Social";
                user = registerService.registerNewPatient(email, name, null, tenantId, branchId);
            }

            List<String> rawRoles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId,
                    branchId);
            List<String> roles = new ArrayList<>(rawRoles);

            // ÉP QUYỀN PATIENT: Đảm bảo mọi user đăng nhập đều có quyền PATIENT mặc định
            if (!roles.contains(ManagementConstants.Roles.PATIENT)) {
                log.info("Social User {} is missing PATIENT role. Adding automatically.", email);
                roles.add(ManagementConstants.Roles.PATIENT);
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

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("CRITICAL: Social login failed unexpectedly", e);
            throw new ApiException(ErrorCode.AUTH_SOCIAL_LOGIN_FAILED, HttpStatus.INTERNAL_SERVER_ERROR,
                    "Hệ thống gặp sự cố khi xử lý đăng nhập xã hội");
        }
    }

    @Transactional
    public String createRefreshToken(IdentityUser user) {
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
                    refreshTokenRepository.delete(token);
                    UUID tenantId = user.getTenant() != null ? user.getTenant().getId() : null;
                    List<String> rawRoles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId,
                            null);
                    List<String> roles = new ArrayList<>(rawRoles);

                    // Đảm bảo mọi user refresh token đều có quyền PATIENT mặc định
                    if (!roles.contains(ManagementConstants.Roles.PATIENT)) {
                        roles.add(ManagementConstants.Roles.PATIENT);
                    }

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
