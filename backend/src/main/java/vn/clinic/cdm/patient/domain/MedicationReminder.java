package vn.clinic.cdm.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import java.time.LocalTime;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "medication_reminder")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationReminder extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(name = "reminder_time")
    private LocalTime reminderTime;

    @Column(name = "dosage")
    private String dosage;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "total_doses_taken")
    private Integer totalDosesTaken;

    @Column(name = "last_taken_at")
    private Instant lastTakenAt;

    @Column(name = "adherence_score")
    private BigDecimal adherenceScore;

    @Column(name = "notes")
    private String notes;

    public MedicationReminder(UUID id) {
        super(id);
    }
}

