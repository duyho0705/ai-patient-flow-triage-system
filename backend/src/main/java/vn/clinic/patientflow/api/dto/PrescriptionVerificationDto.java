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
public class PrescriptionVerificationDto {
    private String status; // SAFE, WARNING, DANGEROUS, ERROR
    private String summary;
    private List<VerificationWarning> warnings;
    private List<OptimizationSuggestion> suggestions;
    private String aiReasoning;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerificationWarning {
        private String type; // INTERACTION, ALLERGY, DOSAGE, DUP_THERAPY
        private String message;
        private String severity; // INFO, WARNING, CRITICAL
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptimizationSuggestion {
        private String originalMedication;
        private String suggestedAlternative;
        private String reason; // COST_SAVING, BETTER_EFFICACY, LESS_SIDE_EFFECTS
    }
}
