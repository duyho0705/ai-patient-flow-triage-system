package vn.clinic.patientflow.api.dto;

import lombok.*;
import vn.clinic.patientflow.patient.domain.MedicationReminder;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationReminderDto {
    private UUID id;
    private String medicineName;
    private LocalTime reminderTime;
    private String dosage;
    private Boolean isActive;
    private String notes;
    private UUID prescriptionItemId;

    public static MedicationReminderDto fromEntity(MedicationReminder entity) {
        return MedicationReminderDto.builder()
                .id(entity.getId())
                .medicineName(entity.getMedicineName())
                .reminderTime(entity.getReminderTime())
                .dosage(entity.getDosage())
                .isActive(entity.getIsActive())
                .notes(entity.getNotes())
                .prescriptionItemId(entity.getPrescriptionItem() != null ? entity.getPrescriptionItem().getId() : null)
                .build();
    }
}
