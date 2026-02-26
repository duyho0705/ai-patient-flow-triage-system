package vn.clinic.patientflow.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.TimelineItemDto;
import vn.clinic.patientflow.api.dto.TriageVitalDto;
import vn.clinic.patientflow.patient.repository.PatientVitalLogRepository;
import vn.clinic.patientflow.clinical.repository.ClinicalConsultationRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ehr")
@RequiredArgsConstructor
@Tag(name = "EHR", description = "Hồ sơ sức khỏe điện tử")
public class EhrController {

        private final PatientVitalLogRepository vitalRepository;
        private final ClinicalConsultationRepository consultationRepository;

        @GetMapping("/patient/{patientId}/vitals")
        @Operation(summary = "Lấy lịch sử dấu hiệu sinh tồn")
        public ResponseEntity<ApiResponse<List<TriageVitalDto>>> getVitalsHistory(@PathVariable UUID patientId) {
                var data = vitalRepository.findByPatientIdOrderByRecordedAtDesc(patientId).stream()
                                .map(v -> new TriageVitalDto(v.getId(), v.getVitalType(), v.getValueNumeric(),
                                                v.getUnit(),
                                                v.getRecordedAt()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success(data));
        }

        @GetMapping("/patient/{patientId}/timeline")
        @Operation(summary = "Lấy dòng thời gian y tế của bệnh nhân")
        public ResponseEntity<ApiResponse<List<TimelineItemDto>>> getTimeline(@PathVariable UUID patientId) {
                List<TimelineItemDto> timeline = new ArrayList<>();

                // 1. Consultations
                consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId)
                                .forEach(c -> timeline.add(TimelineItemDto.builder()
                                                .id(c.getId().toString())
                                                .type("CONSULTATION")
                                                .timestamp(c.getStartedAt())
                                                .title("Khám bệnh")
                                                .subtitle(c.getDoctorUser() != null
                                                                ? "BS. " + c.getDoctorUser().getFullNameVi()
                                                                : "Bác sĩ")
                                                .content(c.getDiagnosisNotes())
                                                .status(c.getStatus())
                                                .build()));

                var data = timeline.stream()
                                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success(data));
        }
}
