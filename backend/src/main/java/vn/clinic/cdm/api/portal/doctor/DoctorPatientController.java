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
import vn.clinic.cdm.clinical.service.AiClinicalService;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientService;

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

    @GetMapping
    @Operation(summary = "Danh sách bệnh nhân (phân trang, tìm kiếm)")
    public ResponseEntity<ApiResponse<PagedResponse<PatientDto>>> getPatientList(
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Patient> page = patientService.listByTenant(pageable);

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
}
