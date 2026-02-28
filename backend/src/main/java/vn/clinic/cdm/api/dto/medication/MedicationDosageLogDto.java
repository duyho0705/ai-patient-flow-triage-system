package vn.clinic.cdm.api.dto.medication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}

