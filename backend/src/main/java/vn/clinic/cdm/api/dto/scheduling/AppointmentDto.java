package vn.clinic.cdm.api.dto.scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.scheduling.domain.SchedulingAppointment;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private LocalDate date;
    private String startTime;
    private String status;
    private String type;

    public static AppointmentDto fromEntity(SchedulingAppointment a) {
        if (a == null)
            return null;
        return AppointmentDto.builder()
                .id(a.getId())
                .patientId(a.getPatient() != null ? a.getPatient().getId() : null)
                .patientName(a.getPatient() != null ? a.getPatient().getFullNameVi() : null)
                .date(a.getAppointmentDate())
                .startTime(a.getSlotStartTime() != null ? a.getSlotStartTime().toString() : "")
                .status(a.getStatus())
                .type(a.getAppointmentType())
                .build();
    }
}

