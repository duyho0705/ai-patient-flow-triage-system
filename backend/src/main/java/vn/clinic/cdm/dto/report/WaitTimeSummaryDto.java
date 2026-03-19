package vn.clinic.cdm.dto.report;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class WaitTimeSummaryDto {
    private java.util.UUID branchId;
    private String branchName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Double averageWaitMinutes;
    private Long totalCompletedEntries;
}

