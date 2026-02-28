package vn.clinic.cdm.api.dto.medication;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationReminderDto {
    private UUID id;
    private String medicineName;
    private String reminderTime;
    private String dosage;
    private Boolean isActive;
    private String notes;
}
