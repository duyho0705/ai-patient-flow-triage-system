package vn.clinic.patientflow.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.patientflow.patient.domain.MedicationDosageLog;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationDosageLogRepository extends JpaRepository<MedicationDosageLog, UUID> {
    List<MedicationDosageLog> findByPatientIdOrderByTakenAtDesc(UUID patientId);
}
