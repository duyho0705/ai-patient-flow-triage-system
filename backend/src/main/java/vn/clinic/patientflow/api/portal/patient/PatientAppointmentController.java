package vn.clinic.patientflow.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientPortalService;
import vn.clinic.patientflow.scheduling.service.SchedulingService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/appointments")
@RequiredArgsConstructor
@Tag(name = "Patient Appointments", description = "Quản lý lịch hẹn bệnh nhân")
@PreAuthorize("hasRole('PATIENT')")
public class PatientAppointmentController {

    private final PatientPortalService portalService;
    private final SchedulingService schedulingService;

    @GetMapping
    @Operation(summary = "Danh sách lịch hẹn của bệnh nhân")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointments() {
        Patient p = portalService.getAuthenticatedPatient();
        var data = schedulingService.getAppointmentsByPatient(p.getId())
                .stream().map(AppointmentDto::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/slots")
    @Operation(summary = "Lấy danh sách slot khả dụng")
    public ResponseEntity<ApiResponse<List<SlotAvailabilityDto>>> getSlots(
            @RequestParam UUID branchId,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(schedulingService.getAvailableSlots(branchId, date)));
    }

    @PostMapping
    @Operation(summary = "Đặt lịch hẹn mới")
    public ResponseEntity<ApiResponse<AppointmentDto>> createAppointment(
            @RequestBody CreateAppointmentRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.createAppointment(p, request)));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Hủy lịch hẹn")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(@PathVariable UUID id) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(portalService.cancelAppointment(p.getId(), id)));
    }
}
