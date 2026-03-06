package vn.clinic.cdm.api.dto.scheduling;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Request đặt lịch tái khám cho bệnh nhân (từ Doctor Portal).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorCreateAppointmentRequest {

    @NotNull(message = "Chi nhánh không được để trống")
    private UUID branchId;

    @NotNull(message = "Bệnh nhân không được để trống")
    private UUID patientId;

    @NotNull(message = "Ngày hẹn không được để trống")
    private LocalDate appointmentDate;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    private LocalTime slotStartTime;

    private LocalTime slotEndTime;

    private String appointmentType;

    private String notes;
}
