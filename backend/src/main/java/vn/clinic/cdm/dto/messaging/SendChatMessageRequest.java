package vn.clinic.cdm.dto.messaging;

import lombok.Data;
import java.util.UUID;

@Data
public class SendChatMessageRequest {
    private UUID doctorUserId;
    private String content;
}

