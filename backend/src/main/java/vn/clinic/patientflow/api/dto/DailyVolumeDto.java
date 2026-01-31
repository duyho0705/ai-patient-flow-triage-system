package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Số lượng bệnh nhân / phiên phân loại theo ngày (cho báo cáo Clinic Manager).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyVolumeDto {

    private LocalDate date;
    private String branchId;
    private String branchName;
    /** Số phiên phân loại trong ngày. */
    private long triageCount;
    /** Số lượt vào hàng chờ đã hoàn thành (called) trong ngày. */
    private long completedQueueEntries;
}
