package vn.clinic.cdm.controller.auth;

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
import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.dto.auth.AuthUserDto;
import vn.clinic.cdm.dto.auth.LoginRequest;
import vn.clinic.cdm.dto.auth.LoginResponse;
import vn.clinic.cdm.security.AuthPrincipal;
import vn.clinic.cdm.service.auth.AuthService;
import vn.clinic.cdm.entity.identity.IdentityUser;
import vn.clinic.cdm.service.identity.IdentityService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import vn.clinic.cdm.common.annotation.RateLimit;

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
        @RateLimit(strict = true)
        public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
                LoginResponse response = authService.login(request);
                String refreshToken = response.getRefreshToken();
                response.setRefreshToken(null);

                ResponseCookie jwtCookie = ResponseCookie.from("jwt", response.getToken())
                                .httpOnly(true)
                                .secure(false)
                                .path("/")
                                .maxAge(24 * 60 * 60)
                                .sameSite("Lax")
                                .build();

                ResponseCookie refreshCookie = createRefreshCookie(refreshToken);

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.success(response));
        }





        @PostMapping("/logout")
        @Operation(summary = "Đăng xuất", description = "Xóa JWT Cookie.")
        public ResponseEntity<ApiResponse<Void>> logout() {
                ResponseCookie jwtCookie = ResponseCookie.from("jwt", "")
                                .httpOnly(true)
                                .secure(false)
                                .path("/")
                                .maxAge(0)
                                .sameSite("Lax")
                                .build();

                ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
                                .httpOnly(true)
                                .secure(false)
                                .path("/") // Fixed: should match cookie path
                                .maxAge(0)
                                .sameSite("Lax")
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
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

        @PostMapping("/refresh")
        @Operation(summary = "Làm mới Token", description = "Dùng Refresh Token từ Cookie để lấy Access Token mới.")
        public ResponseEntity<ApiResponse<LoginResponse>> refresh(HttpServletRequest request) {
                String refreshToken = null;
                if (request.getCookies() != null) {
                        for (Cookie cookie : request.getCookies()) {
                                if ("refresh_token".equals(cookie.getName())) {
                                        refreshToken = cookie.getValue();
                                }
                        }
                }

                if (refreshToken == null) {
                        return ResponseEntity.status(401).body(ApiResponse.error("Refresh token missing"));
                }

                LoginResponse response = authService.rotateRefreshToken(refreshToken);
                String newRefreshToken = response.getRefreshToken();
                response.setRefreshToken(null);

                ResponseCookie jwtCookie = ResponseCookie.from("jwt", response.getToken())
                                .httpOnly(true)
                                .secure(false)
                                .path("/")
                                .maxAge(24 * 60 * 60)
                                .sameSite("Lax")
                                .build();

                ResponseCookie refreshCookie = createRefreshCookie(newRefreshToken);

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(ApiResponse.success(response));
        }

        private ResponseCookie createRefreshCookie(String token) {
                return ResponseCookie.from("refresh_token", token)
                                .httpOnly(true)
                                .secure(false) // Set true in production
                                .path("/") // Should match across app
                                .maxAge(7 * 24 * 60 * 60) // 7 days
                                .sameSite("Lax")
                                .build();
        }
}
