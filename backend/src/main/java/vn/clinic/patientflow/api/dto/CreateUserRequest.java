package vn.clinic.patientflow.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateUserRequest {

    @NotBlank(message = "Email không được để trống")
    @Email
    private String email;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 255)
    private String fullNameVi;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100)
    private String password;

    @Size(max = 20)
    private String phone;

    @NotNull(message = "Tenant ID không được để trống")
    private UUID tenantId;

    @NotBlank(message = "Mã role không được để trống")
    private String roleCode;

    private UUID branchId;
}
