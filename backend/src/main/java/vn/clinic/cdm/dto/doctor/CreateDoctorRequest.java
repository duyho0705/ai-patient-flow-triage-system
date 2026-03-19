package vn.clinic.cdm.dto.doctor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDoctorRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    private String phone;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Chuyên khoa không được để trống")
    private String specialty;

    private String licenseNumber;
    private String bio;
}
