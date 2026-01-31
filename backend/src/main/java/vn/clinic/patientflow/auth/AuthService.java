package vn.clinic.patientflow.auth;

import lombok.RequiredArgsConstructor;
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
 * Xác thực đăng nhập – kiểm tra mật khẩu, resolve roles theo tenant/branch, phát JWT.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final IdentityService identityService;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final PasswordEncoder passwordEncoder;

    /**
     * Đăng nhập: kiểm tra email/password, lấy roles theo tenant (và branch nếu có), phát JWT.
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        IdentityUser user = identityService.getActiveUserByEmail(request.getEmail().trim().toLowerCase());
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new BadCredentialsException("Tài khoản chưa được thiết lập mật khẩu");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
        }
        UUID tenantId = request.getTenantId();
        UUID branchId = request.getBranchId();
        List<String> roles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId, branchId);
        if (roles.isEmpty()) {
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
}
