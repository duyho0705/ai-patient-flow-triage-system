package vn.clinic.cdm.aiaudit.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseEntity;

import java.time.Instant;
import java.util.UUID;

/**
 * Enterprise Audit Log for all AI interactions.
 * Critical for clinical safety review, legal liability, and model improvement.
 */
@Entity
@Table(name = "ai_audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAuditLog extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "patient_id")
    private UUID patientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "feature_type", nullable = false, length = 32)
    private AiFeatureType featureType; // TRIAGE, CDS, CLINICAL_SUPPORT, CARE_PLAN

    @Column(name = "model_version", length = 64)
    private String modelVersion;

    @Column(name = "input_data", columnDefinition = "text")
    private String inputData;

    @Column(name = "output_data", columnDefinition = "text")
    private String outputData;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "status", length = 32)
    private String status; // SUCCESS, FAILED

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public enum AiFeatureType {
        TRIAGE,
        CDS,
        CLINICAL_SUPPORT,
        CARE_PLAN,
        PRESCRIPTION_VERIFY,
        CHAT,
        OPERATIONAL_INSIGHT,
        ICD10_CODING,
        PHARMACY,
        DIFFERENTIAL_DIAGNOSIS,
        CLINICAL_CHECKLIST
    }
}

