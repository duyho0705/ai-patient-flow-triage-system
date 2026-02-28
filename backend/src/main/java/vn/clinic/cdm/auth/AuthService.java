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
        if (roles.isEmpty()) {
            log.warn("Login failed: No roles found for user {} in tenant {}", request.getEmail(), tenantId);
            throw new BadCredentialsException("Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p tenant/chi nhÃ¡nh nÃ y");
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

        } catch (BadCredentialsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Firebase social login failed", e);
            throw new ApiException(ErrorCode.AUTH_SOCIAL_LOGIN_FAILED, HttpStatus.UNAUTHORIZED, e.getMessage());
        }
    }

    @Transactional
    public void changePassword(UUID userId, vn.clinic.cdm.api.dto.auth.ChangePasswordRequest request) {
        IdentityUser user = identityService.getUserById(userId);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Máº­t kháº©u cÅ© khÃ´ng chÃ­nh xÃ¡c");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        identityService.saveUser(user);
    }
}
