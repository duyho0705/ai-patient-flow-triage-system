package vn.clinic.patientflow.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.api.dto.auth.AuthUserDto;
import vn.clinic.patientflow.api.dto.auth.LoginRequest;
import vn.clinic.patientflow.api.dto.auth.LoginResponse;
import vn.clinic.patientflow.config.JwtProperties;
import vn.clinic.patientflow.config.JwtUtil;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.service.IdentityService;

import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.repository.PatientRepository;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.repository.TenantRepository;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import java.time.LocalDate;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import vn.clinic.patientflow.api.dto.auth.SocialLoginRequest;

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
    private final PatientRepository patientRepository;
    private final TenantRepository tenantRepository;

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
    public LoginResponse register(vn.clinic.patientflow.api.dto.auth.RegisterRequest request) {
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

        // Create a Patient entity to avoid 404s when the new patient accesses the
        // portal
        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", request.getTenantId()));

        Patient patient = new Patient();
        patient.setTenant(tenant);
        patient.setIdentityUser(user);
        patient.setExternalId(user.getId().toString()); // Use user ID as external ID to link
        patient.setFullNameVi(user.getFullNameVi());
        patient.setEmail(user.getEmail());
        patient.setIsActive(true);
        patient.setDateOfBirth(LocalDate.of(1990, 1, 1)); // Default date, update later in profile
        patientRepository.save(patient);

        return login(new LoginRequest(request.getEmail(), request.getPassword(), request.getTenantId(),
                request.getBranchId()));
    }

    @Transactional
    public LoginResponse socialLogin(SocialLoginRequest request) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
            String email = decodedToken.getEmail();
            if (email == null) {
                throw new BadCredentialsException("Token không chứa email hợp lệ");
            }
            email = email.trim().toLowerCase();

            IdentityUser user = identityService.getActiveUserByEmail(email);
            UUID tenantId = request.getTenantId();
            UUID branchId = request.getBranchId();

            if (user == null) {
                // Register new user automatically
                user = new IdentityUser();
                user.setEmail(email);
                user.setFullNameVi(decodedToken.getName() != null ? decodedToken.getName() : "Người dùng Social");
                user.setIsActive(true);
                user = identityService.saveUser(user);

                identityService.assignRole(user.getId(), tenantId, branchId, "patient");

                Tenant tenant = tenantRepository.findById(tenantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

                Patient patient = new Patient();
                patient.setTenant(tenant);
                patient.setIdentityUser(user);
                patient.setExternalId(user.getId().toString());
                patient.setFullNameVi(user.getFullNameVi());
                patient.setEmail(user.getEmail());
                patient.setIsActive(true);
                patient.setDateOfBirth(LocalDate.of(1990, 1, 1));
                patientRepository.save(patient);
            }

            List<String> roles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId, branchId);
            if (roles.isEmpty()) {
                // User exists but has no roles here -> add patient role
                identityService.assignRole(user.getId(), tenantId, branchId, "patient");
                roles = identityService.getRoleCodesForUserInTenantAndBranch(user.getId(), tenantId, branchId);

                Tenant tenant = tenantRepository.findById(tenantId).orElse(null);
                if (tenant != null) {
                    Patient patient = new Patient();
                    patient.setTenant(tenant);
                    patient.setIdentityUser(user);
                    patient.setExternalId(user.getId().toString());
                    patient.setFullNameVi(user.getFullNameVi());
                    patient.setEmail(user.getEmail());
                    patient.setIsActive(true);
                    patient.setDateOfBirth(LocalDate.of(1990, 1, 1));
                    patientRepository.save(patient);
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

        } catch (Exception e) {
            log.error("Firebase social login failed", e);
            throw new BadCredentialsException("Xác thực social thất bại: " + e.getMessage());
        }
    }

    @Transactional
    public void changePassword(UUID userId, vn.clinic.patientflow.api.dto.auth.ChangePasswordRequest request) {
        IdentityUser user = identityService.getUserById(userId);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        identityService.saveUser(user);
    }
}
