package vn.clinic.patientflow.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Enables JPA auditing (created_at, updated_at via AuditingEntityListener).
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
