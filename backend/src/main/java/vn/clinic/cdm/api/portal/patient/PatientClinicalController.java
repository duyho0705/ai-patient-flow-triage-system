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
@Tag(name = "Patient Clinical", description = "Quản lý dữ liệu lâm sàng của bệnh nhân")
@PreAuthorize("hasRole('PATIENT')")
public class PatientClinicalController {

        private final PatientPortalService portalService;

        @GetMapping("/dashboard")
        @Operation(summary = "Dữ liệu tổng quan cho trang chủ bệnh nhân")
        public ResponseEntity<ApiResponse<PatientDashboardDto>> getDashboard() {
                Patient p = portalService.getAuthenticatedPatient();
                return ResponseEntity.ok(ApiResponse.success(portalService.getDashboardData(p.getId())));
        }

        @GetMapping("/medical-history")
        @Operation(summary = "Lịch sử khám bệnh (Có phân trang)")
        public ResponseEntity<ApiResponse<PagedResponse<ConsultationDto>>> getHistory(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Patient p = portalService.getAuthenticatedPatient();
                return ResponseEntity.ok(ApiResponse.success(portalService.getMedicalHistory(p.getId(), page, size)));
        }

        @GetMapping("/medical-history/{id}")
        @Operation(summary = "Chi tiết ca khám")
        public ResponseEntity<ApiResponse<ConsultationDetailDto>> getHistoryDetail(@PathVariable UUID id) {
                Patient p = portalService.getAuthenticatedPatient();
                return ResponseEntity.ok(ApiResponse.success(portalService.getConsultationDetail(p.getId(), id)));
        }

        @GetMapping("/vitals/trends")
        @Operation(summary = "Dữ liệu xu hướng sinh hiệu cho biểu đồ (hỗ trợ lọc ngày/tuần/tháng)")
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
        @Operation(summary = "Bệnh nhân tự nhập chỉ số sinh hiệu")
        public ResponseEntity<ApiResponse<PatientVitalLogDto>> logVital(@RequestBody PatientVitalLogDto dto) {
                Patient p = portalService.getAuthenticatedPatient();
                return ResponseEntity.ok(ApiResponse.success(portalService.logVitalMetric(p, dto)));
        }

        @PostMapping(value = "/vitals/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "Nhập chỉ số sinh hiệu kèm ảnh máy đo")
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
