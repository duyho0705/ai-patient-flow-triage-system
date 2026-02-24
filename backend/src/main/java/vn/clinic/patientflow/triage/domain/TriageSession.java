package vn.clinic.patientflow.triage.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseAuditableEntity;
import vn.clinic.patientflow.identity.domain.IdentityUser;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.scheduling.domain.SchedulingAppointment;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.domain.TenantBranch;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Phiên phân loại ưu tiên. acuity_source: HUMAN | AI | HYBRID.
 */
@Entity(name = "TriageSession")
@Table(name = "triage_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TriageSession extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private TenantBranch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private SchedulingAppointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triaged_by_user_id")
    private IdentityUser triagedByUser;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "acuity_level", nullable = false, length = 32)
    private String acuityLevel;

    @Column(name = "acuity_source", length = 32)
    private String acuitySource;

    @Column(name = "ai_suggested_acuity", length = 32)
    private String aiSuggestedAcuity;

    @Column(name = "ai_confidence_score", precision = 5, scale = 4)
    private BigDecimal aiConfidenceScore;

    @Column(name = "ai_explanation", columnDefinition = "text")
    private String aiExplanation;

    @Column(name = "chief_complaint_text", columnDefinition = "text")
    private String chiefComplaintText;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    /** Lý do override khi không chấp nhận gợi ý AI (Explainability). */
    @Column(name = "override_reason", columnDefinition = "text")
    private String overrideReason;

    public TriageSession(UUID id) {
        super(id);
    }
}
