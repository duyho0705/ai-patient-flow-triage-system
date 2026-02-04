package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LabResultDto {
    private String testName;
    private String value;
    private String unit;
    private String referenceRange;
    private String status; // NORMAL, HIGH, LOW
}
