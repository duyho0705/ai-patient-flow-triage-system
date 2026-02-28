package vn.clinic.cdm.api.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.report.AnalyticsService;

import java.util.Map;
import java.util.UUID;

/**
 * Analytics - Dashboard metrics for Admin/Manager
 */
@RestController
@RequestMapping(value = "/api/admin/analytics", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "PhÃ¢n tÃ­ch & BÃ¡o cÃ¡o")
@PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
public class AnalyticsController {

        private final AnalyticsService analyticsService;

        @GetMapping("/summary/today")
        @Operation(summary = "Tá»•ng quan hÃ´m nay: sá»‘ bá»‡nh nhÃ¢n, thá»i gian chá», tá»· lá»‡ AI")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getTodaySummary(
                        @RequestParam(required = false) UUID branchId) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                return ResponseEntity.ok(ApiResponse.success(analyticsService.getTodaySummary(tenantId, branchId)));
        }

        @GetMapping("/summary/week")
        @Operation(summary = "Thá»‘ng kÃª 7 ngÃ y gáº§n nháº¥t")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getWeekSummary(
                        @RequestParam(required = false) UUID branchId) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                return ResponseEntity.ok(ApiResponse.success(analyticsService.getWeekSummary(tenantId, branchId)));
        }
}

