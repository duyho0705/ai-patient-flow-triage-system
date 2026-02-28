package vn.clinic.cdm.api.dto.clinical;

import lombok.Builder;
import lombok.Data;
import vn.clinic.cdm.clinical.domain.DiagnosticImage;

import java.util.UUID;

@Data
@Builder
public class DiagnosticImageDto {
    private UUID id;
    private String title;
    private String imageUrl;
    private String description;
    private String recordedAt;

    public static DiagnosticImageDto fromEntity(DiagnosticImage entity) {
        return DiagnosticImageDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .imageUrl(entity.getImageUrl())
                .description(entity.getDescription())
                .recordedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .build();
    }
}

