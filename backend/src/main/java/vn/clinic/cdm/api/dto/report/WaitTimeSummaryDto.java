package vn.clinic.cdm.api.dto.report;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class WaitTimeSummaryDto {
    private String branchId;
    private String branchName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Double averageWaitMinutes;
    private Long totalCompletedEntries;
}

