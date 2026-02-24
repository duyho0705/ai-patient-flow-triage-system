package vn.clinic.patientflow.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseAuditableEntity;
import vn.clinic.patientflow.tenant.domain.Tenant;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Ngưỡng chỉ số sinh hiệu riêng biệt cho từng bệnh nhân để AI cảnh báo.
 */
@Entity
@Table(name = "patient_vital_target")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientVitalTarget extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "vital_type", nullable = false)
    private String vitalType;

    @Column(name = "min_value")
    private BigDecimal minValue;

    @Column(name = "max_value")
    private BigDecimal maxValue;

    @Column(name = "target_value")
    private BigDecimal targetValue;

    @Column(name = "unit")
    private String unit;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;
}
