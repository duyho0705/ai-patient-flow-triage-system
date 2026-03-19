package vn.clinic.cdm.dto.report;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class DailyVolumeDto {
    private LocalDate date;
    private java.util.UUID branchId;
    private String branchName;
    private Long triageCount;
    private Long completedQueueEntries;
}

