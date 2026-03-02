package vn.clinic.cdm.config;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.common.tenant.TenantContext;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final vn.clinic.cdm.identity.service.IdentityService identityService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null) {
            try {
                Claims claims = jwtUtil.validateAndParse(token);
                if (claims != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UUID userId = jwtUtil.getUserId(claims);
                    Integer tokenVersionInToken = jwtUtil.getTokenVersion(claims);

                    // Token Version Validation
                    vn.clinic.cdm.identity.domain.IdentityUser user = identityService.getUserById(userId);
                    if (user != null && user.getIsActive()
                            && (tokenVersionInToken == null || tokenVersionInToken.equals(user.getTokenVersion()))) {
                        String email = jwtUtil.getEmail(claims);
                        UUID tenantId = jwtUtil.getTenantId(claims);
                        UUID branchId = jwtUtil.getBranchId(claims);
                        List<String> roles = jwtUtil.getRoles(claims);
                        List<String> permissions = jwtUtil.getPermissions(claims);

                        List<SimpleGrantedAuthority> authorities = roles.stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                .collect(Collectors.toList());

                        permissions.forEach(p -> authorities.add(new SimpleGrantedAuthority(p)));

                        AuthPrincipal principal = AuthPrincipal.builder()
                                .userId(userId)
                                .email(email)
                                .tenantId(tenantId)
                                .branchId(branchId)
                                .roles(roles)
                                .permissions(permissions)
                                .build();

                        log.debug("JWT Authenticated: User={}, Email={}, Roles={}, Tenant={}", userId, email, roles,
                                tenantId);

                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                principal, null, authorities);
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authToken);

                        if (tenantId != null) {
                            TenantContext.setTenantId(tenantId);
                            TenantContext.setBranchId(branchId);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("JWT authentication failed: {}", e.getMessage());
                // Don't throw, just let it be anonymous
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
