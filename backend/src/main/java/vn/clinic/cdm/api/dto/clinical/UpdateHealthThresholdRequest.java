package vn.clinic.cdm.api.dto.clinical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cập nhật ngưỡng cảnh báo cá nhân hóa cho bệnh nhân.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHealthThresholdRequest {

    private String metricType;
    private BigDecimal minValue;
    private BigDecimal maxValue;
}
