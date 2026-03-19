package vn.clinic.cdm.dto.patient;

import vn.clinic.cdm.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.dto.clinical.ConsultationDto;
import vn.clinic.cdm.dto.clinical.TriageVitalDto;
import vn.clinic.cdm.dto.clinical.VitalTrendDto;

import vn.clinic.cdm.dto.medication.MedicationReminderDto;
import vn.clinic.cdm.dto.medication.PrescriptionDto;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PatientDashboardDto {
    private UUID patientId;
    private UUID branchId;
    private String patientName;
    private String patientAvatar;
    private int activeQueues;
    private AppointmentDto nextAppointment;
    private List<ConsultationDto> recentVisits;
    private List<TriageVitalDto> lastVitals;
    private List<TriageVitalDto> vitalHistory;
    private PrescriptionDto latestPrescription;

    private List<MedicationReminderDto> medicationReminders;
    private List<String> healthAlerts;
    private List<VitalTrendDto> vitalTrends;
    private String bloodType;
    private String chronicConditions;
    private String assignedDoctorName;
}
