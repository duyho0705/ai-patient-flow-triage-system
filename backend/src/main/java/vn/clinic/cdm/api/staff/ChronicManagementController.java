package vn.clinic.cdm.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.patient.domain.PatientChronicCondition;
import vn.clinic.cdm.patient.domain.PatientVitalTarget;
import vn.clinic.cdm.patient.repository.PatientChronicConditionRepository;
import vn.clinic.cdm.patient.repository.PatientVitalTargetRepository;
import vn.clinic.cdm.clinical.repository.HealthMetricRepository;
import vn.clinic.cdm.clinical.repository.ClinicalVitalRepository;
import vn.clinic.cdm.api.dto.clinical.VitalHistoryDto;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/chronic")
@RequiredArgsConstructor
@Tag(name = "Chronic Management", description = "Quáº£n lÃ½ bá»‡nh mÃ£n tÃ­nh")
@PreAuthorize("hasAnyRole('DOCTOR', 'TRIAGE_NURSE', 'ADMIN')")
public class ChronicManagementController {

    private final PatientChronicConditionRepository chronicConditionRepository;
    private final PatientVitalTargetRepository vitalTargetRepository;
    private final HealthMetricRepository healthMetricRepository;
    private final ClinicalVitalRepository clinicalVitalRepository;

    @GetMapping("/conditions")
    @Operation(summary = "Láº¥y danh sÃ¡ch bá»‡nh mÃ£n tÃ­nh cá»§a bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<List<PatientChronicCondition>>> getConditions(@RequestParam UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(chronicConditionRepository.findByPatientId(patientId)));
    }

    @PostMapping("/conditions")
    @Operation(summary = "ThÃªm bá»‡nh mÃ£n tÃ­nh má»›i")
    public ResponseEntity<ApiResponse<PatientChronicCondition>> addCondition(
            @RequestBody PatientChronicCondition condition) {
        return ResponseEntity.ok(ApiResponse.success(chronicConditionRepository.save(condition)));
    }

    @GetMapping("/targets")
    @Operation(summary = "Láº¥y danh sÃ¡ch ngÆ°á»¡ng chá»‰ sá»‘ má»¥c tiÃªu")
    public ResponseEntity<ApiResponse<List<PatientVitalTarget>>> getTargets(@RequestParam UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(vitalTargetRepository.findByPatientId(patientId)));
    }

    @PostMapping("/targets")
    @Operation(summary = "Thiáº¿t láº­p ngÆ°á»¡ng má»¥c tiÃªu má»›i cho bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<PatientVitalTarget>> addTarget(@RequestBody PatientVitalTarget target) {
        return ResponseEntity.ok(ApiResponse.success(vitalTargetRepository.save(target)));
    }

    @GetMapping("/vitals")
    @Operation(summary = "Láº¥y lá»‹ch sá»­ sinh hiá»‡u tá»•ng há»£p (CDM + Clinical)")
    public ResponseEntity<ApiResponse<List<VitalHistoryDto>>> getVitalHistory(@RequestParam UUID patientId) {
        List<VitalHistoryDto> history = new ArrayList<>();

        healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId)
                .stream().limit(10)
                .forEach(v -> history.add(VitalHistoryDto.builder()
                        .recordedAt(v.getRecordedAt())
                        .vitalType(v.getMetricType())
                        .valueNumeric(v.getValue())
                        .unit(v.getUnit())
                        .source("CDM")
                        .build()));

        clinicalVitalRepository.findTop10ByConsultationPatientIdOrderByRecordedAtDesc(patientId)
                .forEach(v -> history.add(VitalHistoryDto.builder()
                        .recordedAt(v.getRecordedAt())
                        .vitalType(v.getVitalType())
                        .valueNumeric(v.getValueNumeric())
                        .unit(v.getUnit())
                        .source("CLINICAL")
                        .build()));

        history.sort(Comparator.comparing(VitalHistoryDto::getRecordedAt).reversed());
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}

