package vn.clinic.cdm.api.dto.messaging;

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
public class PatientChatMessageDto {
    private UUID id;
    private String senderType;
    private String content;
    private Instant sentAt;
    private String fileUrl;
}

