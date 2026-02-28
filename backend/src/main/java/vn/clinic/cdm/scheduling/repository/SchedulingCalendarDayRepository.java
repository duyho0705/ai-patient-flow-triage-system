package vn.clinic.cdm.scheduling.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.scheduling.domain.SchedulingCalendarDay;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface SchedulingCalendarDayRepository extends JpaRepository<SchedulingCalendarDay, UUID> {

    Optional<SchedulingCalendarDay> findByBranchIdAndDate(UUID branchId, LocalDate date);
}

