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
public class ComplicationRiskDto {
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private Double riskScore; // 0-100
    private String primaryRiskFactor;
    private List<RiskFactor> detailFactors;
    private String aiWarning;
    private List<String> preventiveActions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskFactor {
        private String factorName;
        private String impact; // HIGH, MEDIUM, LOW
        private String description;
    }
}

