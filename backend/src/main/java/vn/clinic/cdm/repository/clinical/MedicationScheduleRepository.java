package vn.clinic.cdm.repository.clinical;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.clinical.MedicationSchedule;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule, UUID> {
    List<MedicationSchedule> findByMedicationPrescriptionPatientId(UUID patientId);

    List<MedicationSchedule> findByMedicationPrescriptionPatientIdAndScheduledTimeBetween(UUID patientId, Instant start,
            Instant end);

    List<MedicationSchedule> findByStatusAndScheduledTimeBefore(String status, Instant threshold);

    List<MedicationSchedule> findByStatusAndScheduledTimeBetween(String status, Instant start, Instant end);
}

