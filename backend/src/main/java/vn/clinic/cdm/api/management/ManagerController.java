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
import vn.clinic.cdm.report.ReportService;
import vn.clinic.cdm.clinical.service.DoctorManagementService;
import vn.clinic.cdm.clinical.service.AllocationService;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.api.dto.management.AllocationDataDto;
import vn.clinic.cdm.api.dto.management.AllocatePatientRequest;
import vn.clinic.cdm.api.dto.clinical.DoctorDto;
import vn.clinic.cdm.api.dto.clinical.CreateDoctorRequest;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/management/reports")
@RequiredArgsConstructor
@Tag(name = "Clinic Management", description = "Quản lý phòng khám (Role 3)")
public class ManagerController {

    private final ReportService reportService;
    private final ExcelExportService excelExportService;
    private final DoctorManagementService doctorManagementService;
    private final AllocationService allocationService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
    @Operation(summary = "Xem báo cáo tổng hợp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary() {
        return ResponseEntity
                .ok(ApiResponse.success(reportService.getClinicStats(TenantContext.getTenantIdOrThrow())));
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
    @Operation(summary = "Danh sách bác sĩ")
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorManagementService.getAllDoctors()));
    }

    @PostMapping("/doctors")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
    @Operation(summary = "Thêm bác sĩ mới")
    public ResponseEntity<ApiResponse<DoctorDto>> createDoctor(
            @RequestBody @jakarta.validation.Valid CreateDoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.success(doctorManagementService.createDoctor(request)));
    }

    @DeleteMapping("/doctors/{id}")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
    @Operation(summary = "Xóa bác sĩ")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable UUID id) {
        doctorManagementService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success(null));
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

    @GetMapping("/allocation")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
    @Operation(summary = "Dữ liệu phân bổ bệnh nhân")
    public ResponseEntity<ApiResponse<AllocationDataDto>> getAllocationData() {
        return ResponseEntity.ok(ApiResponse.success(allocationService.getAllocationData()));
    }

    @PostMapping("/allocation")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
    @Operation(summary = "Phân bổ bệnh nhân cho bác sĩ")
    public ResponseEntity<ApiResponse<Void>> allocate(@RequestBody @jakarta.validation.Valid AllocatePatientRequest request) {
        allocationService.allocate(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
    @Operation(summary = "Báo cáo hàng tháng")
    public ResponseEntity<ApiResponse<vn.clinic.cdm.api.dto.management.MonthlyReportDto>> getMonthlyReport(
            @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getMonthlyReport(TenantContext.getTenantIdOrThrow(), year, month)));
    }

    @GetMapping("/performance")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN')")
    @Operation(summary = "Hiệu suất bác sĩ")
    public ResponseEntity<ApiResponse<List<vn.clinic.cdm.api.dto.management.DoctorPerformanceDto>>> getPerformance() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDoctorPerformance(TenantContext.getTenantIdOrThrow())));
    }
}
