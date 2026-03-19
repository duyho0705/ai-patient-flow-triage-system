package vn.clinic.cdm.service.scheduling.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.clinic.cdm.dto.scheduling.SlotAvailabilityDto;
import vn.clinic.cdm.exception.ApiException;
import vn.clinic.cdm.exception.ErrorCode;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.entity.scheduling.SchedulingAppointment;
import vn.clinic.cdm.entity.scheduling.SchedulingCalendarDay;
import vn.clinic.cdm.entity.scheduling.SchedulingSlotTemplate;
import vn.clinic.cdm.repository.scheduling.SchedulingAppointmentRepository;
import vn.clinic.cdm.repository.scheduling.SchedulingCalendarDayRepository;
import vn.clinic.cdm.repository.scheduling.SchedulingSlotTemplateRepository;
import vn.clinic.cdm.common.constant.ManagementConstants;
import vn.clinic.cdm.entity.tenant.Tenant;
import vn.clinic.cdm.entity.tenant.TenantBranch;
import vn.clinic.cdm.service.tenant.TenantService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchedulingServiceImpl implements vn.clinic.cdm.service.scheduling.SchedulingService {

    private final SchedulingSlotTemplateRepository slotTemplateRepository;
    private final SchedulingCalendarDayRepository calendarDayRepository;
    private final SchedulingAppointmentRepository appointmentRepository;
    private final TenantService tenantService;

    @Transactional(readOnly = true)
    public List<SchedulingSlotTemplate> getSlotTemplatesByTenant(UUID tenantId) {
        log.debug("Fetching slot templates for tenant: {}", tenantId);
        return slotTemplateRepository.findByTenantIdAndIsActiveTrueOrderByStartTime(tenantId);
    }

    @Transactional(readOnly = true)
    public Optional<SchedulingCalendarDay> getCalendarDay(UUID branchId, LocalDate date) {
        log.debug("Fetching calendar day for branch: {} on date: {}", branchId, date);
        return calendarDayRepository.findByBranchIdAndDate(branchId, date);
    }

    @Transactional(readOnly = true)
    public SchedulingAppointment getAppointmentById(UUID id) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return appointmentRepository.findById(id)
                .filter(a -> a.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> {
                    log.warn("Appointment not found or tenant mismatch: id={}, tenant={}", id, tenantId);
                    return new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, 
                        "Không tìm thấy lịch hẹn hoặc bạn không có quyền truy cập");
                });
    }

    @Transactional(readOnly = true)
    public Page<SchedulingAppointment> getAppointmentsByBranchAndDate(UUID branchId, LocalDate date,
            Pageable pageable) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return appointmentRepository.findByTenantIdAndBranchIdAndAppointmentDate(tenantId, branchId, date, pageable);
    }

    @Transactional
    public SchedulingAppointment createAppointment(SchedulingAppointment appointment) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        log.info("Creating new appointment for tenant: {}, patient: {}", tenantId, appointment.getPatient().getId());
        
        Tenant tenant = tenantService.getById(tenantId);
        TenantBranch branch = tenantService.getBranchById(appointment.getBranch().getId());
        
        if (!branch.getTenant().getId().equals(tenantId)) {
            log.error("Branch/Tenant mismatch: branchId={}, tenantId={}", branch.getId(), tenantId);
            throw new ApiException(ErrorCode.VALIDATION_FAILED, HttpStatus.BAD_REQUEST, 
                "Chi nhánh không thuộc phòng khám hiện tại");
        }
        
        appointment.setTenant(tenant);
        appointment.setBranch(branch);
        SchedulingAppointment saved = appointmentRepository.save(appointment);
        log.info("Appointment created successfully with ID: {}", saved.getId());
        return saved;
    }

    @Transactional
    public SchedulingAppointment updateAppointmentStatus(UUID id, String status) {
        SchedulingAppointment existing = getAppointmentById(id);
        existing.setStatus(status);
        return appointmentRepository.save(existing);
    }

    @Transactional
    public SchedulingAppointment checkIn(UUID id) {
        SchedulingAppointment existing = getAppointmentById(id);
        if (ManagementConstants.AppointmentStatus.ARRIVED.equals(existing.getStatus())) {
            log.warn("Appointment {} already checked in", id);
            throw new ApiException(ErrorCode.INVALID_OPERATION, HttpStatus.BAD_REQUEST, 
                "Bệnh nhân đã được check-in trước đó");
        }

        log.info("Checking in appointment: {}", id);
        existing.setStatus(ManagementConstants.AppointmentStatus.ARRIVED);
        return appointmentRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public List<SchedulingAppointment> getAppointmentsByPatient(UUID patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<SchedulingAppointment> getUpcomingAppointmentsByPatient(UUID patientId) {
        return appointmentRepository
                .findByPatientIdAndStatusInAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAsc(
                        patientId, List.of(
                            ManagementConstants.AppointmentStatus.SCHEDULED,
                            ManagementConstants.AppointmentStatus.CONFIRMED,
                            ManagementConstants.AppointmentStatus.ARRIVED
                        ), LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<SlotAvailabilityDto> getAvailableSlots(UUID branchId, LocalDate date) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        List<SchedulingSlotTemplate> templates = getSlotTemplatesByTenant(tenantId);

        List<SchedulingAppointment> existing = appointmentRepository.findByTenantIdAndBranchIdAndAppointmentDate(
                tenantId, branchId, date, org.springframework.data.domain.Pageable.unpaged()).getContent();

        return templates.stream().map(t -> {
            boolean isTaken = existing.stream().anyMatch(a -> !ManagementConstants.AppointmentStatus.CANCELLED.equals(a.getStatus())
                    && a.getSlotStartTime().equals(t.getStartTime()));
            return SlotAvailabilityDto.builder()
                    .startTime(t.getStartTime())
                    .endTime(t.getStartTime().plusMinutes(t.getDurationMinutes()))
                    .available(!isTaken)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public SchedulingAppointment saveAppointment(SchedulingAppointment appointment) {
        return appointmentRepository.save(appointment);
    }

    @Transactional(readOnly = true)
    public List<SchedulingAppointment> getDoctorTodayAppointments(UUID doctorUserId) {
        return appointmentRepository.findByDoctorUserIdAndAppointmentDate(doctorUserId, LocalDate.now());
    }

    // ═══════════════════════════════════════════════
    // Doctor Portal — Appointment Management
    // ═══════════════════════════════════════════════

    /**
     * Lấy lịch hẹn của bác sĩ trong khoảng ngày (phân trang).
     */
    @Transactional(readOnly = true)
    public Page<SchedulingAppointment> getDoctorAppointments(UUID doctorUserId,
            LocalDate from, LocalDate to,
            Pageable pageable) {
        return appointmentRepository
                .findByDoctorUserIdAndAppointmentDateBetweenOrderByAppointmentDateAscSlotStartTimeAsc(
                        doctorUserId, from, to, pageable);
    }

    /**
     * Lấy tất cả lịch hẹn của bác sĩ trong khoảng ngày (không phân trang).
     */
    @Transactional(readOnly = true)
    public List<SchedulingAppointment> getDoctorAppointmentsList(UUID doctorUserId,
            LocalDate from, LocalDate to) {
        return appointmentRepository
                .findByDoctorUserIdAndAppointmentDateBetweenOrderByAppointmentDateAscSlotStartTimeAsc(
                        doctorUserId, from, to);
    }

    /**
     * Bác sĩ tạo lịch tái khám cho bệnh nhân.
     */
    @Transactional
    public SchedulingAppointment doctorCreateAppointment(SchedulingAppointment appointment,
            UUID doctorUserId) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        Tenant tenant = tenantService.getById(tenantId);
        TenantBranch branch = tenantService.getBranchById(appointment.getBranch().getId());

        if (!branch.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Chi nhánh không thuộc tenant hiện tại");
        }

        appointment.setTenant(tenant);
        appointment.setBranch(branch);
        appointment.setStatus(ManagementConstants.AppointmentStatus.SCHEDULED);
        // doctorUser is set by controller

        return appointmentRepository.save(appointment);
    }

    /**
     * Bác sĩ cập nhật trạng thái lịch hẹn (COMPLETED, CANCELLED, NO_SHOW).
     */
    @Transactional
    public SchedulingAppointment doctorUpdateAppointmentStatus(UUID appointmentId,
            UUID doctorUserId,
            String newStatus) {
        SchedulingAppointment existing = getAppointmentById(appointmentId);

        // Kiểm tra quyền: chỉ cập nhật được lịch hẹn do mình quản lý
        if (existing.getDoctorUser() != null
                && !existing.getDoctorUser().getId().equals(doctorUserId)) {
            throw new IllegalStateException("Bạn không có quyền cập nhật lịch hẹn này");
        }

        existing.setStatus(newStatus);
        return appointmentRepository.save(existing);
    }
}
