package vn.clinic.cdm.entity.clinical;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.entity.common.BaseAuditableEntity;
import vn.clinic.cdm.entity.patient.Patient;

import java.util.UUID;

@Entity
@Table(name = "consultation_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationFeedback extends BaseAuditableEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private ClinicalConsultation consultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1-5 stars

    @Column(name = "comment", length = 1000)
    private String comment;

    public ConsultationFeedback(UUID id) {
        super(id);
    }
}

