package vn.clinic.cdm.service.report;

import vn.clinic.cdm.dto.report.DailyVolumeDto;
import vn.clinic.cdm.dto.report.WaitTimeSummaryDto;
import java.util.List;
import java.util.UUID;

public interface ReportExportService {
    byte[] exportMonthlyReport(UUID tenantId, int year, int month);
    byte[] exportDoctorPerformance(UUID tenantId);
    
    // Excel Exports
    byte[] exportDailyVolumeExcel(List<DailyVolumeDto> volume);
    byte[] exportWaitTimeExcel(WaitTimeSummaryDto waitTime);
}