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
public class PatientChatConversationDto {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private String lastMessage;
    private Instant lastMessageAt;
    private String status;
}

