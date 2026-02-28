package vn.clinic.cdm.api.dto.clinical;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class TimelineItemDto {
    private String id;
    private String type; // CONSULTATION, PRESCRIPTION, VITAL_LOG
    private Instant timestamp;
    private String title;
    private String subtitle;
    private String content;
    private String status;
}

