package vn.clinic.patientflow.api.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ConsultationFeedbackRequest {
    private UUID consultationId;
    private Integer rating;
    private String comment;
}
