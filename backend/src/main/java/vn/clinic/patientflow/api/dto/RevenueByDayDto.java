package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class RevenueByDayDto {
    private LocalDate date;
    private BigDecimal amount;
}
