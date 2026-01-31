package vn.clinic.patientflow.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Cấu hình JWT – secret và thời hạn token.
 * Trong production: JWT_SECRET qua biến môi trường.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "auth.jwt")
public class JwtProperties {

    private String secret = "change-me-in-production";
    private long expirationMs = 86400000L; // 24h
}
