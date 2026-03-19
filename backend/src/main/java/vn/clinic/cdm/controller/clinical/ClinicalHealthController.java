package vn.clinic.cdm.controller.clinical;

// Unused wildcard imports removed
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.common.constant.ManagementConstants;
import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.entity.clinical.HealthMetric;
import vn.clinic.cdm.repository.clinical.HealthMetricRepository;
import vn.clinic.cdm.service.clinical.AiClinicalAnalysisService;
import vn.clinic.cdm.service.patient.PatientService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clinical/health")
@RequiredArgsConstructor
@Tag(name = "Health Tracking", description = "Theo dõi sức khỏe (Role 1 & 2)")
public class ClinicalHealthController {

    private final HealthMetricRepository healthMetricRepository;
    private final PatientService patientService;
    private final AiClinicalAnalysisService aiClinicalAnalysisService;

    @PostMapping("/{patientId}/metrics")
    @PreAuthorize("hasAnyRole('" + ManagementConstants.Roles.PATIENT + "', '" + ManagementConstants.Roles.DOCTOR + "')")
    @Operation(summary = "Nhập chỉ số sức khỏe")
    public ResponseEntity<ApiResponse<HealthMetric>> addMetric(@PathVariable UUID patientId,
            @RequestBody HealthMetric metric) {
        metric.setPatient(patientService.getById(patientId));
        return ResponseEntity.ok(ApiResponse.success(healthMetricRepository.save(metric)));
    }

    @GetMapping("/{patientId}/metrics")
    @PreAuthorize("hasAnyRole('" + ManagementConstants.Roles.PATIENT + "', '" + ManagementConstants.Roles.DOCTOR + "')")
    @Operation(summary = "Xem lịch sử chỉ số sức khỏe")
    public ResponseEntity<ApiResponse<List<HealthMetric>>> getMetrics(@PathVariable UUID patientId) {
        return ResponseEntity
                .ok(ApiResponse.success(healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId)));
    }

    @GetMapping("/{patientId}/ai-analysis")
    @PreAuthorize("hasAnyRole('" + ManagementConstants.Roles.DOCTOR + "', '" + ManagementConstants.Roles.PATIENT + "')")
    @Operation(summary = "Phân tích sức khỏe bằng AI (Role 2)")
    public ResponseEntity<ApiResponse<String>> analyzeHealth(@PathVariable UUID patientId) {
        var patient = patientService.getById(patientId);
        var metrics = healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalAnalysisService.analyzePatientHealth(patient, metrics)));
    }
}
