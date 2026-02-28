package vn.clinic.cdm.api.dto.clinical;

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
public class VitalHistoryDto {
    private Instant recordedAt;
    private String vitalType;
    private BigDecimal valueNumeric;
    private String unit;
    private String source; // TRIAGE or CLINICAL
}

