package vn.clinic.cdm.repository.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.clinic.cdm.entity.patient.MedicationDosageLog;
import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationDosageLogRepository extends JpaRepository<MedicationDosageLog, UUID> {
    List<MedicationDosageLog> findByMedicationReminderId(UUID reminderId);
}

