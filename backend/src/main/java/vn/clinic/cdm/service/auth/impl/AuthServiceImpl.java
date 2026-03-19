package vn.clinic.cdm.service.auth.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.security.JwtProperties;
import vn.clinic.cdm.security.JwtUtil;
import vn.clinic.cdm.dto.auth.AuthUserDto;
import vn.clinic.cdm.dto.auth.LoginRequest;
import vn.clinic.cdm.dto.auth.LoginResponse;
import vn.clinic.cdm.dto.auth.ChangePasswordRequest;
import vn.clinic.cdm.entity.identity.IdentityUser;
import vn.clinic.cdm.entity.identity.RefreshToken;
import vn.clinic.cdm.exception.ApiException;
import vn.clinic.cdm.exception.ErrorCode;
import vn.clinic.cdm.repository.identity.RefreshTokenRepository;
import vn.clinic.cdm.service.auth.AuthService;
import vn.clinic.cdm.service.identity.IdentityService;
import vn.clinic.cdm.service.common.AuditService;
import vn.clinic.cdm.dto.common.AuditRequest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final IdentityService identityService;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuditService auditService;

    @Override
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

        List<String> permissions = identityService.getPermissionCodesForUserInTenantAndBranch(user.getId(), tenantId, branchId);
        identityService.updateLastLoginAt(user);
        
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getExpirationMs());
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), tenantId, branchId, roles, permissions, user.getTokenVersion());
        String refreshToken = createRefreshToken(user);

        auditService.logSuccess(new AuditRequest(user.getId(), user.getEmail(), "LOGIN", "Logged in via Email/Password", "SUCCESS", null, null));

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

    @Override
    @Transactional
    public String createRefreshToken(IdentityUser user) {
        refreshTokenRepository.deleteByUser(user);
        String token = jwtUtil.generateRefreshToken(user.getId());
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiryDate(Instant.now().plusMillis(jwtProperties.getRefreshExpirationMs()))
                .build();
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    @Override
    @Transactional
    public LoginResponse rotateRefreshToken(String requestToken) {
        return refreshTokenRepository.findByToken(requestToken)
                .map(token -> {
                    if (token.isExpired()) {
                        refreshTokenRepository.delete(token);
                        throw new ApiException(ErrorCode.AUTH_BAD_CREDENTIALS, HttpStatus.UNAUTHORIZED, "Refresh token expired");
                    }
                    IdentityUser user = token.getUser();
                    refreshTokenRepository.delete(token);
                    UUID tenantId = user.getTenant() != null ? user.getTenant().getId() : null;
                    List<String> rawRoles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId, null);
                    List<String> roles = new ArrayList<>(rawRoles);

                    List<String> permissions = identityService.getPermissionCodesForUserInTenantAndBranch(user.getId(), tenantId, null);

                    String newAccessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), tenantId, null, roles, permissions, user.getTokenVersion());
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
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_BAD_CREDENTIALS, HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        IdentityUser user = identityService.getUserById(userId);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        identityService.saveUser(user);
    }

    @Override
    @Transactional
    public void revokeAllSessions(UUID userId) {
        IdentityUser user = identityService.getUserById(userId);
        user.setTokenVersion(user.getTokenVersion() + 1);
        identityService.saveUser(user);
        refreshTokenRepository.deleteByUser(user);
    }
}
