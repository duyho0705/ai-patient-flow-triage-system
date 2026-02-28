package vn.clinic.cdm.api.management;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.clinical.service.ExcelExportService;
import vn.clinic.cdm.clinical.service.ReportingService;
import vn.clinic.cdm.common.tenant.TenantContext;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/management/reports")
@RequiredArgsConstructor
@Tag(name = "Clinic Management", description = "Quản lý phòng khám (Role 3)")
public class ManagerController {

    private final ReportingService reportingService;
    private final ExcelExportService excelExportService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
    @Operation(summary = "Xem báo cáo tổng hợp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary() {
        return ResponseEntity
                .ok(ApiResponse.success(reportingService.getClinicStats(TenantContext.getTenantIdOrThrow())));
    }

    @GetMapping("/export-excel")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
    @Operation(summary = "Xuất báo cáo bệnh nhân bản Excel")
    public ResponseEntity<byte[]> exportExcel() throws IOException {
        byte[] data = excelExportService.exportPatientReport();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=patient_report.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }
}
