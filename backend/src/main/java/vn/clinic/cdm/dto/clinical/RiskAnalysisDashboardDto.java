package vn.clinic.cdm.dto.clinical;

import lombok.Builder;
import lombok.Data;
import vn.clinic.cdm.dto.ai.RiskPatientDto;

import java.util.List;

@Data
@Builder
public class RiskAnalysisDashboardDto {
    private int criticalPatientsCount;
    private int newAlerts24hCount;
    private int stablePatientsPercentage;
    private List<RiskPatientDto> priorityList;
    private List<RiskInsightDto> aiInsights;
    private List<Integer> riskTrend7Days;

    @Data
    @Builder
    public static class RiskInsightDto {
        private String type; // "CRITICAL", "WARNING", "POSITIVE"
        private String title;
        private String description;
    }
}
