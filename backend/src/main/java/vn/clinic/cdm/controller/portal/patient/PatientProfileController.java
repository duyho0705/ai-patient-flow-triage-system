package vn.clinic.cdm.controller.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.dto.auth.ChangePasswordRequest;
import vn.clinic.cdm.dto.patient.PatientDto;
import vn.clinic.cdm.dto.patient.UpdatePatientProfileRequest;

import vn.clinic.cdm.security.AuthPrincipal;
import vn.clinic.cdm.service.auth.AuthService;
import vn.clinic.cdm.entity.patient.Patient;
import vn.clinic.cdm.service.patient.PatientPortalService;
import vn.clinic.cdm.common.annotation.AuditAction;

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
    @AuditAction("CHANGE_PASSWORD")
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
    @AuditAction("UPDATE_PROFILE")
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



    @GetMapping("/check-in-code")
    @Operation(summary = "Lấy mã QR Check-in số hóa")
    public ResponseEntity<ApiResponse<String>> getCheckInCode() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success("PATIENT_FLOW:" + p.getId()));
    }
}
