package vn.clinic.cdm.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "medication_dosage_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationDosageLog extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_reminder_id")
    private MedicationReminder medicationReminder;

    @Column(name = "medicine_name")
    private String medicineName;

    @Column(name = "dosage_instruction")
    private String dosageInstruction;

    @Column(name = "taken_at")
    private Instant takenAt;

    @Column(name = "notes")
    private String notes;

    public MedicationDosageLog(UUID id) {
        super(id);
    }
}

