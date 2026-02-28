package vn.clinic.cdm.api.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskPatientDto {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private String patientAvatar;
    private String fullNameVi;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private String reason;
    private String lastVitalTrend; // e.g., "Worsening Blood Glucose"
}

