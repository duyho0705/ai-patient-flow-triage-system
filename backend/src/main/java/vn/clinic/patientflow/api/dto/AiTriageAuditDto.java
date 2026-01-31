package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO cho AI Audit – so sánh đề xuất AI vs quyết định thực tế (Explainability).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTriageAuditDto {

    private UUID id;
    private UUID triageSessionId;
    /** Mức ưu tiên AI đề xuất (từ output_json). */
    private String suggestedAcuity;
    /** Mức ưu tiên thực tế (triage_session.acuity_level). */
    private String actualAcuity;
    /** true nếu suggestedAcuity equals actualAcuity. */
    private Boolean matched;
    private Instant calledAt;
    private Integer latencyMs;
    private UUID patientId;
    private UUID branchId;
}
