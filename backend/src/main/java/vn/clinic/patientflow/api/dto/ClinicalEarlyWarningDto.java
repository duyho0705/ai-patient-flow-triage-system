package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ClinicalEarlyWarningDto {
    private Integer news2Score; // 0-20
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String monitoringFrequency; // e.g., "Every 12 hours", "Continuous nursing care"
    private List<VitalWarning> warnings;
    private String aiClinicalAssessment;
    private String escalationProtocol; // Recommended clinical action (e.g., "Notify Senior Doctor")

    @Data
    @Builder
    public static class VitalWarning {
        private String vitalType;
        private String value;
        private Integer pointsContributed;
        private String trend; // STABLE, WORSENING, IMPROVING
    }
}
