package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.entity.clinical.Medication;
import vn.clinic.cdm.entity.clinical.MedicationSchedule;

import java.util.List;
import java.util.UUID;

public interface MedicationService {
    void generateSchedules(Medication medication);
    MedicationSchedule markAsTaken(UUID scheduleId);
    List<MedicationSchedule> getPatientSchedules(UUID patientId);
    List<MedicationSchedule> getDailySchedules(UUID patientId);
    MedicationSchedule recordDose(UUID scheduleId, String status, String notes);
}
