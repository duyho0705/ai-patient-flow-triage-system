package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class RiskPatientDto {
    private UUID patientId;
    private String patientName;
    private String patientAvatar;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private String reason;
    private String lastVitalTrend; // e.g., "Worsening Blood Glucose"
}
