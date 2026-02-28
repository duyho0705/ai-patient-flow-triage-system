package vn.clinic.cdm.api.staff;

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
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.common.PagedResponse;
import vn.clinic.cdm.api.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.api.dto.scheduling.CreateAppointmentRequest;
import vn.clinic.cdm.api.dto.scheduling.SlotTemplateDto;

import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.identity.service.IdentityService;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientService;
import vn.clinic.cdm.scheduling.domain.SchedulingAppointment;
import vn.clinic.cdm.scheduling.service.SchedulingService;
import vn.clinic.cdm.tenant.domain.TenantBranch;
import vn.clinic.cdm.tenant.service.TenantService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Lá»‹ch háº¹n â€“ tenant-scoped (X-Tenant-Id báº¯t buá»™c).
 */
@RestController
@RequestMapping(value = "/api/appointments", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Scheduling", description = "Lá»‹ch háº¹n")
public class SchedulingController {

        private final SchedulingService schedulingService;
        private final TenantService tenantService;
        private final PatientService patientService;
        private final IdentityService identityService;

        @GetMapping
        @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TRIAGE_NURSE', 'ADMIN', 'CLINIC_MANAGER')")
        @Operation(summary = "Danh sÃ¡ch lá»‹ch háº¹n theo chi nhÃ¡nh vÃ  ngÃ y")
        public ResponseEntity<ApiResponse<PagedResponse<AppointmentDto>>> list(
                        @RequestParam UUID branchId,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                        @PageableDefault(size = 20) Pageable pageable) {
                Page<SchedulingAppointment> page = schedulingService.getAppointmentsByBranchAndDate(branchId, date,
                                pageable);
                var data = PagedResponse.of(page,
                                page.getContent().stream().map(AppointmentDto::fromEntity)
                                                .collect(Collectors.toList()));
                return ResponseEntity.ok(ApiResponse.success(data));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Láº¥y lá»‹ch háº¹n theo ID")
        public ResponseEntity<ApiResponse<AppointmentDto>> getById(@PathVariable UUID id) {
                return ResponseEntity
                                .ok(ApiResponse.success(
                                                AppointmentDto.fromEntity(schedulingService.getAppointmentById(id))));
        }

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
        @Operation(summary = "Táº¡o lá»‹ch háº¹n")
        public ResponseEntity<ApiResponse<AppointmentDto>> create(
                        @Valid @RequestBody CreateAppointmentRequest request) {
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
                                .body(ApiResponse.success(AppointmentDto
                                                .fromEntity(schedulingService.createAppointment(appointment))));
        }

        @PatchMapping("/{id}/status")
        @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
        @Operation(summary = "Cáº­p nháº­t tráº¡ng thÃ¡i lá»‹ch háº¹n")
        public ResponseEntity<ApiResponse<AppointmentDto>> updateStatus(@PathVariable UUID id,
                        @RequestParam String status) {
                return ResponseEntity.ok(
                                ApiResponse.success(AppointmentDto
                                                .fromEntity(schedulingService.updateAppointmentStatus(id, status))));
        }

        @PostMapping("/{id}/check-in")
        @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
        @Operation(summary = "Tiáº¿p Ä‘Ã³n bá»‡nh nhÃ¢n (Check-in)")
        public ResponseEntity<ApiResponse<AppointmentDto>> checkIn(
                        @PathVariable UUID id) {
                return ResponseEntity
                                .ok(ApiResponse.success(AppointmentDto.fromEntity(schedulingService.checkIn(id))));
        }

        @GetMapping("/slots")
        @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
        @Operation(summary = "Danh sÃ¡ch máº«u khung giá» theo tenant")
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

