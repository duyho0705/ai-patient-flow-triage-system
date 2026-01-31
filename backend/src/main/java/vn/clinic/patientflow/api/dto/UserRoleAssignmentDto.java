package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/** Một gán role: user có role tại tenant (và optional branch). */
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
