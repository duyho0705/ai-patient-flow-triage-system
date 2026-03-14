package vn.clinic.cdm.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.cdm.identity.domain.IdentityRole;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDto {

    private UUID id;
    private String code;
    private String nameVi;
    private String description;
    private java.util.List<PermissionDto> permissions;

    public static RoleDto fromEntity(IdentityRole r, java.util.List<PermissionDto> permissions) {
        if (r == null) return null;
        return RoleDto.builder()
                .id(r.getId())
                .code(r.getCode())
                .nameVi(r.getNameVi())
                .description(r.getDescription())
                .permissions(permissions)
                .build();
    }
}

