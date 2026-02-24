package vn.clinic.patientflow.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.auth.AuthService;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientPortalService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal/profile")
@RequiredArgsConstructor
@Tag(name = "Patient Profile", description = "Quản lý hồ sơ bệnh nhân")
@PreAuthorize("hasRole('PATIENT')")
public class PatientProfileController {

    private final PatientPortalService portalService;
    private final AuthService authService;

    @PostMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody ChangePasswordRequest request) {
        UUID userId = AuthPrincipal.getCurrentUserId();
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping
    @Operation(summary = "Lấy hồ sơ bệnh nhân hiện tại")
    public ResponseEntity<ApiResponse<PatientDto>> getProfile() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(PatientDto.fromEntity(p)));
    }

    @PutMapping
    @Operation(summary = "Cập nhật hồ sơ bệnh nhân")
    public ResponseEntity<ApiResponse<PatientDto>> updateProfile(
            @Valid @RequestBody UpdatePatientProfileRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.updateProfile(p.getId(), request)));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải ảnh đại diện")
    public ResponseEntity<ApiResponse<PatientDto>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.uploadAvatar(p.getId(), file)));
    }

    @GetMapping("/family")
    @Operation(summary = "Lấy danh sách người thân")
    public ResponseEntity<ApiResponse<List<PatientRelativeDto>>> getFamily() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.getFamily(p)));
    }

    @PostMapping("/family")
    @Operation(summary = "Thêm người thân")
    public ResponseEntity<ApiResponse<PatientRelativeDto>> addRelative(@RequestBody AddPatientRelativeRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.addRelative(p, request)));
    }

    @PutMapping("/family/{id}")
    @Operation(summary = "Cập nhật người thân")
    public ResponseEntity<ApiResponse<PatientRelativeDto>> updateRelative(
            @PathVariable UUID id, @RequestBody AddPatientRelativeRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.updateRelative(p, id, request)));
    }

    @DeleteMapping("/family/{id}")
    @Operation(summary = "Xóa người thân")
    public ResponseEntity<ApiResponse<Void>> deleteRelative(@PathVariable UUID id) {
        Patient p = portalService.getAuthenticatedPatient();
        portalService.deleteRelative(p, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/insurance")
    @Operation(summary = "Lấy danh sách bảo hiểm")
    public ResponseEntity<ApiResponse<List<PatientInsuranceDto>>> getInsurances() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.getInsurances(p.getId())));
    }

    @PostMapping("/insurance")
    @Operation(summary = "Thêm bảo hiểm")
    public ResponseEntity<ApiResponse<PatientInsuranceDto>> addInsurance(
            @RequestBody AddPatientInsuranceRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.addInsurance(p, request)));
    }

    @DeleteMapping("/insurance/{id}")
    @Operation(summary = "Xóa bảo hiểm")
    public ResponseEntity<ApiResponse<Void>> deleteInsurance(@PathVariable UUID id) {
        Patient p = portalService.getAuthenticatedPatient();
        portalService.deleteInsurance(p, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/check-in-code")
    @Operation(summary = "Lấy mã QR Check-in số hóa")
    public ResponseEntity<ApiResponse<String>> getCheckInCode() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success("PATIENT_FLOW:" + p.getId()));
    }
}
