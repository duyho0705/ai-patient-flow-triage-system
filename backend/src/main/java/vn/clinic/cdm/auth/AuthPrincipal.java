package vn.clinic.cdm.auth;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

/**
 * Principal lÆ°u trong SecurityContext sau khi xÃ¡c thá»±c JWT â€“ userId, email,
 * tenant, branch, roles.
 */
@Getter
@Builder
public class AuthPrincipal {

    private final UUID userId;
    private final String email;
    private final UUID tenantId;
    private final UUID branchId;
    private final List<String> roles;

    public static AuthPrincipal getCurrent() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthPrincipal principal) {
            return principal;
        }
        return null;
    }

    public static UUID getCurrentUserId() {
        var p = getCurrent();
        return p != null ? p.getUserId() : null;
    }

    public static String getCurrentUserEmail() {
        var p = getCurrent();
        return p != null ? p.getEmail() : null;
    }
}

