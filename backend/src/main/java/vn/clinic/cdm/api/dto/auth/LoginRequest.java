package vn.clinic.cdm.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request đăng nhập – email, mật khẩu, tenant (bắt buộc), branch (tùy chọn).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Email không được để trống")
    @Email
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    // @NotNull(message = "Tenant ID khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private UUID tenantId;

    private UUID branchId;
}
