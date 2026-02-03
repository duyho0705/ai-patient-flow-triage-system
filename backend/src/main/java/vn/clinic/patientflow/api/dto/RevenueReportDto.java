package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class RevenueReportDto {
    private String branchId;
    private String branchName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private BigDecimal totalRevenue;
    private List<RevenueByDayDto> dailyRevenue;
}
