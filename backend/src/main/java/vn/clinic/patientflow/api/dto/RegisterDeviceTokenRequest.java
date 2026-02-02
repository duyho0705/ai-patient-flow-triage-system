package vn.clinic.patientflow.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterDeviceTokenRequest {

    @NotBlank(message = "FCM token không được để trống")
    private String fcmToken;

    private String deviceType; // ios, android, web
}
