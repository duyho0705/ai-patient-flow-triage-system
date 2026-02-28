package vn.clinic.cdm.aiaudit.domain;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.common.domain.BaseEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_model_version")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiModelVersion extends BaseEntity {

    @Column(name = "model_key", nullable = false, length = 64)
    private String modelKey;

    @Column(name = "version", nullable = false, length = 32)
    private String version;

    @Column(name = "config_json", columnDefinition = "jsonb")
    private String configJson;

    @Column(name = "deployed_at", nullable = false)
    private Instant deployedAt;

    @Column(name = "deprecated_at")
    private Instant deprecatedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public AiModelVersion(UUID id) {
        super(id);
    }
}

