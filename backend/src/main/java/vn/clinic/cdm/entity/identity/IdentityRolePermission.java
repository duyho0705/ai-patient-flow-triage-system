package vn.clinic.cdm.entity.identity;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.entity.common.BaseEntity;

@Entity
@Table(name = "identity_role_permission", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "role_id", "permission_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityRolePermission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private IdentityRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false)
    private IdentityPermission permission;
}
