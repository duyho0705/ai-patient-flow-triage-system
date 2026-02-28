package vn.clinic.cdm.api.dto.clinical;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AuditLogDto {
    private UUID id;
    private String userEmail;
    private String action;
    private String resourceType;
    private String resourceId;
    private String details;
    private Instant createdAt;
}

