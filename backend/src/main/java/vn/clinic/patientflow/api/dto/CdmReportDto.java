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
public class CdmReportDto {
    private String patientName;
    private String patientDob;
    private String patientGender;
    private String doctorName;
    private String reportDate;

    private List<ConditionInfo> conditions;
    private List<TargetInfo> targets;
    private List<AdherenceInfo> adherence;
    private String aiCarePlan;

    @Data
    @Builder
    public static class ConditionInfo {
        private String name;
        private String icd10;
        private String severity;
        private String diagnosedAt;
    }

    @Data
    @Builder
    public static class TargetInfo {
        private String type;
        private String range;
        private String unit;
    }

    @Data
    @Builder
    public static class AdherenceInfo {
        private String medicine;
        private java.math.BigDecimal score;
        private String lastTaken;
    }
}
