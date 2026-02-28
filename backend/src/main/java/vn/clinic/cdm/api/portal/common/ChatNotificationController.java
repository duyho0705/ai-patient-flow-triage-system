package vn.clinic.cdm.api.portal.common;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.messaging.SendChatNotificationRequest;
import vn.clinic.cdm.common.notification.ChatNotificationService;

@RestController
@RequestMapping("/api/chat/notify")
@RequiredArgsConstructor
@Tag(name = "Chat Notification", description = "Gá»­i thÃ´ng bÃ¡o cÃ³ tin nháº¯n má»›i")
public class ChatNotificationController {

    private final ChatNotificationService chatNotificationService;

    @PostMapping
    @Operation(summary = "Gá»­i thÃ´ng bÃ¡o Ä‘áº©y khi cÃ³ tin nháº¯n má»›i")
    public ResponseEntity<ApiResponse<Void>> sendNotify(@RequestBody SendChatNotificationRequest request) {
        // Run asynchronously so we don't block the frontend response
        new Thread(() -> chatNotificationService.handleSendChatNotification(request)).start();
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

