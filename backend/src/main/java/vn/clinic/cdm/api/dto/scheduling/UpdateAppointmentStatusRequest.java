package vn.clinic.cdm.api.dto.scheduling;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAppointmentStatusRequest {

    @NotBlank
    @Pattern(regexp = "SCHEDULED|CHECKED_IN|CANCELLED|NO_SHOW|COMPLETED")
    private String status;
}

