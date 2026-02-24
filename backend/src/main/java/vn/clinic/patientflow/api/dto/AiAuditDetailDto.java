package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAuditDetailDto {
    private UUID sessionId;
    private String patientName;
    private String symptoms;
    private String aiSuggestedAcuity;
    private String humanAcuity;
    private String overrideReason;
    private Instant timestamp;
}
