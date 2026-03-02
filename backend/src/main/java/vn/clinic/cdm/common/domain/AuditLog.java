package vn.clinic.cdm.common.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "user_id")
    private UUID userId;

    private String email;

    @Column(nullable = false)
    private String action; // e.g., LOGIN_SUCCESS, CREATE_PATIENT

    @Column(name = "entity_name", nullable = false)
    @Builder.Default
    private String entityName = "SYSTEM"; // e.g., PATIENT, CLINICAL_RECORD

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_value", columnDefinition = "jsonb")
    private String oldValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_value", columnDefinition = "jsonb")
    private String newValue;

    private String ipAddress;
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Builder.Default
    private String status = "SUCCESS";
}
