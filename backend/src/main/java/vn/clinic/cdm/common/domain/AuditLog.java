package vn.clinic.cdm.common.domain;

import jakarta.persistence.*;
import lombok.*;
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
    private String resourceType = "SYSTEM"; // e.g., PATIENT, CLINICAL_RECORD

    @Column(name = "entity_id")
    private UUID resourceId;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String ipAddress;
    private String userAgent;

    @Column(nullable = false)
    private Instant timestamp;

    @Builder.Default
    private String status = "SUCCESS";
}
