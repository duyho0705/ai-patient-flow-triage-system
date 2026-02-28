package vn.clinic.cdm.clinical.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;

import java.time.Instant;
import java.util.UUID;

/**
 * Lá»‹ch uá»‘ng thuá»‘c vÃ  theo dÃµi tuÃ¢n thá»§.
 */
@Entity
@Table(name = "medication_schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationSchedule extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(name = "scheduled_time", nullable = false)
    private Instant scheduledTime;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, TAKEN, MISSED

    @Column(name = "taken_at")
    private Instant takenAt;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    public MedicationSchedule(UUID id) {
        super(id);
    }
}

