package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Thông tin user trong response login / me.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserDto {

    private UUID id;
    private String email;
    private String fullNameVi;
    private List<String> roles;
    private UUID tenantId;
    private UUID branchId;
}
