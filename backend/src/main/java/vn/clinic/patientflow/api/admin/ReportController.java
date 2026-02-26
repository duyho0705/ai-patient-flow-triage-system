package vn.clinic.patientflow.api.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.WaitTimeSummaryDto;
import vn.clinic.patientflow.api.dto.DailyVolumeDto;
import vn.clinic.patientflow.api.dto.BranchOperationalHeatmapDto;
import vn.clinic.patientflow.api.dto.AiOperationalInsightDto;
import vn.clinic.patientflow.report.ReportExportService;
import vn.clinic.patientflow.report.AiOperationalService;
import vn.clinic.patientflow.report.ReportService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.IOException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * API Báo cáo (dành cho Clinic Manager/Admin).
 * Triage, Billing, and AI-Triage audit have been removed.
 */
@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Report", description = "Báo cáo thống kê (Clinic Manager)")
@PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
public class ReportController {

        private final ReportService reportService;
        private final ReportExportService reportExportService;
        private final AiOperationalService aiOperationalService;

        @GetMapping("/wait-time")
        @Operation(summary = "Báo cáo thời gian chờ trung bình")
        public ResponseEntity<ApiResponse<WaitTimeSummaryDto>> getWaitTimeSummary(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

                return ResponseEntity.ok(ApiResponse.success(reportService.getWaitTimeSummary(
                                branchId, resolveStartDate(fromDate, toDate), resolveEndDate(toDate))));
        }

        @GetMapping("/daily-volume")
        @Operation(summary = "Báo cáo số lượng bệnh nhân theo ngày")
        public ResponseEntity<ApiResponse<List<DailyVolumeDto>>> getDailyVolume(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

                return ResponseEntity.ok(ApiResponse.success(reportService.getDailyVolume(
                                branchId, resolveStartDate(fromDate, toDate), resolveEndDate(toDate))));
        }

        @GetMapping("/daily-volume/excel")
        @Operation(summary = "Xuất báo cáo số lượng bệnh nhân ra file Excel")
        public ResponseEntity<byte[]> exportDailyVolumeExcel(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate)
                        throws IOException {

                LocalDate end = toDate != null ? toDate : LocalDate.now();
                LocalDate start = fromDate != null ? fromDate : end.minusDays(30);
                List<DailyVolumeDto> data = reportService.getDailyVolume(branchId, start, end);
                byte[] bytes = reportExportService.exportDailyVolumeExcel(data);

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=daily-volume.xlsx")
                                .contentType(
                                                MediaType.parseMediaType(
                                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .body(bytes);
        }

        @GetMapping("/wait-time/excel")
        @Operation(summary = "Xuất báo cáo thời gian chờ ra file Excel")
        public ResponseEntity<byte[]> exportWaitTimeExcel(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate)
                        throws IOException {

                LocalDate end = toDate != null ? toDate : LocalDate.now();
                LocalDate start = fromDate != null ? fromDate : end.minusDays(30);
                WaitTimeSummaryDto data = reportService.getWaitTimeSummary(branchId, start, end);
                byte[] bytes = reportExportService.exportWaitTimeExcel(data);

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=wait-time.xlsx")
                                .contentType(
                                                MediaType.parseMediaType(
                                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .body(bytes);
        }

        @GetMapping("/operational-heatmap")
        @Operation(summary = "Xem mật độ bệnh nhân tại các khu vực (Heatmap)")
        public ResponseEntity<ApiResponse<BranchOperationalHeatmapDto>> getOperationalHeatmap(
                        @RequestParam UUID branchId) {
                return ResponseEntity.ok(ApiResponse.success(reportService.getOperationalHeatmap(branchId)));
        }

        @GetMapping("/ai-operational-insights")
        @Operation(summary = "Lấy phân tích vận hành thông minh từ AI (Operational Intelligence)")
        public ResponseEntity<ApiResponse<AiOperationalInsightDto>> getAiOperationalInsights(
                        @RequestParam UUID branchId) {
                return ResponseEntity.ok(ApiResponse.success(aiOperationalService.getOperationalInsights(branchId)));
        }

        private LocalDate resolveEndDate(LocalDate toDate) {
                return toDate != null ? toDate : LocalDate.now();
        }

        private LocalDate resolveStartDate(LocalDate fromDate, LocalDate toDate) {
                if (fromDate != null)
                        return fromDate;
                return resolveEndDate(toDate).minusDays(30);
        }
}
