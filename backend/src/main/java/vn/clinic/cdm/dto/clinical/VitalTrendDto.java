package vn.clinic.cdm.dto.clinical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalTrendDto {
    private String type;
    private BigDecimal value;
    private Instant recordedAt;
    private String unit;
    private String status;

    /** Alias cho recordedAt — frontend chart dùng 'timestamp' */
    public Instant getTimestamp() {
        return recordedAt;
    }

    /** Builder helper — hỗ trợ set timestamp = recordedAt */
    public static VitalTrendDtoBuilder timestamp(Instant t) {
        return VitalTrendDto.builder().recordedAt(t);
    }
}
