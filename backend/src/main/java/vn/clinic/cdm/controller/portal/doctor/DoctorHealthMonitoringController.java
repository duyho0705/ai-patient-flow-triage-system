package vn.clinic.cdm.controller.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.dto.clinical.HealthMetricDto;
import vn.clinic.cdm.dto.clinical.HealthThresholdDto;
import vn.clinic.cdm.dto.clinical.UpdateHealthThresholdRequest;
import vn.clinic.cdm.dto.clinical.VitalTrendDto;
import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.service.clinical.DoctorHealthMonitoringService;

import java.util.List;
import java.util.UUID;

/**
 * Theo dõi Chỉ số Sức khỏe Bệnh nhân — Doctor Portal.
 * <p>
 * Bác sĩ có thể:
 * - Xem tất cả chỉ số sức khỏe gần nhất
 * - Xem biểu đồ xu hướng theo loại chỉ số
 * - Cài đặt / cập nhật ngưỡng cảnh báo cá nhân hóa
 */
@RestController
@RequestMapping("/api/doctor-portal/patients/{patientId}/health")
@RequiredArgsConstructor
@Tag(name = "Doctor Health Monitoring", description = "Theo dõi chỉ số sức khỏe bệnh nhân dành cho bác sĩ")
@PreAuthorize("hasAnyRole('DOCTOR', 'CLINIC_MANAGER')")
public class DoctorHealthMonitoringController {

    private final DoctorHealthMonitoringService healthMonitoringService;

    @GetMapping("/metrics")
    @Operation(summary = "Lấy tất cả chỉ số sức khỏe gần nhất của bệnh nhân")
    public ResponseEntity<ApiResponse<List<HealthMetricDto>>> getHealthMetrics(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(
                healthMonitoringService.getPatientHealthMetrics(patientId)));
    }

    @GetMapping("/metrics/trends")
    @Operation(summary = "Biểu đồ xu hướng chỉ số theo loại (dùng cho chart)")
    public ResponseEntity<ApiResponse<List<VitalTrendDto>>> getHealthTrends(
            @PathVariable UUID patientId,
            @RequestParam String type,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(
                healthMonitoringService.getPatientHealthTrends(patientId, type, days)));
    }

    @GetMapping("/thresholds")
    @Operation(summary = "Lấy ngưỡng cảnh báo cá nhân hóa của bệnh nhân")
    public ResponseEntity<ApiResponse<List<HealthThresholdDto>>> getThresholds(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(
                healthMonitoringService.getPatientThresholds(patientId)));
    }

    @PutMapping("/thresholds")
    @Operation(summary = "Cập nhật / tạo ngưỡng cảnh báo cá nhân hóa cho bệnh nhân")
    public ResponseEntity<ApiResponse<HealthThresholdDto>> upsertThreshold(
            @PathVariable UUID patientId,
            @RequestBody UpdateHealthThresholdRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                healthMonitoringService.upsertThreshold(patientId, request)));
    }
}
