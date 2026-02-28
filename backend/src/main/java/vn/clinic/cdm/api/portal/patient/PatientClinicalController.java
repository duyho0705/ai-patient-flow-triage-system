package vn.clinic.cdm.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.common.PagedResponse;
import vn.clinic.cdm.api.dto.patient.PatientDashboardDto;
import vn.clinic.cdm.api.dto.patient.PatientVitalLogDto;
import vn.clinic.cdm.api.dto.clinical.ConsultationDto;
import vn.clinic.cdm.api.dto.clinical.ConsultationDetailDto;
import vn.clinic.cdm.api.dto.clinical.VitalTrendDto;

import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientPortalService;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal/clinical")
@RequiredArgsConstructor
@Tag(name = "Patient Clinical", description = "Quáº£n lÃ½ dá»¯ liá»‡u lÃ¢m sÃ ng cá»§a bá»‡nh nhÃ¢n")
@PreAuthorize("hasRole('PATIENT')")
public class PatientClinicalController {

        private final PatientPortalService portalService;

        @GetMapping("/dashboard")
        @Operation(summary = "Dá»¯ liá»‡u tá»•ng quan cho trang chá»§ bá»‡nh nhÃ¢n")
        public ResponseEntity<ApiResponse<PatientDashboardDto>> getDashboard() {
                Patient p = portalService.getAuthenticatedPatient();
                return ResponseEntity.ok(ApiResponse.success(portalService.getDashboardData(p.getId())));
        }

        @GetMapping("/medical-history")
        @Operation(summary = "Lá»‹ch sá»­ khÃ¡m bá»‡nh (CÃ³ phÃ¢n trang)")
        public ResponseEntity<ApiResponse<PagedResponse<ConsultationDto>>> getHistory(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Patient p = portalService.getAuthenticatedPatient();
                return ResponseEntity.ok(ApiResponse.success(portalService.getMedicalHistory(p.getId(), page, size)));
        }

        @GetMapping("/medical-history/{id}")
        @Operation(summary = "Chi tiáº¿t ca khÃ¡m")
        public ResponseEntity<ApiResponse<ConsultationDetailDto>> getHistoryDetail(@PathVariable UUID id) {
                Patient p = portalService.getAuthenticatedPatient();
                return ResponseEntity.ok(ApiResponse.success(portalService.getConsultationDetail(p.getId(), id)));
        }

        @GetMapping("/vitals/trends")
        @Operation(summary = "Dá»¯ liá»‡u xu hÆ°á»›ng sinh hiá»‡u cho biá»ƒu Ä‘á»“ (há»— trá»£ lá»c ngÃ y/tuáº§n/thÃ¡ng)")
        public ResponseEntity<ApiResponse<List<VitalTrendDto>>> getVitalTrends(
                        @RequestParam String type,
                        @RequestParam(required = false) String from,
                        @RequestParam(required = false) String to) {
                Patient p = portalService.getAuthenticatedPatient();

                if (from != null && to != null) {
                        Instant fromInstant = Instant.parse(from);
                        Instant toInstant = Instant.parse(to);
                        return ResponseEntity.ok(ApiResponse.success(
                                        portalService.getVitalTrendsFiltered(p.getId(), type, fromInstant, toInstant)));
                }

                return ResponseEntity.ok(ApiResponse.success(portalService.getVitalTrends(p.getId(), type)));
        }

        @PostMapping("/vitals")
        @Operation(summary = "Bá»‡nh nhÃ¢n tá»± nháº­p chá»‰ sá»‘ sinh hiá»‡u")
        public ResponseEntity<ApiResponse<PatientVitalLogDto>> logVital(@RequestBody PatientVitalLogDto dto) {
                Patient p = portalService.getAuthenticatedPatient();
                return ResponseEntity.ok(ApiResponse.success(portalService.logVitalMetric(p, dto)));
        }

        @PostMapping(value = "/vitals/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "Nháº­p chá»‰ sá»‘ sinh hiá»‡u kÃ¨m áº£nh mÃ¡y Ä‘o")
        public ResponseEntity<ApiResponse<PatientVitalLogDto>> logVitalWithImage(
                        @RequestParam String vitalType,
                        @RequestParam BigDecimal valueNumeric,
                        @RequestParam(required = false) String unit,
                        @RequestParam(required = false) String notes,
                        @RequestParam("image") MultipartFile image) {
                Patient p = portalService.getAuthenticatedPatient();
                PatientVitalLogDto dto = PatientVitalLogDto.builder()
                                .vitalType(vitalType)
                                .valueNumeric(valueNumeric)
                                .unit(unit)
                                .notes(notes)
                                .build();
                return ResponseEntity.ok(ApiResponse.success(portalService.logVitalWithImage(p, dto, image)));
        }
}

