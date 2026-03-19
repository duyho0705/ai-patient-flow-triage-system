package vn.clinic.cdm.service.notification;

import vn.clinic.cdm.dto.common.PushNotificationRequest;

public interface NotificationService {
    void sendPushNotification(PushNotificationRequest request);
    
    void sendTopicNotification(PushNotificationRequest request);
}
