package vn.clinic.patientflow.api.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class CreateConsultationRequest {
    private UUID queueEntryId;
    private String roomOrStation;
    private String diagnosisNotes;
    private String prescriptionNotes;
}
