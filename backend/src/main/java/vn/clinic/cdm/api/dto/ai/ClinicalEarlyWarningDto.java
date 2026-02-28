package vn.clinic.cdm.api.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalEarlyWarningDto {
    private Integer news2Score;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private List<VitalWarning> warnings;
    private String aiClinicalAssessment;
    private String escalationProtocol; // Recommended clinical action (e.g., "Notify Senior Doctor")

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VitalWarning {
        private String vitalType;
        private String value;
        private Integer pointsContributed;
        private String trend; // STABLE, WORSENING, IMPROVING
    }
}

