package vn.clinic.patientflow.queue.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseAuditableEntity;
import vn.clinic.patientflow.tenant.domain.TenantBranch;

import java.util.UUID;

@Entity
@Table(name = "queue_definition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueDefinition extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private TenantBranch branch;

    @Column(name = "code", nullable = false, length = 64)
    private String code;

    @Column(name = "name_vi", nullable = false, length = 255)
    private String nameVi;

    @Column(name = "acuity_filter", length = 255)
    private String acuityFilter;

    @Column(name = "room_or_station", length = 64)
    private String roomOrStation;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "average_consultation_minutes")
    @Builder.Default
    private Integer averageConsultationMinutes = 15;

    public QueueDefinition(UUID id) {
        super(id);
    }
}
