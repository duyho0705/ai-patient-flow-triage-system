package vn.clinic.cdm.controller.clinic;

import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.dto.common.PagedResponse;
import vn.clinic.cdm.dto.patient.PatientDto;
import vn.clinic.cdm.dto.patient.CreatePatientRequest;
import vn.clinic.cdm.dto.patient.UpdatePatientRequest;
import vn.clinic.cdm.dto.messaging.RegisterDeviceTokenRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import vn.clinic.cdm.entity.patient.Patient;
import vn.clinic.cdm.service.patient.PatientService;

import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Bệnh nhân – tenant-scoped (header X-Tenant-Id bắt buộc).
 */
@RestController
@RequestMapping(value = "/api/patients", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Patient", description = "Bệnh nhân")
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'DOCTOR')")
    @Operation(summary = "Danh sách bệnh nhân (phân trang)")
    public ResponseEntity<ApiResponse<PagedResponse<PatientDto>>> list(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> page = patientService.listByTenant(pageable);
        var data = PagedResponse.of(page,
                page.getContent().stream().map(PatientDto::fromEntity).collect(Collectors.toList()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'DOCTOR')")
    @Operation(summary = "Lấy bệnh nhân theo ID")
    public ResponseEntity<ApiResponse<PatientDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(PatientDto.fromEntity(patientService.getById(id))));
    }

    @GetMapping("/by-cccd")
    @Operation(summary = "Tìm bệnh nhân theo CCCD")
    public ResponseEntity<ApiResponse<PatientDto>> findByCccd(@RequestParam String cccd) {
        return ResponseEntity
                .ok(ApiResponse.success(patientService.findByCccd(cccd).map(PatientDto::fromEntity).orElse(null)));
    }

    @GetMapping("/by-phone")
    @Operation(summary = "Tìm bệnh nhân theo số điện thoại")
    public ResponseEntity<ApiResponse<PatientDto>> findByPhone(@RequestParam String phone) {
        return ResponseEntity
                .ok(ApiResponse.success(patientService.findByPhone(phone).map(PatientDto::fromEntity).orElse(null)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'DOCTOR')")
    @Operation(summary = "Tạo bệnh nhân")
    public ResponseEntity<ApiResponse<PatientDto>> create(@Valid @RequestBody CreatePatientRequest request) {
        Patient patient = Patient.builder()
                .externalId(request.getExternalId())
                .cccd(request.getCccd())
                .fullNameVi(request.getFullNameVi())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .phone(request.getPhone())
                .email(request.getEmail())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .district(request.getDistrict())
                .ward(request.getWard())
                .nationality(request.getNationality() != null ? request.getNationality() : "VN")
                .ethnicity(request.getEthnicity())
                .riskLevel(request.getRiskLevel() != null ? request.getRiskLevel() : "LOW")
                .chronicConditions(request.getChronicConditions())
                .isActive(true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(PatientDto.fromEntity(patientService.create(patient))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'DOCTOR')")
    @Operation(summary = "Cập nhật bệnh nhân")
    public ResponseEntity<ApiResponse<PatientDto>> update(@PathVariable UUID id,
            @Valid @RequestBody UpdatePatientRequest request) {
        return ResponseEntity.ok(ApiResponse.success(PatientDto.fromEntity(patientService.update(id, request))));
    }

    @PostMapping("/{id}/device-tokens")
    @Operation(summary = "Đăng ký FCM token cho bệnh nhân")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> registerToken(
            @PathVariable UUID id,
            @Valid @RequestBody RegisterDeviceTokenRequest request) {

        Patient patient = patientService.getById(id);
        patientService.registerDeviceToken(patient, request.getFcmToken(), request.getDeviceType());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
