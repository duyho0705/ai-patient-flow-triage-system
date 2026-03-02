package vn.clinic.cdm.identity.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.clinic.cdm.common.domain.BaseAuditableEntity;

import java.util.UUID;

/**
 * Vai trò người dùng (PATIENT, DOCTOR, CLINIC_MANAGER, SYSTEM_ADMIN).
 */
@Entity
@Table(name = "identity_role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityRole extends BaseAuditableEntity {

    @Column(name = "code", nullable = false, unique = true, length = 64)
    private String code;

    @Column(name = "name_vi", nullable = false, length = 255)
    private String nameVi;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "permissions_json", columnDefinition = "jsonb")
    private String permissionsJson;

    public IdentityRole(UUID id) {
        super(id);
    }
}
