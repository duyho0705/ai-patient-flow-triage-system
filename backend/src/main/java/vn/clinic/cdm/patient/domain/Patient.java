package vn.clinic.cdm.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import vn.clinic.cdm.identity.domain.IdentityUser;
import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.clinical.domain.Doctor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Bá»‡nh nhÃ¢n.
 */
@Entity
@Table(name = "patient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "identity_user_id", unique = true)
    private IdentityUser identityUser;

    @Column(name = "external_id", length = 64)
    private String externalId;

    @Column(name = "cccd", length = 20)
    private String cccd;

    @Column(name = "full_name_vi", nullable = false, length = 255)
    private String fullNameVi;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "address_line", length = 500)
    private String addressLine;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "ward", length = 100)
    private String ward;

    @Column(name = "nationality", length = 100)
    @Builder.Default
    private String nationality = "VN";

    @Column(name = "ethnicity", length = 100)
    private String ethnicity;

    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    @Column(name = "blood_type", length = 10)
    private String bloodType;

    @Column(name = "allergies", columnDefinition = "text")
    private String allergies;

    @Column(name = "chronic_conditions", columnDefinition = "text")
    private String chronicConditions;

    @Column(name = "risk_level", length = 20)
    @Builder.Default
    private String riskLevel = "LOW";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_doctor_id")
    private Doctor assignedDoctor;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public UUID getIdentityUserId() {
        return identityUser != null ? identityUser.getId() : null;
    }

    public Patient(UUID id) {
        super(id);
    }
}

