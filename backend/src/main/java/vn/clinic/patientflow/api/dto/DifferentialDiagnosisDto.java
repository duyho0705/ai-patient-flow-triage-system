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
public class DifferentialDiagnosisDto {
    private String primaryDiagnosis;
    private List<DifferentialItem> differentials;
    private List<String> redFlags;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DifferentialItem {
        private String disease;
        private String probability; // High, Medium, Low
        private String reasoning;
        private String tests;
    }
}
