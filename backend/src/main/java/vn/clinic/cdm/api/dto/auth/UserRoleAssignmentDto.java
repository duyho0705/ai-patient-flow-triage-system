package vn.clinic.cdm.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/** Má»™t gÃ¡n role: user cÃ³ role táº¡i tenant (vÃ  optional branch). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleAssignmentDto {

    private UUID tenantId;
    private String tenantName;
    private UUID branchId;
    private String branchName;
    private String roleCode;
}

