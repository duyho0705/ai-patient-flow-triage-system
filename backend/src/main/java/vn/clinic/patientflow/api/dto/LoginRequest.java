package vn.clinic.patientflow.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * Request đăng nhập – email, mật khẩu, tenant (bắt buộc), branch (tùy chọn).
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Email không được để trống")
    @Email
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotNull(message = "Tenant ID không được để trống")
    private UUID tenantId;

    private UUID branchId;
}
