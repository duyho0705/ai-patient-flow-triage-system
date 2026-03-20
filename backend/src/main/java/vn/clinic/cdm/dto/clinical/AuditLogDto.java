package vn.clinic.cdm.dto.clinical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private String userName;
    private String action;
    private String entityName;
    private UUID entityId;
    private String details;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String userAgent;
    private Instant timestamp;
    private String status;

    public static AuditLogDto fromEntity(vn.clinic.cdm.entity.common.AuditLog l, String userName) {
        return AuditLogDto.builder()
                .id(l.getId())
                .userId(l.getUserId())
                .userEmail(l.getEmail())
                .userName(userName)
                .action(l.getAction())
                .entityName(l.getEntityName())
                .entityId(l.getEntityId())
                .details(l.getDetails())
                .oldValue(l.getOldValue())
                .newValue(l.getNewValue())
                .ipAddress(l.getIpAddress())
                .userAgent(l.getUserAgent())
                .timestamp(l.getCreatedAt())
                .status(l.getStatus())
                .build();
    }
}
