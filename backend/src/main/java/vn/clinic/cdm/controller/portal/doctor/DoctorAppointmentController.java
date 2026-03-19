package vn.clinic.cdm.controller.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.dto.common.PagedResponse;
import vn.clinic.cdm.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.dto.scheduling.DoctorCreateAppointmentRequest;
import vn.clinic.cdm.dto.scheduling.SlotAvailabilityDto;
import vn.clinic.cdm.security.AuthPrincipal;
import vn.clinic.cdm.entity.identity.IdentityUser;
import vn.clinic.cdm.service.identity.IdentityService;
import vn.clinic.cdm.entity.patient.Patient;
import vn.clinic.cdm.service.patient.PatientService;
import vn.clinic.cdm.entity.scheduling.SchedulingAppointment;
import vn.clinic.cdm.service.scheduling.SchedulingService;
import vn.clinic.cdm.entity.tenant.TenantBranch;
import vn.clinic.cdm.service.tenant.TenantService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Quản lý Lịch hẹn — Doctor Portal.
 * <p>
 * Bác sĩ có thể:
 * - Xem lịch hẹn của mình (lọc theo ngày/khoảng ngày, phân trang)
 * - Đặt lịch tái khám cho bệnh nhân
 * - Cập nhật trạng thái lịch hẹn (COMPLETED, CANCELLED, NO_SHOW)
 * - Xem slot trống
 */
@RestController
@RequestMapping("/api/doctor-portal/appointments")
@RequiredArgsConstructor
@Tag(name = "Doctor Appointments", description = "Quản lý lịch hẹn dành cho bác sĩ")
@Slf4j
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorAppointmentController {

    private final SchedulingService schedulingService;
    private final PatientService patientService;
    private final IdentityService identityService;
    private final TenantService tenantService;

    @GetMapping
    @Operation(summary = "Danh sách lịch hẹn của bác sĩ (lọc theo khoảng ngày)")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentDto>>> getMyAppointments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20) Pageable pageable) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        Page<SchedulingAppointment> page = schedulingService
                .getDoctorAppointments(doctorUserId, from, to, pageable);

        var data = PagedResponse.of(page,
                page.getContent().stream()
                        .map(AppointmentDto::fromEntity)
                        .collect(Collectors.toList()));

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/today")
    @Operation(summary = "Lịch hẹn hôm nay của bác sĩ")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getTodayAppointments() {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        var appointments = schedulingService.getDoctorTodayAppointments(doctorUserId);

        var data = appointments.stream()
                .map(AppointmentDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Đặt lịch tái khám cho bệnh nhân")
    public ResponseEntity<ApiResponse<AppointmentDto>> createFollowUpAppointment(
            @Valid @RequestBody DoctorCreateAppointmentRequest request) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        IdentityUser doctorUser = identityService.getUserById(doctorUserId);
        Patient patient = patientService.getById(request.getPatientId());
        TenantBranch branch = tenantService.getBranchById(request.getBranchId());

        SchedulingAppointment appointment = SchedulingAppointment.builder()
                .branch(branch)
                .patient(patient)
                .appointmentDate(request.getAppointmentDate())
                .slotStartTime(request.getSlotStartTime())
                .slotEndTime(request.getSlotEndTime())
                .appointmentType(request.getAppointmentType() != null
                        ? request.getAppointmentType()
                        : "FOLLOW_UP")
                .notes(request.getNotes())
                .doctorUser(doctorUser)
                .build();

        SchedulingAppointment saved = schedulingService.doctorCreateAppointment(appointment, doctorUserId);
        log.info("Doctor {} created follow-up appointment {} for patient {}",
                doctorUserId, saved.getId(), request.getPatientId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppointmentDto.fromEntity(saved)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái lịch hẹn (COMPLETED, CANCELLED, NO_SHOW)")
    public ResponseEntity<ApiResponse<AppointmentDto>> updateAppointmentStatus(
            @PathVariable UUID id,
            @RequestParam String status) {

        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        SchedulingAppointment updated = schedulingService
                .doctorUpdateAppointmentStatus(id, doctorUserId, status.toUpperCase());

        return ResponseEntity.ok(ApiResponse.success(AppointmentDto.fromEntity(updated)));
    }

    @GetMapping("/slots")
    @Operation(summary = "Xem slot trống theo chi nhánh và ngày")
    public ResponseEntity<ApiResponse<List<SlotAvailabilityDto>>> getAvailableSlots(
            @RequestParam UUID branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(ApiResponse.success(
                schedulingService.getAvailableSlots(branchId, date)));
    }
}
