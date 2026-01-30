package vn.clinic.patientflow.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientRequest {

    @Size(max = 64)
    private String externalId;

    @Size(max = 20)
    private String cccd;

    @NotBlank
    @Size(max = 255)
    private String fullNameVi;

    @NotNull
    @Past
    private LocalDate dateOfBirth;

    @Size(max = 20)
    private String gender;

    @Size(max = 20)
    private String phone;

    @Size(max = 255)
    private String email;

    @Size(max = 500)
    private String addressLine;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String district;

    @Size(max = 100)
    private String ward;

    @Size(max = 100)
    private String nationality;

    @Size(max = 100)
    private String ethnicity;
}
