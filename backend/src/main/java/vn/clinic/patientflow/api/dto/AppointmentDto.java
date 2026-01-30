package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {

    private UUID id;
    private UUID tenantId;
    private UUID branchId;
    private UUID patientId;
    private LocalDate appointmentDate;
    private LocalTime slotStartTime;
    private LocalTime slotEndTime;
    private String status;
    private String appointmentType;
    private String notes;
    private UUID createdByUserId;
    private Instant createdAt;
    private Instant updatedAt;

    public static AppointmentDto fromEntity(SchedulingAppointment e) {
        if (e == null) return null;
        return AppointmentDto.builder()
                .id(e.getId())
                .tenantId(e.getTenant() != null ? e.getTenant().getId() : null)
                .branchId(e.getBranch() != null ? e.getBranch().getId() : null)
                .patientId(e.getPatient() != null ? e.getPatient().getId() : null)
                .appointmentDate(e.getAppointmentDate())
                .slotStartTime(e.getSlotStartTime())
                .slotEndTime(e.getSlotEndTime())
                .status(e.getStatus())
                .appointmentType(e.getAppointmentType())
                .notes(e.getNotes())
                .createdByUserId(e.getCreatedByUser() != null ? e.getCreatedByUser().getId() : null)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
