package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CdsAdviceDto {
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private String summary;
    private List<CdsWarning> warnings;
    private List<CdsSuggestion> suggestions;
    private List<String> differentialDiagnoses;
    private String aiReasoning;

    @Data
    @Builder
    public static class CdsWarning {
        private String type; // INTERACTION, CONTRAINDICATION, VITAL_ALARM
        private String message;
        private String severity; // INFO, WARNING, ERROR
    }

    @Data
    @Builder
    public static class CdsSuggestion {
        private String title;
        private String reason;
        private String actionType; // LAB_ORDER, IMAGING, MEDICATION_ADJUST
    }
}
