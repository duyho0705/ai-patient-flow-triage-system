package vn.clinic.cdm.clinical.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;

import java.util.UUID;

@Entity
@Table(name = "diagnostic_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticImage extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private ClinicalConsultation consultation;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    public DiagnosticImage(UUID id) {
        super(id);
    }
}

