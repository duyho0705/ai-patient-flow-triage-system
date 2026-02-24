package vn.clinic.patientflow.api.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.report.AnalyticsService;

import java.util.Map;
import java.util.UUID;

/**
 * Analytics - Dashboard metrics for Admin/Manager
 */
@RestController
@RequestMapping(value = "/api/admin/analytics", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Phân tích & Báo cáo")
@PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
public class AnalyticsController {

        private final AnalyticsService analyticsService;

        @GetMapping("/summary/today")
        @Operation(summary = "Tổng quan hôm nay: số bệnh nhân, thời gian chờ, tỷ lệ AI")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getTodaySummary(
                        @RequestParam(required = false) UUID branchId) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                return ResponseEntity.ok(ApiResponse.success(analyticsService.getTodaySummary(tenantId, branchId)));
        }

        @GetMapping("/summary/week")
        @Operation(summary = "Thống kê 7 ngày gần nhất")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getWeekSummary(
                        @RequestParam(required = false) UUID branchId) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                return ResponseEntity.ok(ApiResponse.success(analyticsService.getWeekSummary(tenantId, branchId)));
        }
}
