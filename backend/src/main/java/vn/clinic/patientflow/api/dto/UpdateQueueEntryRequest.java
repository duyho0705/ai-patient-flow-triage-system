package vn.clinic.patientflow.api.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateQueueEntryRequest {

    @Size(max = 32)
    private String status;

    private Instant calledAt;

    private Instant completedAt;

    private Integer position;
}
