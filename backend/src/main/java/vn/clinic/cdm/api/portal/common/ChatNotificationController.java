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
@Tag(name = "Chat Notification", description = "Gửi thông báo có tin nhắn mới")
public class ChatNotificationController {

    private final ChatNotificationService chatNotificationService;

    @PostMapping
    @Operation(summary = "Gửi thông báo đẩy khi có tin nhắn mới")
    public ResponseEntity<ApiResponse<Void>> sendNotify(@RequestBody SendChatNotificationRequest request) {
        // Run asynchronously so we don't block the frontend response
        new Thread(() -> chatNotificationService.handleSendChatNotification(request)).start();
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
