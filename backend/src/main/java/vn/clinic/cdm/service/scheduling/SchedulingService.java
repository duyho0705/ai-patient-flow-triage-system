package vn.clinic.cdm.service.scheduling;

import vn.clinic.cdm.dto.scheduling.SlotAvailabilityDto;
import vn.clinic.cdm.entity.scheduling.SchedulingAppointment;
import vn.clinic.cdm.entity.scheduling.SchedulingCalendarDay;
import vn.clinic.cdm.entity.scheduling.SchedulingSlotTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SchedulingService {
    List<SchedulingSlotTemplate> getSlotTemplatesByTenant(UUID tenantId);
    Optional<SchedulingCalendarDay> getCalendarDay(UUID branchId, LocalDate date);
    SchedulingAppointment getAppointmentById(UUID id);
    Page<SchedulingAppointment> getAppointmentsByBranchAndDate(UUID branchId, LocalDate date, Pageable pageable);
    SchedulingAppointment createAppointment(SchedulingAppointment appointment);
    SchedulingAppointment updateAppointmentStatus(UUID id, String status);
    SchedulingAppointment checkIn(UUID id);
    List<SchedulingAppointment> getAppointmentsByPatient(UUID patientId);
    List<SchedulingAppointment> getUpcomingAppointmentsByPatient(UUID patientId);
    List<SlotAvailabilityDto> getAvailableSlots(UUID branchId, LocalDate date);
    SchedulingAppointment saveAppointment(SchedulingAppointment appointment);
    List<SchedulingAppointment> getDoctorTodayAppointments(UUID doctorUserId);
    
    // Doctor Portal
    Page<SchedulingAppointment> getDoctorAppointments(UUID doctorUserId, LocalDate from, LocalDate to, Pageable pageable);
    List<SchedulingAppointment> getDoctorAppointmentsList(UUID doctorUserId, LocalDate from, LocalDate to);
    SchedulingAppointment doctorCreateAppointment(SchedulingAppointment appointment, UUID doctorUserId);
    SchedulingAppointment doctorUpdateAppointmentStatus(UUID appointmentId, UUID doctorUserId, String newStatus);
}
