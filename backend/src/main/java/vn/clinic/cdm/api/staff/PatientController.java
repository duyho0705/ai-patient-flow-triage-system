package vn.clinic.cdm.api.staff;

import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.common.PagedResponse;
import vn.clinic.cdm.api.dto.patient.PatientCrmInsightDto;
import vn.clinic.cdm.api.dto.patient.PatientDto;
import vn.clinic.cdm.api.dto.patient.CreatePatientRequest;
import vn.clinic.cdm.api.dto.patient.UpdatePatientRequest;
import vn.clinic.cdm.api.dto.patient.PatientInsuranceDto;
import vn.clinic.cdm.api.dto.messaging.RegisterDeviceTokenRequest;
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

import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientService;
import vn.clinic.cdm.patient.service.PatientCrmService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Bá»‡nh nhÃ¢n â€“ tenant-scoped (header X-Tenant-Id báº¯t buá»™c).
 */
@RestController
@RequestMapping(value = "/api/patients", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Patient", description = "Bá»‡nh nhÃ¢n")
public class PatientController {

    private final PatientService patientService;
    private final PatientCrmService patientCrmService;

    @GetMapping("/{id}/crm-insights")
    @PreAuthorize("hasAnyRole('CLINIC_MANAGER', 'ADMIN', 'DOCTOR')")
    @Operation(summary = "Láº¥y phÃ¢n tÃ­ch gáº¯n káº¿t vÃ  gáº¯n bÃ³ cá»§a bá»‡nh nhÃ¢n (Enterprise CRM)")
    public ResponseEntity<ApiResponse<PatientCrmInsightDto>> getCrmInsights(@PathVariable UUID id) {
        var patient = patientService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(patientCrmService.getPatientInsight(patient)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'DOCTOR', 'ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Danh sÃ¡ch bá»‡nh nhÃ¢n (phÃ¢n trang)")
    public ResponseEntity<ApiResponse<PagedResponse<PatientDto>>> list(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> page = patientService.listByTenant(pageable);
        var data = PagedResponse.of(page,
                page.getContent().stream().map(PatientDto::fromEntity).collect(Collectors.toList()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'DOCTOR', 'ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Láº¥y bá»‡nh nhÃ¢n theo ID")
    public ResponseEntity<ApiResponse<PatientDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(PatientDto.fromEntity(patientService.getById(id))));
    }

    @GetMapping("/by-cccd")
    @Operation(summary = "TÃ¬m bá»‡nh nhÃ¢n theo CCCD")
    public ResponseEntity<ApiResponse<PatientDto>> findByCccd(@RequestParam String cccd) {
        return ResponseEntity
                .ok(ApiResponse.success(patientService.findByCccd(cccd).map(PatientDto::fromEntity).orElse(null)));
    }

    @GetMapping("/by-phone")
    @Operation(summary = "TÃ¬m bá»‡nh nhÃ¢n theo sá»‘ Ä‘iá»‡n thoáº¡i")
    public ResponseEntity<ApiResponse<PatientDto>> findByPhone(@RequestParam String phone) {
        return ResponseEntity
                .ok(ApiResponse.success(patientService.findByPhone(phone).map(PatientDto::fromEntity).orElse(null)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Táº¡o bá»‡nh nhÃ¢n")
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
    @Operation(summary = "Cáº­p nháº­t bá»‡nh nhÃ¢n")
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
    @Operation(summary = "Danh sÃ¡ch báº£o hiá»ƒm cá»§a bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<List<PatientInsuranceDto>>> getInsurances(@PathVariable UUID id) {
        var data = patientService.getInsurances(id).stream()
                .map(PatientInsuranceDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/{id}/device-tokens")
    @Operation(summary = "ÄÄƒng kÃ½ FCM token cho bá»‡nh nhÃ¢n")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> registerToken(
            @PathVariable UUID id,
            @Valid @RequestBody RegisterDeviceTokenRequest request) {

        Patient patient = patientService.getById(id);
        patientService.registerDeviceToken(patient, request.getFcmToken(), request.getDeviceType());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

