package vn.clinic.patientflow.clinical.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseAuditableEntity;
import vn.clinic.patientflow.patient.domain.Patient;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "clinical_prescription")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private ClinicalConsultation consultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "doctor_user_id")
    private UUID doctorUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrescriptionStatus status;

    private String notes;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PrescriptionItem> items = new ArrayList<>();

    @Column(name = "dispensed_at")
    private java.time.Instant dispensedAt;

    @Column(name = "dispenser_user_id")
    private UUID dispenserUserId;

    public enum PrescriptionStatus {
        DRAFT, ISSUED, DISPENSED, CANCELLED
    }
}
