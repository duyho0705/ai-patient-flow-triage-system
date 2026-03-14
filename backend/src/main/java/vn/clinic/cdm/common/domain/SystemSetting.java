package vn.clinic.cdm.common.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting extends BaseAuditableEntity {
    
    @Column(name = "setting_key", unique = true, nullable = false)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;

    private String description;
    
    @Builder.Default
    private String category = "GENERAL"; // ALERT, EMAIL, SMS, PUSH
}
