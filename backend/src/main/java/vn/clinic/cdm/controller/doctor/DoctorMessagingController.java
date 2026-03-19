package vn.clinic.cdm.controller.doctor;

// Unused wildcard imports removed
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.dto.messaging.PatientChatConversationDto;
import vn.clinic.cdm.dto.messaging.PatientChatMessageDto;
import vn.clinic.cdm.security.AuthPrincipal;
import vn.clinic.cdm.service.patient.PatientChatService;
import vn.clinic.cdm.service.patient.PatientService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor-portal/chat")
@RequiredArgsConstructor
@Tag(name = "Doctor Messaging", description = "Chat trực tuyến với bệnh nhân dành cho bác sĩ")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorMessagingController {

    private final PatientChatService patientChatService;
    private final PatientService patientService;

    @GetMapping("/conversations")
    @Operation(summary = "Lấy danh sách các cuộc trò chuyện với bệnh nhân")
    public ResponseEntity<ApiResponse<List<PatientChatConversationDto>>> getChatConversations() {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(patientChatService.getDoctorConversations(doctorUserId)));
    }

    @GetMapping("/history/{patientId}")
    @Operation(summary = "Lấy lịch sử trò chuyện với một bệnh nhân cụ thể")
    public ResponseEntity<ApiResponse<List<PatientChatMessageDto>>> getChatHistory(@PathVariable UUID patientId) {
        var patient = patientService.getById(patientId);
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(patientChatService.getChatHistory(patient, doctorUserId)));
    }

    @PostMapping("/send/{patientId}")
    @Operation(summary = "Gửi tin nhắn cho bệnh nhân")
    public ResponseEntity<ApiResponse<PatientChatMessageDto>> sendMessage(@PathVariable UUID patientId,
            @RequestBody String content) {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        return ResponseEntity
                .ok(ApiResponse.success(patientChatService.doctorSendMessage(doctorUserId, patientId, content)));
    }

    @PostMapping(value = "/send-file/{patientId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Gửi tin nhắn kèm file cho bệnh nhân")
    public ResponseEntity<ApiResponse<PatientChatMessageDto>> sendChatFile(
            @PathVariable UUID patientId,
            @RequestParam(required = false) String content,
            @RequestParam("file") MultipartFile file) {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse
                .success(patientChatService.doctorSendMessageWithFile(doctorUserId, patientId, content, file)));
    }
}
