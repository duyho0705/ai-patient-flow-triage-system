package vn.clinic.patientflow.api.dto;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class CreateConsultationRequest {
    private UUID queueEntryId;
    private String roomOrStation;
    private String diagnosisNotes;
    private String prescriptionNotes;
}
