package vn.clinic.cdm.api.dto.messaging;

import lombok.Data;

@Data
public class SendChatNotificationRequest {
    private String roomId;
    private String senderType; // PATIENT or DOCTOR
    private String recipientId;
    private String content;
    private Boolean isImage;
    private String fileUrl;
}

