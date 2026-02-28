package vn.clinic.cdm.api.dto.messaging;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterDeviceTokenRequest {

    @NotBlank(message = "FCM token khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String fcmToken;

    private String deviceType; // ios, android, web
}

