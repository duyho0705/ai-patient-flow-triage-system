package vn.clinic.cdm.api.dto.clinical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.clinical.domain.Doctor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDto {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private String specialty;
    private String licenseNumber;
    private String bio;

    public static DoctorDto fromEntity(Doctor doctor) {
        if (doctor == null) return null;
        return DoctorDto.builder()
                .id(doctor.getId())
                .fullName(doctor.getIdentityUser() != null ? doctor.getIdentityUser().getFullNameVi() : "Unknown")
                .email(doctor.getIdentityUser() != null ? doctor.getIdentityUser().getEmail() : null)
                .phone(doctor.getIdentityUser() != null ? doctor.getIdentityUser().getPhone() : null)
                .specialty(doctor.getSpecialty())
                .licenseNumber(doctor.getLicenseNumber())
                .bio(doctor.getBio())
                .build();
    }
}
