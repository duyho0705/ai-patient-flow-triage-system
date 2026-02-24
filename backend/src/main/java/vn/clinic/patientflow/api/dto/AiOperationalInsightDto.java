package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AiOperationalInsightDto {
    private String executiveSummary;
    private List<PerformanceMetric> metrics;
    private List<OperationalRecommendation> recommendations;
    private List<VolumeForecast> forecasts;
    private List<RevenueLeakage> leakageAlerts;
    private String riskAssessment;

    @Data
    @Builder
    public static class RevenueLeakage {
        private String patientId;
        private String patientName;
        private String missingType; // NO_INVOICE, UNPAID_RX
        private String potentialValue;
        private String details;
    }

    @Data
    @Builder
    public static class PerformanceMetric {
        private String name;
        private String value;
        private String status; // IMPROVING, DECLINING, STABLE
        private String insight;
    }

    @Data
    @Builder
    public static class OperationalRecommendation {
        private String title;
        private String description;
        private String priority; // HIGH, MEDIUM, LOW
        private String impact;
    }

    @Data
    @Builder
    public static class VolumeForecast {
        private String date;
        private Integer predictedVolume;
        private Double predictedRevenue;
        private String confidence;
    }
}
