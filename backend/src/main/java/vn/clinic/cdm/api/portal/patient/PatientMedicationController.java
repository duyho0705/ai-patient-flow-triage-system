package vn.clinic.cdm.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.medication.MedicationReminderDto;
import vn.clinic.cdm.api.dto.medication.MedicationDosageLogDto;
import vn.clinic.cdm.clinical.service.MedicationService;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientPortalService;
import vn.clinic.cdm.clinical.service.MedicationMapper;

import java.util.List;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/medication-reminders")
@RequiredArgsConstructor
@Tag(name = "Patient Medication", description = "Quáº£n lÃ½ nháº¯c lá»‹ch uá»‘ng thuá»‘c")
@PreAuthorize("hasRole('PATIENT')")
public class PatientMedicationController {

    private final PatientPortalService portalService;
    private final MedicationService medicationService;
    private final MedicationMapper medicationMapper;

    @GetMapping
    @Operation(summary = "Láº¥y danh sÃ¡ch nháº¯c lá»‹ch uá»‘ng thuá»‘c")
    public ResponseEntity<ApiResponse<List<MedicationReminderDto>>> getReminders() {
        Patient p = portalService.getAuthenticatedPatient();
        List<MedicationReminderDto> data = medicationService.getDailySchedules(p.getId()).stream()
                .map(medicationMapper::toReminderDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/log")
    @Operation(summary = "Ghi nháº­n Ä‘Ã£ uá»‘ng thuá»‘c")
    public ResponseEntity<ApiResponse<MedicationDosageLogDto>> logDosage(@RequestBody MedicationDosageLogDto dto) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.markMedicationTaken(p, dto)));
    }
}
