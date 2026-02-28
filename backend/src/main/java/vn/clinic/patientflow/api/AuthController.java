package vn.clinic.patientflow.api;

// DTO imports are handled specifically below
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.common.ApiResponse;
import vn.clinic.patientflow.api.dto.auth.AuthUserDto;
import vn.clinic.patientflow.api.dto.auth.LoginRequest;
import vn.clinic.patientflow.api.dto.auth.LoginResponse;
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
        @Operation(summary = "Đăng nhập", description = "Trả về JWT và thông tin user (Cũng đặt JWT trong HttpOnly Cookie).")
        public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
                LoginResponse response = authService.login(request);

                ResponseCookie cookie = ResponseCookie.from("jwt", response.getToken())
                                .httpOnly(true)
                                .secure(false) // Set true in production with HTTPS
                                .path("/")
                                .maxAge(24 * 60 * 60) // 1 day
                                .sameSite("Lax")
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                .body(ApiResponse.success(response));
        }

        @PostMapping("/register")
        @Operation(summary = "Đăng ký", description = "Tự đăng ký tài khoản mới và đặt JWT Cookie.")
        public ResponseEntity<ApiResponse<LoginResponse>> register(
                        @Valid @RequestBody vn.clinic.patientflow.api.dto.auth.RegisterRequest request) {
                LoginResponse response = authService.register(request);

                ResponseCookie cookie = ResponseCookie.from("jwt", response.getToken())
                                .httpOnly(true)
                                .secure(false)
                                .path("/")
                                .maxAge(24 * 60 * 60)
                                .sameSite("Lax")
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                .body(ApiResponse.success(response));
        }

        @PostMapping("/social-login")
        @Operation(summary = "Đăng nhập Google/Facebook", description = "Xác thực Firebase Token và cấp JWT.")
        public ResponseEntity<ApiResponse<LoginResponse>> socialLogin(
                        @Valid @RequestBody vn.clinic.patientflow.api.dto.auth.SocialLoginRequest request) {
                LoginResponse response = authService.socialLogin(request);

                ResponseCookie cookie = ResponseCookie.from("jwt", response.getToken())
                                .httpOnly(true)
                                .secure(false) // Set true in production with HTTPS
                                .path("/")
                                .maxAge(24 * 60 * 60)
                                .sameSite("Lax")
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                .body(ApiResponse.success(response));
        }

        @PostMapping("/logout")
        @Operation(summary = "Đăng xuất", description = "Xóa JWT Cookie.")
        public ResponseEntity<ApiResponse<Void>> logout() {
                ResponseCookie cookie = ResponseCookie.from("jwt", "")
                                .httpOnly(true)
                                .secure(false)
                                .path("/")
                                .maxAge(0)
                                .sameSite("Lax")
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                .body(ApiResponse.success(null));
        }

        @GetMapping("/me")
        @Operation(summary = "Thông tin user hiện tại", description = "Lấy thông tin user từ JWT (cần Authorization: Bearer <token>).")
        public ResponseEntity<ApiResponse<AuthUserDto>> me(@AuthenticationPrincipal AuthPrincipal principal) {
                if (principal == null) {
                        return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
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
                return ResponseEntity.ok(ApiResponse.success(dto));
        }
}
