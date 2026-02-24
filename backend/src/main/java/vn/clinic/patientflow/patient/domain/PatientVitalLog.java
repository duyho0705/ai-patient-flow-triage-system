package vn.clinic.patientflow.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseEntity;

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
public class PatientVitalLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "vital_type", nullable = false, length = 32)
    private String vitalType;

    @Column(name = "value_numeric", precision = 10, scale = 2, nullable = false)
    private BigDecimal valueNumeric;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (recordedAt == null) {
            recordedAt = Instant.now();
        }
    }

    public PatientVitalLog(UUID id) {
        super(id);
    }
}
