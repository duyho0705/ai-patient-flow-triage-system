package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.AiEffectivenessDto;
import vn.clinic.patientflow.api.dto.DailyVolumeDto;
import vn.clinic.patientflow.api.dto.WaitTimeSummaryDto;
import vn.clinic.patientflow.report.ReportExportService;
import vn.clinic.patientflow.report.ReportService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.IOException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * API Báo cáo (dành cho Clinic Manager/Admin).
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Report", description = "Báo cáo thống kê (Clinic Manager)")
@PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
public class ReportController {

        private final ReportService reportService;
        private final ReportExportService reportExportService;

        @GetMapping("/wait-time")
        @Operation(summary = "Báo cáo thời gian chờ trung bình")
        public ResponseEntity<WaitTimeSummaryDto> getWaitTimeSummary(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

                LocalDate end = toDate != null ? toDate : LocalDate.now();
                LocalDate start = fromDate != null ? fromDate : end.minusDays(30);

                return ResponseEntity.ok(reportService.getWaitTimeSummary(branchId, start, end));
        }

        @GetMapping("/daily-volume")
        @Operation(summary = "Báo cáo số lượng bệnh nhân theo ngày")
        public ResponseEntity<List<DailyVolumeDto>> getDailyVolume(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

                LocalDate end = toDate != null ? toDate : LocalDate.now();
                LocalDate start = fromDate != null ? fromDate : end.minusDays(30);

                return ResponseEntity.ok(reportService.getDailyVolume(branchId, start, end));
        }

        @GetMapping("/ai-effectiveness")
        @Operation(summary = "Báo cáo hiệu quả AI Triage")
        public ResponseEntity<AiEffectivenessDto> getAiEffectiveness(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

                LocalDate end = toDate != null ? toDate : LocalDate.now();
                LocalDate start = fromDate != null ? fromDate : end.minusDays(30);

                return ResponseEntity.ok(reportService.getAiEffectiveness(branchId, start, end));
        }

        @GetMapping("/revenue")
        @Operation(summary = "Báo cáo doanh thu")
        public ResponseEntity<vn.clinic.patientflow.api.dto.RevenueReportDto> getRevenueReport(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

                LocalDate end = toDate != null ? toDate : LocalDate.now();
                LocalDate start = fromDate != null ? fromDate : end.minusDays(30);

                return ResponseEntity.ok(reportService.getRevenueReport(branchId, start, end));
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

        @GetMapping("/ai-effectiveness/pdf")
        @Operation(summary = "Xuất báo cáo hiệu quả AI ra file PDF")
        public ResponseEntity<byte[]> exportAiEffectivenessPdf(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

                LocalDate end = toDate != null ? toDate : LocalDate.now();
                LocalDate start = fromDate != null ? fromDate : end.minusDays(30);
                AiEffectivenessDto data = reportService.getAiEffectiveness(branchId, start, end);
                byte[] bytes = reportExportService.exportAiEffectivenessPdf(data);

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ai-effectiveness.pdf")
                                .contentType(MediaType.APPLICATION_PDF)
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
}
