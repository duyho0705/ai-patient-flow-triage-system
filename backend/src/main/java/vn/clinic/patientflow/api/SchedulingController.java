package vn.clinic.patientflow.api;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.api.dto.AppointmentDto;
import vn.clinic.patientflow.api.dto.CreateAppointmentRequest;
import vn.clinic.patientflow.api.dto.PagedResponse;
import vn.clinic.patientflow.api.dto.SlotTemplateDto;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.identity.service.IdentityService;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientService;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;
import vn.clinic.patientflow.scheduling.service.SchedulingService;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.service.TenantService;

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
    @Operation(summary = "Danh sách lịch hẹn theo chi nhánh và ngày")
    public PagedResponse<AppointmentDto> list(
            @RequestParam UUID branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<SchedulingAppointment> page = schedulingService.getAppointmentsByBranchAndDate(branchId, date, pageable);
        return PagedResponse.of(page,
                page.getContent().stream().map(AppointmentDto::fromEntity).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy lịch hẹn theo ID")
    public AppointmentDto getById(@PathVariable UUID id) {
        return AppointmentDto.fromEntity(schedulingService.getAppointmentById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo lịch hẹn")
    public AppointmentDto create(@Valid @RequestBody CreateAppointmentRequest request) {
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
        return AppointmentDto.fromEntity(schedulingService.createAppointment(appointment));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái lịch hẹn")
    public AppointmentDto updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return AppointmentDto.fromEntity(schedulingService.updateAppointmentStatus(id, status));
    }

    @GetMapping("/slots")
    @Operation(summary = "Danh sách mẫu khung giờ theo tenant")
    public List<SlotTemplateDto> getSlotTemplates() {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return schedulingService.getSlotTemplatesByTenant(tenantId).stream()
                .map(s -> new SlotTemplateDto(
                        s.getId(),
                        s.getCode(),
                        s.getStartTime(),
                        s.getDurationMinutes()))
                .collect(Collectors.toList());
    }
}
