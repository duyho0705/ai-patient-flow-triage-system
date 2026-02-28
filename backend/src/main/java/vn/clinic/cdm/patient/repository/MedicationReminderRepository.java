package vn.clinic.cdm.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.patient.domain.MedicationReminder;
import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationReminderRepository extends JpaRepository<MedicationReminder, UUID> {
    List<MedicationReminder> findByPatientId(UUID patientId);
}

