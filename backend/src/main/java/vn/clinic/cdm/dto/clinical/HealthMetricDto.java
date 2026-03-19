package vn.clinic.cdm.dto.clinical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.entity.clinical.HealthMetric;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO chỉ số sức khỏe bệnh nhân — dùng cho Doctor Portal.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthMetricDto {

    private UUID id;
    private UUID patientId;
    private String metricType;
    private BigDecimal value;
    private String unit;
    private String status;
    private String notes;
    private String imageUrl;
    private Instant recordedAt;

    public static HealthMetricDto fromEntity(HealthMetric e) {
        if (e == null)
            return null;
        return HealthMetricDto.builder()
                .id(e.getId())
                .patientId(e.getPatient() != null ? e.getPatient().getId() : null)
                .metricType(e.getMetricType())
                .value(e.getValue())
                .unit(e.getUnit())
                .status(e.getStatus())
                .notes(e.getNotes())
                .imageUrl(e.getImageUrl())
                .recordedAt(e.getRecordedAt())
                .build();
    }
}
