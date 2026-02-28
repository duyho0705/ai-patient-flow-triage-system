package vn.clinic.cdm.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "patient_vital_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientVitalLog extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "vital_type", nullable = false)
    private String vitalType;

    @Column(name = "value_numeric", precision = 10, scale = 2)
    private BigDecimal valueNumeric;

    @Column(name = "unit")
    private String unit;

    @Column(name = "recorded_at")
    private Instant recordedAt;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "notes")
    private String notes;

    public PatientVitalLog(UUID id) {
        super(id);
    }
}

