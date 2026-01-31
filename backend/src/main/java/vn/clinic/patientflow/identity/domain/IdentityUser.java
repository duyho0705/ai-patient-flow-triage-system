package vn.clinic.patientflow.identity.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseAuditableEntity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Tài khoản nhân viên / admin.
 */
@Entity
@Table(name = "identity_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityUser extends BaseAuditableEntity {

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "full_name_vi", nullable = false, length = 255)
    private String fullNameVi;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = {})
    @Builder.Default
    private List<IdentityUserRole> userRoles = new ArrayList<>();

    public IdentityUser(UUID id) {
        super(id);
    }
}
