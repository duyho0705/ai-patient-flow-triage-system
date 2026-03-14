package vn.clinic.cdm.api.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingDto {
    private UUID id;
    private String settingKey;
    private String settingValue;
    private String description;
    private String category;

    public static SystemSettingDto fromEntity(vn.clinic.cdm.common.domain.SystemSetting entity) {
        return SystemSettingDto.builder()
                .id(entity.getId())
                .settingKey(entity.getSettingKey())
                .settingValue(entity.getSettingValue())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .build();
    }
}
