package vn.clinic.patientflow.api.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateUserRequest {

    @Size(max = 255)
    private String fullNameVi;

    private Boolean isActive;

    /** Nếu có: thay thế toàn bộ gán role của user. */
    private List<UserRoleAssignmentInput> roleAssignments;

    @Data
    public static class UserRoleAssignmentInput {
        private java.util.UUID tenantId;
        private String roleCode;
        private java.util.UUID branchId;
    }
}
