package vn.clinic.cdm.api.dto.patient;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdatePatientProfileRequest {
    @NotBlank(message = "Há» tÃªn khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String fullNameVi;

    @PastOrPresent(message = "NgÃ y sinh khÃ´ng há»£p lá»‡")
    private LocalDate dateOfBirth;

    private String gender;

    @Pattern(regexp = "^$|^(0[3|5|7|8|9])+([0-9]{8})$", message = "Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡")
    private String phone;

    @Email(message = "Email khÃ´ng há»£p lá»‡")
    private String email;

    private String addressLine;
    private String city;
    private String district;
    private String ward;
    private String nationality;
    private String ethnicity;
    @Size(max = 20, message = "Sá»‘ CCCD khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 20 kÃ½ tá»±")
    private String cccd;
}

