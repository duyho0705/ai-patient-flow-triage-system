package vn.clinic.cdm.clinical.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import vn.clinic.cdm.patient.domain.Patient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * NgÆ°á»¡ng chá»‰ sá»‘ cÃ¡ nhÃ¢n hÃ³a cho tá»«ng bá»‡nh nhÃ¢n.
 */
@Entity
@Table(name = "health_threshold", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "patient_id", "metric_type" }) })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthThreshold extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "metric_type", nullable = false, length = 50)
    private String metricType;

    @Column(name = "min_value", precision = 10, scale = 2)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 10, scale = 2)
    private BigDecimal maxValue;

    public HealthThreshold(UUID id) {
        super(id);
    }
}

