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
public class StandardizedClinicalNoteDto {
    private String soapSubjective;
    private String soapObjective;
    private String soapAssessment;
    private String soapPlan;
    private List<CptCode> suggestedCptCodes;
    private List<Icd10Code> suggestedIcd10Codes;
    private String insuranceMemo;

    @Data
    @Builder
    public static class CptCode {
        private String code;
        private String description;
    }

    @Data
    @Builder
    public static class Icd10Code {
        private String code;
        private String description;
    }
}
