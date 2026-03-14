package vn.clinic.cdm.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.identity.domain.IdentityPermission;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionDto {
    private UUID id;
    private String code;
    private String name;
    private String description;

    public static PermissionDto fromEntity(IdentityPermission p) {
        if (p == null) return null;
        return PermissionDto.builder()
                .id(p.getId())
                .code(p.getCode())
                .name(p.getName())
                .description(p.getDescription())
                .build();
    }
}
