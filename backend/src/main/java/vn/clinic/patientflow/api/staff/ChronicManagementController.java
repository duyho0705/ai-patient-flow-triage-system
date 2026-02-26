package vn.clinic.patientflow.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.patient.domain.PatientChronicCondition;
import vn.clinic.patientflow.patient.domain.PatientVitalTarget;
import vn.clinic.patientflow.patient.repository.PatientChronicConditionRepository;
import vn.clinic.patientflow.patient.repository.PatientVitalTargetRepository;
import vn.clinic.patientflow.patient.repository.PatientVitalLogRepository;
import vn.clinic.patientflow.clinical.repository.ClinicalVitalRepository;
import vn.clinic.patientflow.api.dto.VitalHistoryDto;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/chronic")
@RequiredArgsConstructor
@Tag(name = "Chronic Management", description = "Quản lý bệnh mãn tính")
@PreAuthorize("hasAnyRole('DOCTOR', 'TRIAGE_NURSE', 'ADMIN')")
public class ChronicManagementController {

    private final PatientChronicConditionRepository chronicConditionRepository;
    private final PatientVitalTargetRepository vitalTargetRepository;
    private final PatientVitalLogRepository patientVitalLogRepository;
    private final ClinicalVitalRepository clinicalVitalRepository;

    @GetMapping("/conditions")
    @Operation(summary = "Lấy danh sách bệnh mãn tính của bệnh nhân")
    public ResponseEntity<ApiResponse<List<PatientChronicCondition>>> getConditions(@RequestParam UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(chronicConditionRepository.findByPatientId(patientId)));
    }

    @PostMapping("/conditions")
    @Operation(summary = "Thêm bệnh mãn tính mới")
    public ResponseEntity<ApiResponse<PatientChronicCondition>> addCondition(
            @RequestBody PatientChronicCondition condition) {
        return ResponseEntity.ok(ApiResponse.success(chronicConditionRepository.save(condition)));
    }

    @GetMapping("/targets")
    @Operation(summary = "Lấy danh sách ngưỡng chỉ số mục tiêu")
    public ResponseEntity<ApiResponse<List<PatientVitalTarget>>> getTargets(@RequestParam UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(vitalTargetRepository.findByPatientId(patientId)));
    }

    @PostMapping("/targets")
    @Operation(summary = "Thiết lập ngưỡng mục tiêu mới cho bệnh nhân")
    public ResponseEntity<ApiResponse<PatientVitalTarget>> addTarget(@RequestBody PatientVitalTarget target) {
        return ResponseEntity.ok(ApiResponse.success(vitalTargetRepository.save(target)));
    }

    @GetMapping("/vitals")
    @Operation(summary = "Lấy lịch sử sinh hiệu tổng hợp (CDM + Clinical)")
    public ResponseEntity<ApiResponse<List<VitalHistoryDto>>> getVitalHistory(@RequestParam UUID patientId) {
        List<VitalHistoryDto> history = new ArrayList<>();

        patientVitalLogRepository.findByPatientIdOrderByRecordedAtDesc(patientId)
                .stream().limit(10)
                .forEach(v -> history.add(VitalHistoryDto.builder()
                        .recordedAt(v.getRecordedAt())
                        .vitalType(v.getVitalType())
                        .valueNumeric(v.getValueNumeric())
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
