package vn.clinic.cdm.api;

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
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.auth.AuthUserDto;
import vn.clinic.cdm.api.dto.auth.LoginRequest;
import vn.clinic.cdm.api.dto.auth.LoginResponse;
import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.auth.AuthService;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.identity.service.IdentityService;

/**
 * API xÃ¡c thá»±c â€“ login (JWT), me (thÃ´ng tin user hiá»‡n táº¡i).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "ÄÄƒng nháº­p vÃ  thÃ´ng tin user")
public class AuthController {

        private final AuthService authService;
        private final IdentityService identityService;

        @PostMapping("/login")
        @Operation(summary = "ÄÄƒng nháº­p", description = "Tráº£ vá» JWT vÃ  thÃ´ng tin user (CÅ©ng Ä‘áº·t JWT trong HttpOnly Cookie).")
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
        @Operation(summary = "ÄÄƒng kÃ½", description = "Tá»± Ä‘Äƒng kÃ½ tÃ i khoáº£n má»›i vÃ  Ä‘áº·t JWT Cookie.")
        public ResponseEntity<ApiResponse<LoginResponse>> register(
                        @Valid @RequestBody vn.clinic.cdm.api.dto.auth.RegisterRequest request) {
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
        @Operation(summary = "ÄÄƒng nháº­p Google/Facebook", description = "XÃ¡c thá»±c Firebase Token vÃ  cáº¥p JWT.")
        public ResponseEntity<ApiResponse<LoginResponse>> socialLogin(
                        @Valid @RequestBody vn.clinic.cdm.api.dto.auth.SocialLoginRequest request) {
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
        @Operation(summary = "ÄÄƒng xuáº¥t", description = "XÃ³a JWT Cookie.")
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
        @Operation(summary = "ThÃ´ng tin user hiá»‡n táº¡i", description = "Láº¥y thÃ´ng tin user tá»« JWT (cáº§n Authorization: Bearer <token>).")
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

