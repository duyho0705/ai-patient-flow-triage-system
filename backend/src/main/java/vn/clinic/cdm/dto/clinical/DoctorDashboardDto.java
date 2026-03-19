package vn.clinic.cdm.dto.clinical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.dto.scheduling.AppointmentDto;
import vn.clinic.cdm.dto.messaging.PatientChatMessageDto;
import vn.clinic.cdm.dto.ai.RiskPatientDto;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDashboardDto {
    private long totalPatientsToday;
    private long pendingConsultations;
    private long completedConsultationsToday;
    private List<AppointmentDto> upcomingAppointments;
    private List<PatientChatMessageDto> unreadMessages;
    private List<RiskPatientDto> riskPatients;
    private List<String> criticalVitalsAlerts;
}

