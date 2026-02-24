package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSystemHealthDto {
    private long totalInteractions;
    private long successCount;
    private long failureCount;
    private double successRate;
    private double averageLatencyMs;
    private Map<String, Long> interactionsByFeature;
    private double estimatedCostUsd; // Mocked based on interaction count
}
