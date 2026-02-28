package vn.clinic.cdm.api.clinical;

// Unused wildcard imports removed
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.clinical.domain.MedicationSchedule;
import vn.clinic.cdm.clinical.service.MedicationService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clinical/medication")
@RequiredArgsConstructor
@Tag(name = "Medication Management", description = "Quáº£n lÃ½ thuá»‘c (Role 1)")
public class MedicationController {

    private final MedicationService medicationService;

    @GetMapping("/schedules/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Xem lá»‹ch uá»‘ng thuá»‘c")
    public ResponseEntity<ApiResponse<List<MedicationSchedule>>> getSchedules(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(medicationService.getPatientSchedules(patientId)));
    }

    @PostMapping("/schedules/{scheduleId}/take")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "ÄÃ¡nh dáº¥u Ä‘Ã£ uá»‘ng thuá»‘c")
    public ResponseEntity<ApiResponse<MedicationSchedule>> takeMedicine(@PathVariable UUID scheduleId) {
        return ResponseEntity.ok(ApiResponse.success(medicationService.markAsTaken(scheduleId)));
    }
}

