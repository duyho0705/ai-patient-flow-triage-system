package vn.clinic.patientflow.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
public class MedicationReminderRequest {
    private String medicineName;
    private LocalTime reminderTime;
    private String dosage;
    private Boolean isActive;
    private String notes;
    private UUID prescriptionItemId;
}
