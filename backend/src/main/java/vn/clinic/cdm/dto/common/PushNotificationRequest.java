package vn.clinic.cdm.dto.common;

import java.util.Map;

public record PushNotificationRequest(
    String target, // token or topic
    String title,
    String body,
    Map<String, String> data
) {}
