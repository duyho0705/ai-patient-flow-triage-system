package vn.clinic.cdm.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Cáº¥u hÃ¬nh JWT â€“ secret vÃ  thá»i háº¡n token.
 * Trong production: JWT_SECRET qua biáº¿n mÃ´i trÆ°á»ng.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "auth.jwt")
public class JwtProperties {

    private String secret = "change-me-in-production";
    private long expirationMs = 86400000L; // 24h
}

