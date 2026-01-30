package vn.clinic.patientflow.tenant.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.patientflow.common.domain.BaseAuditableEntity;

import java.util.UUID;

/**
 * Đơn vị thuê (phòng khám / tập đoàn phòng khám). Gốc multi-tenant.
 */
@Entity
@Table(name = "tenant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant extends BaseAuditableEntity {

    @Column(name = "code", nullable = false, unique = true, length = 32)
    private String code;

    @Column(name = "name_vi", nullable = false, length = 255)
    private String nameVi;

    @Column(name = "name_en", length = 255)
    private String nameEn;

    @Column(name = "tax_code", length = 32)
    private String taxCode;

    @Column(name = "locale", nullable = false, length = 10)
    @Builder.Default
    private String locale = "vi-VN";

    @Column(name = "timezone", nullable = false, length = 50)
    @Builder.Default
    private String timezone = "Asia/Ho_Chi_Minh";

    @Column(name = "settings_json", columnDefinition = "jsonb")
    private String settingsJson;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public Tenant(UUID id) {
        super(id);
    }
}
