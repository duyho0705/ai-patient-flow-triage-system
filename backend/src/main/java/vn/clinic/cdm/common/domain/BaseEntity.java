package vn.clinic.cdm.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Base for all entities â€“ UUID primary key.
 * Use {@link BaseAuditableEntity} when table has created_at/updated_at.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {

    @Id
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    protected BaseEntity() {
        this.id = UUID.randomUUID();
    }

    protected BaseEntity(UUID id) {
        this.id = id != null ? id : UUID.randomUUID();
    }

    @PrePersist
    protected void ensureId() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}

