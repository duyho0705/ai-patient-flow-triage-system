package vn.clinic.patientflow.api.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SendChatMessageRequest {
    private UUID doctorUserId;
    private String content;
}
