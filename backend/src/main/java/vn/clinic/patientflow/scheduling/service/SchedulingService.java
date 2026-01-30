package vn.clinic.patientflow.scheduling.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;
import vn.clinic.patientflow.scheduling.domain.SchedulingCalendarDay;
import vn.clinic.patientflow.scheduling.domain.SchedulingSlotTemplate;
import vn.clinic.patientflow.scheduling.repository.SchedulingAppointmentRepository;
import vn.clinic.patientflow.scheduling.repository.SchedulingCalendarDayRepository;
import vn.clinic.patientflow.scheduling.repository.SchedulingSlotTemplateRepository;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.service.TenantService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private final SchedulingSlotTemplateRepository slotTemplateRepository;
    private final SchedulingCalendarDayRepository calendarDayRepository;
    private final SchedulingAppointmentRepository appointmentRepository;
    private final TenantService tenantService;

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
    public Page<SchedulingAppointment> getAppointmentsByBranchAndDate(UUID branchId, LocalDate date, Pageable pageable) {
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
}
