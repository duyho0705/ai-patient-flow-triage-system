package vn.clinic.cdm.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import vn.clinic.cdm.tenant.domain.Tenant;

import java.time.LocalDate;

/**
 * Quáº£n lÃ½ chi tiáº¿t bá»‡nh mÃ£n tÃ­nh cá»§a bá»‡nh nhÃ¢n.
 */
@Entity
@Table(name = "patient_chronic_condition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientChronicCondition extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "condition_name", nullable = false)
    private String conditionName;

    @Column(name = "icd10_code")
    private String icd10Code;

    @Column(name = "diagnosed_at")
    private LocalDate diagnosedAt;

    @Column(name = "severity_level")
    private String severityLevel; // e.g. STABLE, PROGRESSING, CRITICAL

    @Column(name = "status")
    private String status; // e.g. ACTIVE, REMISSION

    @Column(name = "clinical_notes", columnDefinition = "text")
    private String clinicalNotes;
}

