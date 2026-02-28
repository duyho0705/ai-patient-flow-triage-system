package vn.clinic.cdm.api.portal.doctor;

// Unused wildcard imports removed
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.messaging.PatientChatConversationDto;
import vn.clinic.cdm.api.dto.messaging.PatientChatMessageDto;
import vn.clinic.cdm.auth.AuthPrincipal;
import vn.clinic.cdm.patient.service.PatientChatService;
import vn.clinic.cdm.patient.service.PatientService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor-portal/chat")
@RequiredArgsConstructor
@Tag(name = "Doctor Messaging", description = "Chat trá»±c tuyáº¿n vá»›i bá»‡nh nhÃ¢n dÃ nh cho bÃ¡c sÄ©")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public class DoctorMessagingController {

    private final PatientChatService patientChatService;
    private final PatientService patientService;

    @GetMapping("/conversations")
    @Operation(summary = "Láº¥y danh sÃ¡ch cÃ¡c cuá»™c trÃ² chuyá»‡n vá»›i bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<List<PatientChatConversationDto>>> getChatConversations() {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(patientChatService.getDoctorConversations(doctorUserId)));
    }

    @GetMapping("/history/{patientId}")
    @Operation(summary = "Láº¥y lá»‹ch sá»­ trÃ² chuyá»‡n vá»›i má»™t bá»‡nh nhÃ¢n cá»¥ thá»ƒ")
    public ResponseEntity<ApiResponse<List<PatientChatMessageDto>>> getChatHistory(@PathVariable UUID patientId) {
        var patient = patientService.getById(patientId);
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(patientChatService.getChatHistory(patient, doctorUserId)));
    }

    @PostMapping("/send/{patientId}")
    @Operation(summary = "Gá»­i tin nháº¯n cho bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<PatientChatMessageDto>> sendMessage(@PathVariable UUID patientId,
            @RequestBody String content) {
        UUID doctorUserId = AuthPrincipal.getCurrentUserId();
        return ResponseEntity
                .ok(ApiResponse.success(patientChatService.doctorSendMessage(doctorUserId, patientId, content)));
    }
}

