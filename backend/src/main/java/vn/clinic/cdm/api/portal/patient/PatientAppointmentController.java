package vn.clinic.cdm.api.portal.patient;

import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.api.dto.scheduling.SlotAvailabilityDto;
import vn.clinic.cdm.api.dto.scheduling.CreateAppointmentRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientPortalService;
import vn.clinic.cdm.scheduling.service.SchedulingService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/appointments")
@RequiredArgsConstructor
@Tag(name = "Patient Appointments", description = "Quáº£n lÃ½ lá»‹ch háº¹n bá»‡nh nhÃ¢n")
@PreAuthorize("hasRole('PATIENT')")
public class PatientAppointmentController {

    private final PatientPortalService portalService;
    private final SchedulingService schedulingService;

    @GetMapping
    @Operation(summary = "Danh sÃ¡ch lá»‹ch háº¹n cá»§a bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointments() {
        Patient p = portalService.getAuthenticatedPatient();
        var data = schedulingService.getAppointmentsByPatient(p.getId())
                .stream().map(AppointmentDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/slots")
    @Operation(summary = "Láº¥y danh sÃ¡ch slot kháº£ dá»¥ng")
    public ResponseEntity<ApiResponse<List<SlotAvailabilityDto>>> getSlots(
            @RequestParam UUID branchId,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(schedulingService.getAvailableSlots(branchId, date)));
    }

    @PostMapping
    @Operation(summary = "Äáº·t lá»‹ch háº¹n má»›i")
    public ResponseEntity<ApiResponse<AppointmentDto>> createAppointment(
            @RequestBody CreateAppointmentRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.createAppointment(p, request)));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Há»§y lá»‹ch háº¹n")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(@PathVariable UUID id) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.cancelAppointment(p.getId(), id)));
    }
}

