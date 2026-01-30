package vn.clinic.patientflow.aiaudit.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseEntity;
import vn.clinic.patientflow.triage.domain.TriageSession;

import java.time.Instant;
import java.util.UUID;

/**
 * Kiểm toán mỗi lần gọi AI phân loại. Truy vết cho tuân thủ và an toàn.
 */
@Entity
@Table(name = "ai_triage_audit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiTriageAudit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triage_session_id", nullable = false)
    private TriageSession triageSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_version_id", nullable = false)
    private AiModelVersion modelVersion;

    @Column(name = "input_json", columnDefinition = "jsonb")
    private String inputJson;

    @Column(name = "output_json", columnDefinition = "jsonb")
    private String outputJson;

    @Column(name = "latency_ms")
    private Integer latencyMs;

    @Column(name = "called_at", nullable = false)
    private Instant calledAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public AiTriageAudit(UUID id) {
        super(id);
    }
}
