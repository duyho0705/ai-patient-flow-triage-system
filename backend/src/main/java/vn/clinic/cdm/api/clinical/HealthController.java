package vn.clinic.cdm.api.clinical;

// Unused wildcard imports removed
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.clinical.domain.HealthMetric;
import vn.clinic.cdm.clinical.repository.HealthMetricRepository;
import vn.clinic.cdm.clinical.service.AiClinicalAnalysisService;
import vn.clinic.cdm.patient.service.PatientService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clinical/health")
@RequiredArgsConstructor
@Tag(name = "Health Tracking", description = "Theo dÃµi sá»©c khá»e (Role 1 & 2)")
public class HealthController {

    private final HealthMetricRepository healthMetricRepository;
    private final PatientService patientService;
    private final AiClinicalAnalysisService aiClinicalAnalysisService;

    @PostMapping("/{patientId}/metrics")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'nurse')")
    @Operation(summary = "Nháº­p chá»‰ sá»‘ sá»©c khá»e")
    public ResponseEntity<ApiResponse<HealthMetric>> addMetric(@PathVariable UUID patientId,
            @RequestBody HealthMetric metric) {
        metric.setPatient(patientService.getById(patientId));
        return ResponseEntity.ok(ApiResponse.success(healthMetricRepository.save(metric)));
    }

    @GetMapping("/{patientId}/metrics")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Xem lá»‹ch sá»­ chá»‰ sá»‘ sá»©c khá»e")
    public ResponseEntity<ApiResponse<List<HealthMetric>>> getMetrics(@PathVariable UUID patientId) {
        return ResponseEntity
                .ok(ApiResponse.success(healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId)));
    }

    @GetMapping("/{patientId}/ai-analysis")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    @Operation(summary = "PhÃ¢n tÃ­ch sá»©c khá»e báº±ng AI (Role 2)")
    public ResponseEntity<ApiResponse<String>> analyzeHealth(@PathVariable UUID patientId) {
        var patient = patientService.getById(patientId);
        var metrics = healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalAnalysisService.analyzePatientHealth(patient, metrics)));
    }
}

