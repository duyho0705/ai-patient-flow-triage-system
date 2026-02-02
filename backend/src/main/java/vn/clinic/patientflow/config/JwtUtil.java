package vn.clinic.patientflow.config;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Tạo và xác thực JWT – subject = userId, claims: email, tenantId, branchId,
 * roles.
 * HS256; secret phải ≥ 256 bit (32 bytes) cho HS256.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtUtil {

    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_TENANT_ID = "tenantId";
    private static final String CLAIM_BRANCH_ID = "branchId";
    private static final String CLAIM_ROLES = "roles";

    private final JwtProperties jwtProperties;

    private SecretKey signingKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("auth.jwt.secret must be at least 256 bits (32 bytes) for HS256");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Tạo JWT cho user sau khi login thành công.
     */
    public String generateToken(UUID userId, String email, UUID tenantId, UUID branchId, List<String> roles) {
        Instant now = Instant.now();
        Instant exp = now.plusMillis(jwtProperties.getExpirationMs());
        return Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_EMAIL, email)
                .claim(CLAIM_TENANT_ID, tenantId != null ? tenantId.toString() : null)
                .claim(CLAIM_BRANCH_ID, branchId != null ? branchId.toString() : null)
                .claim(CLAIM_ROLES, roles != null ? roles : List.of())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(signingKey())
                .compact();
    }

    /**
     * Parse và validate JWT; trả về claims hoặc null nếu invalid.
     */
    public Claims validateAndParse(String token) {
        if (token == null || token.isBlank())
            return null;
        try {
            return Jwts.parser()
                    .verifyWith(signingKey())
                    .build()
                    .parseSignedClaims(token.trim())
                    .getPayload();
        } catch (JwtException e) {
            log.debug("Invalid JWT: {}", e.getMessage());
            return null;
        }
    }

    public UUID getUserId(Claims claims) {
        if (claims == null)
            return null;
        String sub = claims.getSubject();
        if (sub == null)
            return null;
        try {
            return UUID.fromString(sub);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public String getEmail(Claims claims) {
        return claims == null ? null : claims.get(CLAIM_EMAIL, String.class);
    }

    public UUID getTenantId(Claims claims) {
        String s = claims == null ? null : claims.get(CLAIM_TENANT_ID, String.class);
        if (s == null || s.isBlank())
            return null;
        try {
            return UUID.fromString(s);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public UUID getBranchId(Claims claims) {
        String s = claims == null ? null : claims.get(CLAIM_BRANCH_ID, String.class);
        if (s == null || s.isBlank())
            return null;
        try {
            return UUID.fromString(s);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public List<String> getRoles(Claims claims) {
        if (claims == null)
            return List.of();
        Object r = claims.get(CLAIM_ROLES);
        if (r instanceof List<?> list) {
            return list.stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }
        return List.of();
    }
}
