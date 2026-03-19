package vn.clinic.cdm.dto.report;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AiOperationalInsightDto {
    private String executiveSummary;
    private String riskAssessment;
    private List<String> metrics;
    private List<String> recommendations;
    private List<String> forecasts;
    private List<String> leakageAlerts;
}

