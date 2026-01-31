package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.AuthUserDto;
import vn.clinic.patientflow.api.dto.LoginRequest;
import vn.clinic.patientflow.api.dto.LoginResponse;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.auth.AuthService;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.service.IdentityService;

/**
 * API xác thực – login (JWT), me (thông tin user hiện tại).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Đăng nhập và thông tin user")
public class AuthController {

    private final AuthService authService;
    private final IdentityService identityService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Trả về JWT và thông tin user. Cần tenantId; branchId tùy chọn.")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Thông tin user hiện tại", description = "Lấy thông tin user từ JWT (cần Authorization: Bearer <token>).")
    public ResponseEntity<AuthUserDto> me(@AuthenticationPrincipal AuthPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        IdentityUser user = identityService.getUserById(principal.getUserId());
        AuthUserDto dto = AuthUserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullNameVi(user.getFullNameVi())
                .roles(principal.getRoles())
                .tenantId(principal.getTenantId())
                .branchId(principal.getBranchId())
                .build();
        return ResponseEntity.ok(dto);
    }
}
