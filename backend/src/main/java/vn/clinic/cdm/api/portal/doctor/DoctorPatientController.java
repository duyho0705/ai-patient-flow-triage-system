package vn.clinic.cdm.api.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.common.PagedResponse;
import vn.clinic.cdm.api.dto.patient.PatientDto;
import vn.clinic.cdm.api.dto.clinical.ConsultationDetailDto;
import vn.clinic.cdm.api.dto.clinical.ConsultationDto;
import vn.clinic.cdm.clinical.service.AiClinicalService;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientPortalService;
import vn.clinic.cdm.patient.service.PatientService;
import vn.clinic.cdm.clinical.repository.DoctorRepository;
import vn.clinic.cdm.clinical.service.DoctorReportingService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Quản lý Bệnh nhân — Doctor Portal.
 * <p>
 * Bác sĩ có thể:
 * - Xem danh sách bệnh nhân (phân trang)
 * - Xem hồ sơ đầy đủ
 * - Lấy tóm tắt lâm sàng thông minh (AI)
 */
@RestController
@RequestMapping("/api/doctor-portal/patients")
@RequiredArgsConstructor
@Tag(name = "Doctor Patient Management", description = "Quản lý dữ liệu bệnh nhân dành cho bác sĩ")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorPatientController {

    private final PatientService patientService;
    private final AiClinicalService aiClinicalService;
    private final PatientPortalService portalService;
    private final DoctorRepository doctorRepository;
    private final DoctorReportingService reportingService;

    @GetMapping
    @Operation(summary = "Danh sách bệnh nhân (phân trang, tìm kiếm, lọc)")
    public ResponseEntity<ApiResponse<PagedResponse<PatientDto>>> getPatientList(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String chronicCondition,
            @PageableDefault(size = 20) Pageable pageable) {

        UUID userId = vn.clinic.cdm.auth.AuthPrincipal.getCurrentUserId();
        var doctorOpt = doctorRepository.findByIdentityUser_Id(userId);

        if (doctorOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(PagedResponse.empty()));
        }

        Page<Patient> page = patientService.searchPatientsForDoctor(doctorOpt.get().getId(), search, riskLevel, chronicCondition, pageable);

        var data = PagedResponse.of(page,
                page.getContent().stream()
                        .map(PatientDto::fromEntity)
                        .collect(Collectors.toList()));

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{patientId}/full-profile")
    @Operation(summary = "Xem hồ sơ đầy đủ của bệnh nhân")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientFullProfile(@PathVariable UUID patientId) {
        var patient = patientService.getById(patientId);
        return ResponseEntity.ok(ApiResponse.success(PatientDto.fromEntity(patient)));
    }

    @GetMapping("/{patientId}/clinical-summary")
    @Operation(summary = "Lấy bản tóm tắt lâm sàng thông minh (AI Powered)")
    public ResponseEntity<ApiResponse<String>> getPatientClinicalSummary(@PathVariable UUID patientId) {
        var patient = patientService.getById(patientId);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.generatePatientHistorySummary(patient)));
    }

    @GetMapping("/{patientId}/history")
    @Operation(summary = "Lịch sử khám bệnh của bệnh nhân")
    public ResponseEntity<ApiResponse<PagedResponse<ConsultationDto>>> getPatientHistory(
            @PathVariable UUID patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(portalService.getMedicalHistory(patientId, page, size)));
    }

    @GetMapping("/{patientId}/history/{consultationId}")
    @Operation(summary = "Chi tiết ca khám của bệnh nhân")
    public ResponseEntity<ApiResponse<ConsultationDetailDto>> getPatientHistoryDetail(
            @PathVariable UUID patientId,
            @PathVariable UUID consultationId) {
        return ResponseEntity.ok(ApiResponse.success(portalService.getConsultationDetail(patientId, consultationId)));
    }

    @GetMapping("/{patientId}/export-pdf")
    @Operation(summary = "Xuất báo cáo sức khỏe bệnh nhân (PDF)")
    public ResponseEntity<InputStreamResource> exportPatientReport(@PathVariable UUID patientId) {
        var bis = reportingService.generatePatientReportPdf(patientId);
        
        var headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=CDM_Report_" + patientId + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
