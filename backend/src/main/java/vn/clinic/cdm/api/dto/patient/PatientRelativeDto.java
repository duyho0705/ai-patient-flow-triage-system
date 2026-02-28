package vn.clinic.cdm.api.dto.patient;

import lombok.Builder;
import lombok.Data;
import vn.clinic.cdm.patient.domain.PatientRelative;

import java.util.UUID;

@Data
@Builder
public class PatientRelativeDto {
    private UUID id;
    private String fullName;
    private String relationship;
    private String phoneNumber;
    private String gender;
    private Integer age;
    private String avatarUrl;

    public static PatientRelativeDto fromEntity(PatientRelative entity) {
        return PatientRelativeDto.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .relationship(entity.getRelationship())
                .phoneNumber(entity.getPhoneNumber())
                .gender(entity.getGender())
                .age(entity.getAge())
                .avatarUrl(entity.getAvatarUrl())
                .build();
    }
}

