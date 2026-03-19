package vn.clinic.cdm.service.notification;

import vn.clinic.cdm.dto.messaging.SendChatNotificationRequest;

public interface ChatNotificationService {
    void handleSendChatNotification(SendChatNotificationRequest request);
}
