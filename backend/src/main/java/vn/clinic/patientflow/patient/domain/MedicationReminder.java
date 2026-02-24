package vn.clinic.patientflow.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseAuditableEntity;
import vn.clinic.patientflow.clinical.domain.PrescriptionItem;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "patient_medication_reminder")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationReminder extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_item_id")
    private PrescriptionItem prescriptionItem;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(name = "reminder_time", nullable = false)
    private LocalTime reminderTime;

    @Column(name = "dosage")
    private String dosage;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "notes")
    private String notes;

    @Column(name = "total_doses_taken")
    private Integer totalDosesTaken;

    @Column(name = "last_taken_at")
    private java.time.Instant lastTakenAt;

    @Column(name = "adherence_score")
    private java.math.BigDecimal adherenceScore;

    @Column(name = "tenant_id")
    private UUID tenantId;

    public MedicationReminder(UUID id) {
        super(id);
    }
}
