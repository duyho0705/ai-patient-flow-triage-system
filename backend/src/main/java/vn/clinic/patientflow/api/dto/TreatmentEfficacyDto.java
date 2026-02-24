package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentEfficacyDto {
    private String overallStatus; // IMPROVING, STABLE, DECLINING
    private Double adherenceCorrelation; // Correlation score [0-1]
    private List<MetricInsight> metricInsights;
    private String aiAnalysis;
    private List<String> recommendations;

    @Data
    @Builder
    public static class MetricInsight {
        private String metricName;
        private String trend; // IMPROVING, WORSENING, NO_CHANGE
        private String stability; // HIGH, MEDIUM, LOW
        private String lastValue;
        private String message;
    }
}
