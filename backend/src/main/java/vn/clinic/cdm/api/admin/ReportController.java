package vn.clinic.cdm.api.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.report.WaitTimeSummaryDto;
import vn.clinic.cdm.api.dto.report.DailyVolumeDto;
import vn.clinic.cdm.api.dto.tenant.BranchOperationalHeatmapDto;
import vn.clinic.cdm.api.dto.report.AiOperationalInsightDto;
import vn.clinic.cdm.report.ReportExportService;
import vn.clinic.cdm.report.AiOperationalService;
import vn.clinic.cdm.report.ReportService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.IOException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * API BÃ¡o cÃ¡o (dÃ nh cho Clinic Manager/Admin).
 * Triage, Billing, and AI-Triage audit have been removed.
 */
@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Report", description = "BÃ¡o cÃ¡o thá»‘ng kÃª (Clinic Manager)")
@PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
public class ReportController {

        private final ReportService reportService;
        private final ReportExportService reportExportService;
        private final AiOperationalService aiOperationalService;

        @GetMapping("/wait-time")
        @Operation(summary = "BÃ¡o cÃ¡o thá»i gian chá» trung bÃ¬nh")
        public ResponseEntity<ApiResponse<WaitTimeSummaryDto>> getWaitTimeSummary(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

                return ResponseEntity.ok(ApiResponse.success(reportService.getWaitTimeSummary(
                                branchId, resolveStartDate(fromDate, toDate), resolveEndDate(toDate))));
        }

        @GetMapping("/daily-volume")
        @Operation(summary = "BÃ¡o cÃ¡o sá»‘ lÆ°á»£ng bá»‡nh nhÃ¢n theo ngÃ y")
        public ResponseEntity<ApiResponse<List<DailyVolumeDto>>> getDailyVolume(
                        @RequestParam UUID branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

                return ResponseEntity.ok(ApiResponse.success(reportService.getDailyVolume(
                                branchId, resolveStartDate(fromDate, toDate), resolveEndDate(toDate))));
        }

        @GetMapping("/daily-volume/excel")
        @Operation(summary = "Xuáº¥t bÃ¡o cÃ¡o sá»‘ lÆ°á»£ng bá»‡nh nhÃ¢n ra file Excel")
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
        @Operation(summary = "Xuáº¥t bÃ¡o cÃ¡o thá»i gian chá» ra file Excel")
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
        @Operation(summary = "Xem máº­t Ä‘á»™ bá»‡nh nhÃ¢n táº¡i cÃ¡c khu vá»±c (Heatmap)")
        public ResponseEntity<ApiResponse<BranchOperationalHeatmapDto>> getOperationalHeatmap(
                        @RequestParam UUID branchId) {
                return ResponseEntity.ok(ApiResponse.success(reportService.getOperationalHeatmap(branchId)));
        }

        @GetMapping("/ai-operational-insights")
        @Operation(summary = "Láº¥y phÃ¢n tÃ­ch váº­n hÃ nh thÃ´ng minh tá»« AI (Operational Intelligence)")
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

