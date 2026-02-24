package vn.clinic.patientflow.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.service.IdentityService;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientService;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;
import vn.clinic.patientflow.scheduling.service.SchedulingService;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.service.TenantService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Lịch hẹn – tenant-scoped (X-Tenant-Id bắt buộc).
 */
@RestController
@RequestMapping(value = "/api/appointments", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Scheduling", description = "Lịch hẹn")
public class SchedulingController {

    private final SchedulingService schedulingService;
    private final TenantService tenantService;
    private final PatientService patientService;
    private final IdentityService identityService;

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Danh sách lịch hẹn theo chi nhánh và ngày")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentDto>>> list(
            @RequestParam UUID branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<SchedulingAppointment> page = schedulingService.getAppointmentsByBranchAndDate(branchId, date, pageable);
        var data = PagedResponse.of(page,
                page.getContent().stream().map(AppointmentDto::fromEntity).collect(Collectors.toList()));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy lịch hẹn theo ID")
    public ResponseEntity<ApiResponse<AppointmentDto>> getById(@PathVariable UUID id) {
        return ResponseEntity
                .ok(ApiResponse.success(AppointmentDto.fromEntity(schedulingService.getAppointmentById(id))));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Tạo lịch hẹn")
    public ResponseEntity<ApiResponse<AppointmentDto>> create(@Valid @RequestBody CreateAppointmentRequest request) {
        TenantBranch branch = tenantService.getBranchById(request.getBranchId());
        Patient patient = patientService.getById(request.getPatientId());
        IdentityUser createdByUser = request.getCreatedByUserId() != null
                ? identityService.getUserById(request.getCreatedByUserId())
                : null;

        SchedulingAppointment appointment = SchedulingAppointment.builder()
                .branch(branch)
                .patient(patient)
                .appointmentDate(request.getAppointmentDate())
                .slotStartTime(request.getSlotStartTime())
                .slotEndTime(request.getSlotEndTime())
                .status(request.getStatus())
                .appointmentType(request.getAppointmentType())
                .notes(request.getNotes())
                .createdByUser(createdByUser)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppointmentDto.fromEntity(schedulingService.createAppointment(appointment))));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Cập nhật trạng thái lịch hẹn")
    public ResponseEntity<ApiResponse<AppointmentDto>> updateStatus(@PathVariable UUID id,
            @RequestParam String status) {
        return ResponseEntity.ok(
                ApiResponse.success(AppointmentDto.fromEntity(schedulingService.updateAppointmentStatus(id, status))));
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Check-in lịch hẹn (chuyển vào hàng chờ)")
    public ResponseEntity<ApiResponse<AppointmentDto>> checkIn(
            @PathVariable UUID id,
            @RequestParam UUID queueDefinitionId) {
        return ResponseEntity
                .ok(ApiResponse.success(AppointmentDto.fromEntity(schedulingService.checkIn(id, queueDefinitionId))));
    }

    @GetMapping("/slots")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Danh sách mẫu khung giờ theo tenant")
    public ResponseEntity<ApiResponse<List<SlotTemplateDto>>> getSlotTemplates() {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        var data = schedulingService.getSlotTemplatesByTenant(tenantId).stream()
                .map(s -> new SlotTemplateDto(
                        s.getId(),
                        s.getCode(),
                        s.getStartTime(),
                        s.getDurationMinutes()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
