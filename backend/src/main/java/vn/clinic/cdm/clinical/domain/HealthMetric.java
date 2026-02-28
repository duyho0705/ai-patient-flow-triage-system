package vn.clinic.cdm.clinical.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import vn.clinic.cdm.patient.domain.Patient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Chá»‰ sá»‘ sá»©c khá»e.
 */
@Entity
@Table(name = "health_metric")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthMetric extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "metric_type", nullable = false, length = 50)
    private String metricType;

    @Column(name = "value", nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "image_url", columnDefinition = "text")
    private String imageUrl;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "NORMAL";

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "recorded_at")
    private Instant recordedAt;

    public HealthMetric(UUID id) {
        super(id);
    }
}

