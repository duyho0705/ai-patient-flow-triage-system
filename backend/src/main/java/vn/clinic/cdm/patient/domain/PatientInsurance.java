package vn.clinic.cdm.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;

import java.time.LocalDate;
import java.util.UUID;

/**
 * BHYT / báº£o hiá»ƒm khÃ¡c. is_primary: má»™t báº£o hiá»ƒm chÃ­nh má»—i bá»‡nh nhÃ¢n.
 */
@Entity
@Table(name = "patient_insurance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientInsurance extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "insurance_type", nullable = false, length = 32)
    private String insuranceType;

    @Column(name = "insurance_number", nullable = false, length = 64)
    private String insuranceNumber;

    @Column(name = "holder_name", length = 255)
    private String holderName;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    public PatientInsurance(UUID id) {
        super(id);
    }
}

