package vn.clinic.patientflow.api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdatePatientProfileRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullNameVi;

    @PastOrPresent(message = "Ngày sinh không hợp lệ")
    private LocalDate dateOfBirth;

    private String gender;

    @Pattern(regexp = "^$|^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String addressLine;
    private String city;
    private String district;
    private String ward;
    private String nationality;
    private String ethnicity;
    @Size(max = 20, message = "Số CCCD không được vượt quá 20 ký tự")
    private String cccd;
}
