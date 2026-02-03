package vn.clinic.patientflow.scheduling.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;

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
}
