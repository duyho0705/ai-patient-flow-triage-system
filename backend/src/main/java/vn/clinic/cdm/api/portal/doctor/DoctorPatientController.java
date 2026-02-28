package vn.clinic.cdm.api.portal.doctor;

// Unused wildcard imports removed
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.patient.PatientDto;
import vn.clinic.cdm.clinical.service.AiClinicalService;
import vn.clinic.cdm.patient.service.PatientService;

import java.util.UUID;

@RestController
@RequestMapping("/api/doctor-portal/patients")
@RequiredArgsConstructor
@Tag(name = "Doctor Patient Management", description = "Quáº£n lÃ½ dá»¯ liá»‡u bá»‡nh nhÃ¢n dÃ nh cho bÃ¡c sÄ©")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorPatientController {

    private final PatientService patientService;
    private final AiClinicalService aiClinicalService;

    @GetMapping("/{patientId}/full-profile")
    @Operation(summary = "Xem há»“ sÆ¡ Ä‘áº§y Ä‘á»§ cá»§a bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientFullProfile(@PathVariable UUID patientId) {
        var patient = patientService.getById(patientId);
        return ResponseEntity.ok(ApiResponse.success(PatientDto.fromEntity(patient)));
    }

    @GetMapping("/{patientId}/clinical-summary")
    @Operation(summary = "Láº¥y báº£n tÃ³m táº¯t lÃ¢m sÃ ng thÃ´ng minh (AI Powered)")
    public ResponseEntity<ApiResponse<String>> getPatientClinicalSummary(@PathVariable UUID patientId) {
        var patient = patientService.getById(patientId);
        return ResponseEntity.ok(ApiResponse.success(aiClinicalService.generatePatientHistorySummary(patient)));
    }
}

