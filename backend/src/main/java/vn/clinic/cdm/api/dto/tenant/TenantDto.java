package vn.clinic.cdm.api.dto.tenant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.tenant.domain.Tenant;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantDto {

    private UUID id;
    private String code;
    private String nameVi;
    private String nameEn;
    private String taxCode;
    private String locale;
    private String timezone;
    private String settingsJson;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public static TenantDto fromEntity(Tenant e) {
        if (e == null) return null;
        return TenantDto.builder()
                .id(e.getId())
                .code(e.getCode())
                .nameVi(e.getNameVi())
                .nameEn(e.getNameEn())
                .taxCode(e.getTaxCode())
                .locale(e.getLocale())
                .timezone(e.getTimezone())
                .isActive(e.getIsActive())
                .settingsJson(e.getSettingsJson())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}

