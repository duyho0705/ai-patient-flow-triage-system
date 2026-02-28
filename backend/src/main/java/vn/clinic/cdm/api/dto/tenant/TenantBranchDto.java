package vn.clinic.cdm.api.dto.tenant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.tenant.domain.TenantBranch;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantBranchDto {

    private UUID id;
    private UUID tenantId;
    private String code;
    private String nameVi;
    private String addressLine;
    private String city;
    private String district;
    private String ward;
    private String phone;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public static TenantBranchDto fromEntity(TenantBranch e) {
        if (e == null) return null;
        return TenantBranchDto.builder()
                .id(e.getId())
                .tenantId(e.getTenant() != null ? e.getTenant().getId() : null)
                .code(e.getCode())
                .nameVi(e.getNameVi())
                .addressLine(e.getAddressLine())
                .city(e.getCity())
                .district(e.getDistrict())
                .ward(e.getWard())
                .phone(e.getPhone())
                .isActive(e.getIsActive())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}

