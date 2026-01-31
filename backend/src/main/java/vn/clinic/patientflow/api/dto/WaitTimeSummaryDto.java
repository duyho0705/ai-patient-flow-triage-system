package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Báo cáo thời gian chờ trung bình (từ lúc vào hàng đến khi được gọi).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaitTimeSummaryDto {

    private String branchId;
    private String branchName;
    private LocalDate fromDate;
    private LocalDate toDate;
    /** Thời gian chờ trung bình (phút). */
    private Double averageWaitMinutes;
    /** Số bệnh nhân đã hoàn thành (có called_at) trong kỳ. */
    private long totalCompletedEntries;
}
