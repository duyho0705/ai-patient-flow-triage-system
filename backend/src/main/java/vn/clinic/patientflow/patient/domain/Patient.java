package vn.clinic.patientflow.patient.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseAuditableEntity;
import vn.clinic.patientflow.tenant.domain.Tenant;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Bệnh nhân. Mã ngoài: external_id (phòng khám), cccd (CCCD).
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

    @Column(name = "external_id", length = 64)
    private String externalId;

    @Column(name = "cccd", length = 20)
    private String cccd;

    @Column(name = "full_name_vi", nullable = false, length = 255)
    private String fullNameVi;

    @Column(name = "date_of_birth", nullable = false)
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

    @Column(name = "nationality", nullable = false, length = 100)
    @Builder.Default
    private String nationality = "VN";

    @Column(name = "ethnicity", length = 100)
    private String ethnicity;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public Patient(UUID id) {
        super(id);
    }
}
