package vn.clinic.patientflow.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.common.tenant.TenantContext;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Filter xác thực JWT – đọc Bearer token, validate, set SecurityContext và
 * TenantContext.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractToken(request);
            if (StringUtils.hasText(token)) {
                Claims claims = jwtUtil.validateAndParse(token);
                if (claims != null) {
                    UUID userId = jwtUtil.getUserId(claims);
                    String email = jwtUtil.getEmail(claims);
                    UUID tenantId = jwtUtil.getTenantId(claims);
                    UUID branchId = jwtUtil.getBranchId(claims);
                    List<String> roles = jwtUtil.getRoles(claims);
                    if (userId != null && email != null) {
                        AuthPrincipal principal = AuthPrincipal.builder()
                                .userId(userId)
                                .email(email)
                                .tenantId(tenantId)
                                .branchId(branchId)
                                .roles(roles != null ? roles : List.of())
                                .build();
                        List<SimpleGrantedAuthority> authorities = (roles != null ? roles : List.<String>of())
                                .stream()
                                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                                .collect(Collectors.toList());
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                principal, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        if (tenantId != null) {
                            TenantContext.setTenantId(tenantId);
                        }
                        if (branchId != null) {
                            TenantContext.setBranchId(branchId);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("JWT validation failed: {}", e.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        // 1. Check Authorization header
        String header = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(header) && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length()).trim();
        }

        // 2. Check Cookies
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
