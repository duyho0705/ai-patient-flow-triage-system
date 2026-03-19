package vn.clinic.cdm.dto.clinical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.entity.clinical.HealthThreshold;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO ngưỡng cảnh báo sức khỏe cá nhân hóa.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthThresholdDto {

    private UUID id;
    private UUID patientId;
    private String metricType;
    private BigDecimal minValue;
    private BigDecimal maxValue;

    public static HealthThresholdDto fromEntity(HealthThreshold e) {
        if (e == null)
            return null;
        return HealthThresholdDto.builder()
                .id(e.getId())
                .patientId(e.getPatient() != null ? e.getPatient().getId() : null)
                .metricType(e.getMetricType())
                .minValue(e.getMinValue())
                .maxValue(e.getMaxValue())
                .build();
    }
}
