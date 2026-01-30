package vn.clinic.patientflow.triage.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "triage_complaint")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TriageComplaint extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triage_session_id", nullable = false)
    private TriageSession triageSession;

    @Column(name = "complaint_type", length = 64)
    private String complaintType;

    @Column(name = "complaint_text", nullable = false, length = 500)
    private String complaintText;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public TriageComplaint(UUID id) {
        super(id);
    }
}
