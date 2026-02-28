package vn.clinic.cdm.api.dto.auth;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateUserRequest {

    @Size(max = 255)
    private String fullNameVi;

    private Boolean isActive;

    @Size(max = 20)
    private String phone;


    /** Náº¿u cÃ³: thay tháº¿ toÃ n bá»™ gÃ¡n role cá»§a user. */
    private List<UserRoleAssignmentInput> roleAssignments;

    @Data
    public static class UserRoleAssignmentInput {
        private java.util.UUID tenantId;
        private String roleCode;
        private java.util.UUID branchId;
    }
}

