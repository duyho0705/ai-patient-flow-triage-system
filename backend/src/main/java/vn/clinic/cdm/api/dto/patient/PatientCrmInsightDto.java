package vn.clinic.cdm.api.dto.patient;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PatientCrmInsightDto {
    private String healthScoreLabel; // e.g., "STABLE", "AT_RISK", "CRITICAL_FOLLOWUP"
    private Double adherenceScore; // 0-100% based on appointment/medication history
    private List<CareGap> careGaps;
    private String retentionRisk; // LOW, MEDIUM, HIGH (based on wait times experience)
    private String nextBestAction;
    private String aiSummary;

    @Data
    @Builder
    public static class CareGap {
        private String title;
        private String description;
        private String urgency; // HIGH, MEDIUM, LOW
        private String recommendation;
    }
}

