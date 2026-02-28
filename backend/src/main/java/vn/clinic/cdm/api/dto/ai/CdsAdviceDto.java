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
public class CdsAdviceDto {
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String summary;
    private List<CdsWarning> warnings;
    private List<CdsSuggestion> suggestions;
    private List<String> differentialDiagnoses;
    private String aiReasoning;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CdsWarning {
        private String type; // INTERACTION, CONTRAINDICATION, VITAL_ALARM
        private String message;
        private String severity; // INFO, WARNING, ERROR
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CdsSuggestion {
        private String title;
        private String reason;
        private String actionType; // LAB_ORDER, IMAGING, MEDICATION_ADJUST
    }
}

