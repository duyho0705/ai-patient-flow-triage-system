package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.patientflow.identity.domain.IdentityUser;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDto {

    private UUID id;
    private String email;
    private String fullNameVi;
    private String phone;
    private Boolean isActive;
    private Instant lastLoginAt;
    private List<UserRoleAssignmentDto> roleAssignments;

    public static AdminUserDto fromEntity(IdentityUser u, List<UserRoleAssignmentDto> assignments) {
        if (u == null) return null;
        return AdminUserDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullNameVi(u.getFullNameVi())
                .phone(u.getPhone())
                .isActive(u.getIsActive())
                .lastLoginAt(u.getLastLoginAt())
                .roleAssignments(assignments)
                .build();
    }
}
