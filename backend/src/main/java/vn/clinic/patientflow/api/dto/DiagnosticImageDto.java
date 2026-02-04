package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DiagnosticImageDto {
    private String title;
    private String imageUrl;
    private String description;
    private String recordedAt;
}
