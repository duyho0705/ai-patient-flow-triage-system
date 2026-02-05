package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.api.dto.PatientInsuranceDto;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientService;

import java.util.List;
import java.util.Optional;
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
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'DOCTOR', 'ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Danh sách bệnh nhân (phân trang)")
    public PagedResponse<PatientDto> list(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> page = patientService.listByTenant(pageable);
        return PagedResponse.of(page,
                page.getContent().stream().map(PatientDto::fromEntity).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'DOCTOR', 'ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Lấy bệnh nhân theo ID")
    public PatientDto getById(@PathVariable UUID id) {
        return PatientDto.fromEntity(patientService.getById(id));
    }

    @GetMapping("/by-cccd")
    @Operation(summary = "Tìm bệnh nhân theo CCCD")
    public Optional<PatientDto> findByCccd(@RequestParam String cccd) {
        return patientService.findByCccd(cccd).map(PatientDto::fromEntity);
    }

    @GetMapping("/by-phone")
    @Operation(summary = "Tìm bệnh nhân theo số điện thoại")
    public Optional<PatientDto> findByPhone(@RequestParam String phone) {
        return patientService.findByPhone(phone).map(PatientDto::fromEntity);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Tạo bệnh nhân")
    public PatientDto create(@Valid @RequestBody CreatePatientRequest request) {
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
        return PatientDto.fromEntity(patientService.create(patient));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Cập nhật bệnh nhân")
    public PatientDto update(@PathVariable UUID id, @Valid @RequestBody UpdatePatientRequest request) {
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
        return PatientDto.fromEntity(patientService.update(id, updates));
    }

    @GetMapping("/{id}/insurances")
    @Operation(summary = "Danh sách bảo hiểm của bệnh nhân")
    public List<PatientInsuranceDto> getInsurances(@PathVariable UUID id) {
        return patientService.getInsurances(id).stream()
                .map(PatientInsuranceDto::fromEntity)
                .collect(Collectors.toList());
    }
}
