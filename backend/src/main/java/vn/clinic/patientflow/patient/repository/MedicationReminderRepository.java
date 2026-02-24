package vn.clinic.patientflow.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.patientflow.patient.domain.MedicationReminder;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationReminderRepository extends JpaRepository<MedicationReminder, UUID> {
    List<MedicationReminder> findByPatientId(UUID patientId);

    List<MedicationReminder> findByPatientIdAndIsActiveTrue(UUID patientId);

    List<MedicationReminder> findByIsActiveTrueAndReminderTimeBetween(java.time.LocalTime start,
            java.time.LocalTime end);
}
