package vn.clinic.cdm.api.dto.clinical;

import lombok.Builder;
import lombok.Data;
import vn.clinic.cdm.clinical.domain.LabResult;

import java.util.UUID;

@Data
@Builder
public class LabResultDto {
    private UUID id;
    private String testName;
    private String value;
    private String unit;
    private String referenceRange;
    private String status; // NORMAL, HIGH, LOW

    public static LabResultDto fromEntity(LabResult entity) {
        return LabResultDto.builder()
                .id(entity.getId())
                .testName(entity.getTestName())
                .value(entity.getValue())
                .unit(entity.getUnit())
                .referenceRange(entity.getReferenceRange())
                .status(entity.getStatus())
                .build();
    }
}

