package vn.clinic.cdm.tenant.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;

import java.util.UUID;

/**
 * Chi nhÃ¡nh váº­t lÃ½ thuá»™c tenant.
 */
@Entity
@Table(name = "tenant_branch")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantBranch extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "code", nullable = false, length = 32)
    private String code;

    @Column(name = "name_vi", nullable = false, length = 255)
    private String nameVi;

    @Column(name = "address_line", length = 500)
    private String addressLine;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "ward", length = 100)
    private String ward;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public TenantBranch(UUID id) {
        super(id);
    }
}

