package vn.clinic.cdm.service.report;

import vn.clinic.cdm.dto.management.DoctorPerformanceDto;
import vn.clinic.cdm.dto.management.MonthlyReportDto;
import vn.clinic.cdm.dto.report.DailyVolumeDto;
import vn.clinic.cdm.dto.report.WaitTimeSummaryDto;
import vn.clinic.cdm.dto.tenant.BranchOperationalHeatmapDto;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;

public interface ReportService {
    Map<String, Object> getClinicStats(UUID tenantId);
    MonthlyReportDto getMonthlyReport(UUID tenantId, int year, int month);
    List<DoctorPerformanceDto> getDoctorPerformance(UUID tenantId);
    
    // Operational Reports
    WaitTimeSummaryDto getWaitTimeSummary(UUID branchId, LocalDate start, LocalDate end);
    List<DailyVolumeDto> getDailyVolume(UUID branchId, LocalDate start, LocalDate end);
    BranchOperationalHeatmapDto getOperationalHeatmap(UUID branchId);
}
