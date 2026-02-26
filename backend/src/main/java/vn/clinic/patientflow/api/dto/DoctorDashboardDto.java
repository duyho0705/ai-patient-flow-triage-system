package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DoctorDashboardDto {
    private long totalPatientsToday;
    private long pendingConsultations;
    private long completedConsultationsToday;
    private List<AppointmentDto> upcomingAppointments;
    private List<PatientChatMessageDto> unreadMessages;
}
