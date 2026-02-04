package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PatientDashboardDto {
    private java.util.UUID patientId;
    private java.util.UUID branchId;
    private String patientName;
    private Long activeQueues;
    private AppointmentDto nextAppointment;
    private List<ConsultationDto> recentVisits;
}
