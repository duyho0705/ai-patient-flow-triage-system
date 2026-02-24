package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.patientflow.patient.domain.MedicationDosageLog;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationDosageLogDto {
    private UUID id;
    private UUID medicationReminderId;
    private String medicineName;
    private String dosageInstruction;
    private Instant takenAt;

    public static MedicationDosageLogDto fromEntity(MedicationDosageLog entity) {
        return MedicationDosageLogDto.builder()
                .id(entity.getId())
                .medicationReminderId(
                        entity.getMedicationReminder() != null ? entity.getMedicationReminder().getId() : null)
                .medicineName(entity.getMedicineName())
                .dosageInstruction(entity.getDosageInstruction())
                .takenAt(entity.getTakenAt())
                .build();
    }
}
