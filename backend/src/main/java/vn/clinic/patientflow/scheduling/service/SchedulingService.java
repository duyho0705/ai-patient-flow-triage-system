package vn.clinic.patientflow.scheduling.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;
import vn.clinic.patientflow.scheduling.domain.SchedulingCalendarDay;
import vn.clinic.patientflow.scheduling.domain.SchedulingSlotTemplate;
import vn.clinic.patientflow.scheduling.repository.SchedulingAppointmentRepository;
import vn.clinic.patientflow.scheduling.repository.SchedulingCalendarDayRepository;
import vn.clinic.patientflow.scheduling.repository.SchedulingSlotTemplateRepository;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.service.TenantService;
import vn.clinic.patientflow.api.dto.SlotAvailabilityDto;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private final SchedulingSlotTemplateRepository slotTemplateRepository;
    private final SchedulingCalendarDayRepository calendarDayRepository;
    private final SchedulingAppointmentRepository appointmentRepository;
    private final TenantService tenantService;
    private final vn.clinic.patientflow.queue.service.QueueService queueService;

    @Transactional(readOnly = true)
    public List<SchedulingSlotTemplate> getSlotTemplatesByTenant(UUID tenantId) {
        return slotTemplateRepository.findByTenantIdAndIsActiveTrueOrderByStartTime(tenantId);
    }

    @Transactional(readOnly = true)
    public Optional<SchedulingCalendarDay> getCalendarDay(UUID branchId, LocalDate date) {
        return calendarDayRepository.findByBranchIdAndDate(branchId, date);
    }

    @Transactional(readOnly = true)
    public SchedulingAppointment getAppointmentById(UUID id) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return appointmentRepository.findById(id)
                .filter(a -> a.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("SchedulingAppointment", id));
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
        Tenant tenant = tenantService.getById(tenantId);
        TenantBranch branch = tenantService.getBranchById(appointment.getBranch().getId());
        if (!branch.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Branch does not belong to current tenant");
        }
        appointment.setTenant(tenant);
        appointment.setBranch(branch);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public SchedulingAppointment updateAppointmentStatus(UUID id, String status) {
        SchedulingAppointment existing = getAppointmentById(id);
        existing.setStatus(status);
        return appointmentRepository.save(existing);
    }

    @Transactional
    public SchedulingAppointment checkIn(UUID id, UUID queueDefinitionId) {
        SchedulingAppointment existing = getAppointmentById(id);
        if ("CHECKED_IN".equals(existing.getStatus())) {
            throw new IllegalStateException("Appointment is already checked in");
        }

        existing.setStatus("CHECKED_IN");
        SchedulingAppointment saved = appointmentRepository.save(existing);

        // Add to queue
        queueService.createEntry(
                queueDefinitionId,
                saved.getPatient().getId(),
                (UUID) null,
                saved.getId(),
                (UUID) null, // medicalServiceId
                (String) null, // notes
                0 // position
        );

        return saved;
    }

    @Transactional(readOnly = true)
    public List<SchedulingAppointment> getAppointmentsByPatient(UUID patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<SchedulingAppointment> getUpcomingAppointmentsByPatient(UUID patientId) {
        return appointmentRepository
                .findByPatientIdAndStatusInAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAsc(
                        patientId, List.of("SCHEDULED", "CONFIRMED"), LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<SlotAvailabilityDto> getAvailableSlots(UUID branchId, LocalDate date) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        List<SchedulingSlotTemplate> templates = getSlotTemplatesByTenant(tenantId);

        List<SchedulingAppointment> existing = appointmentRepository.findByTenantIdAndBranchIdAndAppointmentDate(
                tenantId, branchId, date, org.springframework.data.domain.Pageable.unpaged()).getContent();

        return templates.stream().map(t -> {
            boolean isTaken = existing.stream().anyMatch(a -> !"CANCELLED".equals(a.getStatus())
                    && a.getSlotStartTime().equals(t.getStartTime()));
            return SlotAvailabilityDto.builder()
                    .startTime(t.getStartTime())
                    .endTime(t.getStartTime().plusMinutes(t.getDurationMinutes()))
                    .available(!isTaken)
                    .build();
        }).collect(Collectors.toList());
    }
}
