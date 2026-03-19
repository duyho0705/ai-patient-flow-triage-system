package vn.clinic.cdm.repository.scheduling;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.scheduling.SchedulingAppointment;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SchedulingAppointmentRepository extends JpaRepository<SchedulingAppointment, UUID> {

        Page<SchedulingAppointment> findByTenantIdAndBranchIdAndAppointmentDate(
                        UUID tenantId, UUID branchId, LocalDate date, Pageable pageable);

        List<SchedulingAppointment> findByBranchIdAndAppointmentDateAndStatus(
                        UUID branchId, LocalDate date, String status);

        List<SchedulingAppointment> findByPatientIdOrderByAppointmentDateDesc(UUID patientId);

        List<SchedulingAppointment> findByPatientIdAndStatusInAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAsc(
                        UUID patientId, List<String> statuses, LocalDate date);

        List<SchedulingAppointment> findByBranchIdAndAppointmentDate(UUID branchId, LocalDate date);

        List<SchedulingAppointment> findByDoctorUserIdAndAppointmentDate(UUID doctorUserId, LocalDate date);

        long countByTenantIdAndAppointmentDate(UUID tenantId, LocalDate date);

        /** Lịch hẹn của bác sĩ trong khoảng ngày (phân trang) */
        Page<SchedulingAppointment> findByDoctorUserIdAndAppointmentDateBetweenOrderByAppointmentDateAscSlotStartTimeAsc(
                        UUID doctorUserId, LocalDate from, LocalDate to, Pageable pageable);

        /** Tất cả lịch hẹn của bác sĩ trong khoảng ngày */
        List<SchedulingAppointment> findByDoctorUserIdAndAppointmentDateBetweenOrderByAppointmentDateAscSlotStartTimeAsc(
                        UUID doctorUserId, LocalDate from, LocalDate to);
}
