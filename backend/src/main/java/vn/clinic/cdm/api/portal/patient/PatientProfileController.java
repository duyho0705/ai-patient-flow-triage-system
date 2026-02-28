package vn.clinic.cdm.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.auth.ChangePasswordRequest;
import vn.clinic.cdm.api.dto.patient.PatientDto;
import vn.clinic.cdm.api.dto.patient.UpdatePatientProfileRequest;
import vn.clinic.cdm.api.dto.patient.PatientRelativeDto;
import vn.clinic.cdm.api.dto.patient.AddPatientRelativeRequest;
import vn.clinic.cdm.api.dto.patient.PatientInsuranceDto;
import vn.clinic.cdm.api.dto.patient.AddPatientInsuranceRequest;

import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.auth.AuthService;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientPortalService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal/profile")
@RequiredArgsConstructor
@Tag(name = "Patient Profile", description = "Quáº£n lÃ½ há»“ sÆ¡ bá»‡nh nhÃ¢n")
@PreAuthorize("hasRole('PATIENT')")
public class PatientProfileController {

    private final PatientPortalService portalService;
    private final AuthService authService;

    @PostMapping("/change-password")
    @Operation(summary = "Äá»•i máº­t kháº©u")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody ChangePasswordRequest request) {
        UUID userId = AuthPrincipal.getCurrentUserId();
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping
    @Operation(summary = "Láº¥y há»“ sÆ¡ bá»‡nh nhÃ¢n hiá»‡n táº¡i")
    public ResponseEntity<ApiResponse<PatientDto>> getProfile() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(PatientDto.fromEntity(p)));
    }

    @PutMapping
    @Operation(summary = "Cáº­p nháº­t há»“ sÆ¡ bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<PatientDto>> updateProfile(
            @Valid @RequestBody UpdatePatientProfileRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.updateProfile(p.getId(), request)));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Táº£i áº£nh Ä‘áº¡i diá»‡n")
    public ResponseEntity<ApiResponse<PatientDto>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.uploadAvatar(p.getId(), file)));
    }

    @GetMapping("/family")
    @Operation(summary = "Láº¥y danh sÃ¡ch ngÆ°á»i thÃ¢n")
    public ResponseEntity<ApiResponse<List<PatientRelativeDto>>> getFamily() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.getFamily(p)));
    }

    @PostMapping("/family")
    @Operation(summary = "ThÃªm ngÆ°á»i thÃ¢n")
    public ResponseEntity<ApiResponse<PatientRelativeDto>> addRelative(@RequestBody AddPatientRelativeRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.addRelative(p, request)));
    }

    @PutMapping("/family/{id}")
    @Operation(summary = "Cáº­p nháº­t ngÆ°á»i thÃ¢n")
    public ResponseEntity<ApiResponse<PatientRelativeDto>> updateRelative(
            @PathVariable UUID id, @RequestBody AddPatientRelativeRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.updateRelative(p, id, request)));
    }

    @DeleteMapping("/family/{id}")
    @Operation(summary = "XÃ³a ngÆ°á»i thÃ¢n")
    public ResponseEntity<ApiResponse<Void>> deleteRelative(@PathVariable UUID id) {
        Patient p = portalService.getAuthenticatedPatient();
        portalService.deleteRelative(p, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/insurance")
    @Operation(summary = "Láº¥y danh sÃ¡ch báº£o hiá»ƒm")
    public ResponseEntity<ApiResponse<List<PatientInsuranceDto>>> getInsurances() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.getInsurances(p.getId())));
    }

    @PostMapping("/insurance")
    @Operation(summary = "ThÃªm báº£o hiá»ƒm")
    public ResponseEntity<ApiResponse<PatientInsuranceDto>> addInsurance(
            @RequestBody AddPatientInsuranceRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.addInsurance(p, request)));
    }

    @DeleteMapping("/insurance/{id}")
    @Operation(summary = "XÃ³a báº£o hiá»ƒm")
    public ResponseEntity<ApiResponse<Void>> deleteInsurance(@PathVariable UUID id) {
        Patient p = portalService.getAuthenticatedPatient();
        portalService.deleteInsurance(p, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/check-in-code")
    @Operation(summary = "Láº¥y mÃ£ QR Check-in sá»‘ hÃ³a")
    public ResponseEntity<ApiResponse<String>> getCheckInCode() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success("PATIENT_FLOW:" + p.getId()));
    }
}

