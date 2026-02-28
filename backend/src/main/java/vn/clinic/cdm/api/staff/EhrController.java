package vn.clinic.cdm.api.staff;

import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.clinical.TimelineItemDto;
import vn.clinic.cdm.api.dto.clinical.TriageVitalDto;
import vn.clinic.cdm.clinical.repository.HealthMetricRepository;
import vn.clinic.cdm.clinical.repository.ClinicalConsultationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ehr")
@RequiredArgsConstructor
@Tag(name = "EHR", description = "Há»“ sÆ¡ sá»©c khá»e Ä‘iá»‡n tá»­")
public class EhrController {

        private final HealthMetricRepository healthMetricRepository;
        private final ClinicalConsultationRepository consultationRepository;

        @GetMapping("/patient/{patientId}/vitals")
        @Operation(summary = "Láº¥y lá»‹ch sá»­ dáº¥u hiá»‡u sinh tá»“n")
        public ResponseEntity<ApiResponse<List<TriageVitalDto>>> getVitalsHistory(@PathVariable UUID patientId) {
                var data = healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId).stream()
                                .map(v -> new TriageVitalDto(v.getId(), v.getMetricType(), v.getValue(),
                                                v.getUnit(),
                                                v.getRecordedAt()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success(data));
        }

        @GetMapping("/patient/{patientId}/timeline")
        @Operation(summary = "Láº¥y dÃ²ng thá»i gian y táº¿ cá»§a bá»‡nh nhÃ¢n")
        public ResponseEntity<ApiResponse<List<TimelineItemDto>>> getTimeline(@PathVariable UUID patientId) {
                List<TimelineItemDto> timeline = new ArrayList<>();

                // 1. Consultations
                consultationRepository.findByPatientIdOrderByStartedAtDesc(patientId)
                                .forEach(c -> timeline.add(TimelineItemDto.builder()
                                                .id(c.getId().toString())
                                                .type("CONSULTATION")
                                                .timestamp(c.getStartedAt())
                                                .title("KhÃ¡m bá»‡nh")
                                                .subtitle(c.getDoctorUser() != null
                                                                ? "BS. " + c.getDoctorUser().getFullNameVi()
                                                                : "BÃ¡c sÄ©")
                                                .content(c.getDiagnosisNotes())
                                                .status(c.getStatus())
                                                .build()));

                var data = timeline.stream()
                                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success(data));
        }
}

