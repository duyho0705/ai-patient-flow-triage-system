package vn.clinic.cdm.masters.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import vn.clinic.cdm.tenant.domain.Tenant;

import java.math.BigDecimal;

@Entity
@Table(name = "medical_service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalService extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String code;

    @Column(name = "name_vi", nullable = false)
    private String nameVi;

    private String description;

    private String category; // EXAM, LAB, IMAGING, PACKAGE

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}

