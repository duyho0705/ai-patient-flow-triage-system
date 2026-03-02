package vn.clinic.cdm.identity.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;
import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.tenant.domain.TenantBranch;

import java.time.Instant;
import java.util.UUID;

/**
 * Gán vai trò cho user theo tenant/chi nhánh. branch_id NULL = toàn tenant.
 */
@Entity
@Table(name = "identity_user_role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityUserRole extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private IdentityUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private IdentityRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private TenantBranch branch;

    public IdentityUserRole(UUID id) {
        super(id);
    }
}
