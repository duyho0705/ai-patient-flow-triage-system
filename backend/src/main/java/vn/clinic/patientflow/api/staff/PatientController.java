package vn.clinic.patientflow.api.staff;

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
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientService;
import vn.clinic.patientflow.patient.service.PatientCrmService;

import java.util.List;
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
    private final PatientCrmService patientCrmService;

    @GetMapping("/{id}/crm-insights")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN', 'DOCTOR')")
    @Operation(summary = "Lấy phân tích gắn kết và gắn bó của bệnh nhân (Enterprise CRM)")
    public ResponseEntity<ApiResponse<PatientCrmInsightDto>> getCrmInsights(@PathVariable UUID id) {
        var patient = patientService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(patientCrmService.getPatientInsight(patient)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'DOCTOR', 'ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Danh sách bệnh nhân (phân trang)")
    public ResponseEntity<ApiResponse<PagedResponse<PatientDto>>> list(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> page = patientService.listByTenant(pageable);
        var data = PagedResponse.of(page,
                page.getContent().stream().map(PatientDto::fromEntity).collect(Collectors.toList()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'DOCTOR', 'ADMIN', 'CLINIC_MANAGER')")
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
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
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
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(PatientDto.fromEntity(patientService.create(patient))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Cập nhật bệnh nhân")
    public ResponseEntity<ApiResponse<PatientDto>> update(@PathVariable UUID id,
            @Valid @RequestBody UpdatePatientRequest request) {
        Patient updates = Patient.builder()
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
                .nationality(request.getNationality())
                .ethnicity(request.getEthnicity())
                .isActive(request.getIsActive())
                .build();
        return ResponseEntity.ok(ApiResponse.success(PatientDto.fromEntity(patientService.update(id, updates))));
    }

    @GetMapping("/{id}/insurances")
    @Operation(summary = "Danh sách bảo hiểm của bệnh nhân")
    public ResponseEntity<ApiResponse<List<PatientInsuranceDto>>> getInsurances(@PathVariable UUID id) {
        var data = patientService.getInsurances(id).stream()
                .map(PatientInsuranceDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/{id}/device-tokens")
    @Operation(summary = "Đăng ký FCM token cho bệnh nhân")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> registerToken(
            @PathVariable UUID id,
            @Valid @RequestBody RegisterDeviceTokenRequest request) {

        Patient patient = patientService.getById(id);
        patientService.registerDeviceToken(patient, request.getFcmToken(), request.getDeviceType());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
