package vn.clinic.patientflow.api.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.PatientDto;
import vn.clinic.patientflow.clinical.service.AiClinicalService;
import vn.clinic.patientflow.patient.service.PatientService;

import java.util.UUID;

@RestController
@RequestMapping("/api/doctor-portal/patients")
@RequiredArgsConstructor
@Tag(name = "Doctor Patient Management", description = "Quản lý dữ liệu bệnh nhân dành cho bác sĩ")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorPatientController {

    private final PatientService patientService;
    private final AiClinicalService aiClinicalService;

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
