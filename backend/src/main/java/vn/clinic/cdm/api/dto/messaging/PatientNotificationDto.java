package vn.clinic.cdm.api.dto.messaging;

import lombok.*;
import vn.clinic.cdm.patient.domain.PatientNotification;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientNotificationDto {
    private UUID id;
    private String title;
    private String content;
    private String type;
    private String relatedResourceId;
    private boolean isRead;
    private Instant createdAt;

    public static PatientNotificationDto fromEntity(PatientNotification entity) {
        return PatientNotificationDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .type(entity.getType())
                .relatedResourceId(entity.getRelatedResourceId())
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

