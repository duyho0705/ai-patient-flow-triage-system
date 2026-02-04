package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.patientflow.patient.domain.Patient;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDto {

    private UUID id;
    private UUID tenantId;
    private String externalId;
    private String cccd;
    private String fullNameVi;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String addressLine;
    private String city;
    private String district;
    private String ward;
    private String nationality;
    private String ethnicity;
    private Boolean isActive;
    private String avatarUrl;
    private Instant createdAt;
    private Instant updatedAt;

    public static PatientDto fromEntity(Patient e) {
        if (e == null)
            return null;
        return PatientDto.builder()
                .id(e.getId())
                .tenantId(e.getTenant() != null ? e.getTenant().getId() : null)
                .externalId(e.getExternalId())
                .cccd(e.getCccd())
                .fullNameVi(e.getFullNameVi())
                .dateOfBirth(e.getDateOfBirth())
                .gender(e.getGender())
                .phone(e.getPhone())
                .email(e.getEmail())
                .addressLine(e.getAddressLine())
                .city(e.getCity())
                .district(e.getDistrict())
                .ward(e.getWard())
                .nationality(e.getNationality())
                .ethnicity(e.getEthnicity())
                .isActive(e.getIsActive())
                .avatarUrl(e.getAvatarUrl())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
