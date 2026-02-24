package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.patientflow.patient.domain.PatientVitalLog;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientVitalLogDto {
    private UUID id;
    private String vitalType;
    private BigDecimal valueNumeric;
    private String unit;
    private Instant recordedAt;
    private String imageUrl;
    private String notes;

    public static PatientVitalLogDto fromEntity(PatientVitalLog entity) {
        return PatientVitalLogDto.builder()
                .id(entity.getId())
                .vitalType(entity.getVitalType())
                .valueNumeric(entity.getValueNumeric())
                .unit(entity.getUnit())
                .recordedAt(entity.getRecordedAt())
                .imageUrl(entity.getImageUrl())
                .notes(entity.getNotes())
                .build();
    }
}
