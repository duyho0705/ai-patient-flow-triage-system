package vn.clinic.patientflow.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.MedicationReminderDto;
import vn.clinic.patientflow.api.dto.MedicationDosageLogDto;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.patient.domain.MedicationReminder;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientPortalService;
import vn.clinic.patientflow.patient.service.MedicationReminderService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/medication-reminders")
@RequiredArgsConstructor
@Tag(name = "Patient Medication", description = "Quản lý nhắc lịch uống thuốc")
@PreAuthorize("hasRole('PATIENT')")
public class PatientMedicationController {

    private final PatientPortalService portalService;
    private final MedicationReminderService medicationReminderService;

    @GetMapping
    @Operation(summary = "Lấy danh sách nhắc lịch uống thuốc")
    public ResponseEntity<ApiResponse<List<MedicationReminderDto>>> getReminders() {
        Patient p = portalService.getAuthenticatedPatient();
        var data = medicationReminderService.getRemindersByPatient(p.getId()).stream()
                .map(MedicationReminderDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping
    @Operation(summary = "Tạo nhắc lịch mới")
    public ResponseEntity<ApiResponse<MedicationReminderDto>> createReminder(@RequestBody MedicationReminderDto dto) {
        Patient p = portalService.getAuthenticatedPatient();
        MedicationReminder reminder = MedicationReminder.builder()
                .patient(p)
                .medicineName(dto.getMedicineName())
                .reminderTime(dto.getReminderTime())
                .dosage(dto.getDosage())
                .isActive(true)
                .notes(dto.getNotes())
                .build();
        return ResponseEntity
                .ok(ApiResponse.success(MedicationReminderDto.fromEntity(medicationReminderService.create(reminder))));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật nhắc lịch")
    public ResponseEntity<ApiResponse<MedicationReminderDto>> updateReminder(@PathVariable UUID id,
            @RequestBody MedicationReminderDto dto) {
        Patient p = portalService.getAuthenticatedPatient();
        var existing = medicationReminderService.getById(id);
        if (!existing.getPatient().getId().equals(p.getId())) {
            throw new ResourceNotFoundException("MedicationReminder", id);
        }
        existing.setReminderTime(dto.getReminderTime());
        existing.setDosage(dto.getDosage());
        existing.setIsActive(dto.getIsActive());
        existing.setNotes(dto.getNotes());
        return ResponseEntity.ok(
                ApiResponse.success(MedicationReminderDto.fromEntity(medicationReminderService.update(id, existing))));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa nhắc lịch")
    public ResponseEntity<ApiResponse<Void>> deleteReminder(@PathVariable UUID id) {
        Patient p = portalService.getAuthenticatedPatient();
        var existing = medicationReminderService.getById(id);
        if (!existing.getPatient().getId().equals(p.getId())) {
            throw new ResourceNotFoundException("MedicationReminder", id);
        }
        medicationReminderService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/log")
    @Operation(summary = "Ghi nhận đã uống thuốc")
    public ResponseEntity<ApiResponse<MedicationDosageLogDto>> logDosage(@RequestBody MedicationDosageLogDto dto) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.markMedicationTaken(p, dto)));
    }
}
