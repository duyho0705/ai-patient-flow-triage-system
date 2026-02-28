package vn.clinic.cdm.clinical.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;

import java.util.UUID;

/**
 * Thuá»‘c trong toa.
 */
@Entity
@Table(name = "medication")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(name = "dosage")
    private String dosage;

    @Column(name = "quantity")
    private java.math.BigDecimal quantity;

    @Column(name = "frequency")
    private String frequency;

    @Column(name = "instructions", columnDefinition = "text")
    private String instructions;

    @Column(name = "duration_days")
    private Integer durationDays;

    public String getDosageInstruction() {
        return (dosage != null ? dosage : "") + (instructions != null ? " (" + instructions + ")" : "");
    }

    public Medication(UUID id) {
        super(id);
    }
}

