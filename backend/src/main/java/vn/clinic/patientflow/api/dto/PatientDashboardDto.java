package vn.clinic.patientflow.api.dto;

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
    private InvoiceDto pendingInvoice;
    private List<MedicationReminderDto> medicationReminders;
    private List<String> healthAlerts;
    private List<VitalTrendDto> vitalTrends;
}
