package vn.clinic.patientflow.auth;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

/**
 * Principal lưu trong SecurityContext sau khi xác thực JWT – userId, email, tenant, branch, roles.
 */
@Getter
@Builder
public class AuthPrincipal {

    private final UUID userId;
    private final String email;
    private final UUID tenantId;
    private final UUID branchId;
    private final List<String> roles;
}
