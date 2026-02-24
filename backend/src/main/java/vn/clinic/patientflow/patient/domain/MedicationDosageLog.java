package vn.clinic.patientflow.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "medication_dosage_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationDosageLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_reminder_id")
    private MedicationReminder medicationReminder;

    @Column(name = "medicine_name", nullable = false, length = 255)
    private String medicineName;

    @Column(name = "dosage_instruction", length = 500)
    private String dosageInstruction;

    @Column(name = "taken_at", nullable = false)
    private Instant takenAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (takenAt == null) {
            takenAt = Instant.now();
        }
    }

    public MedicationDosageLog(UUID id) {
        super(id);
    }
}
