package vn.clinic.cdm.api.dto.clinical;

import java.util.UUID;

import lombok.Data;

@Data
public class CreateConsultationRequest {
    private UUID patientId;
    private UUID appointmentId;
    private String roomOrStation;
    private String diagnosisNotes;
    private String prescriptionNotes;
}

