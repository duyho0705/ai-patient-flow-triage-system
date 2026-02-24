package vn.clinic.patientflow.api.portal.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.PatientChatConversationDto;
import vn.clinic.patientflow.api.dto.PatientChatMessageDto;
import vn.clinic.patientflow.auth.AuthPrincipal;
import vn.clinic.patientflow.patient.service.PatientChatService;
import vn.clinic.patientflow.patient.service.PatientService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor-portal/chat")
@RequiredArgsConstructor
@Tag(name = "Doctor Messaging", description = "Chat trực tuyến với bệnh nhân dành cho bác sĩ")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
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
}
