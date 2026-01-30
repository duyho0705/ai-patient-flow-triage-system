package vn.clinic.patientflow.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAppointmentRequest {

    @NotNull
    private UUID branchId;

    @NotNull
    private UUID patientId;

    @NotNull
    private LocalDate appointmentDate;

    @NotNull
    private LocalTime slotStartTime;

    private LocalTime slotEndTime;

    @NotNull
    @Size(max = 32)
    private String status;

    @Size(max = 32)
    private String appointmentType;

    private String notes;

    private UUID createdByUserId;
}
