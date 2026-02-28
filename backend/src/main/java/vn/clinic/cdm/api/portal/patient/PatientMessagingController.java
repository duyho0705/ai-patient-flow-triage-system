package vn.clinic.cdm.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.clinical.DoctorInfoDto;
import vn.clinic.cdm.api.dto.messaging.PatientChatMessageDto;
import vn.clinic.cdm.api.dto.messaging.SendChatMessageRequest;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientChatService;
import vn.clinic.cdm.patient.service.PatientPortalService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal/chat")
@RequiredArgsConstructor
@Tag(name = "Patient Messaging", description = "Chat trá»±c tuyáº¿n vá»›i bÃ¡c sÄ©")
@PreAuthorize("hasRole('PATIENT')")
public class PatientMessagingController {

    private final PatientPortalService portalService;
    private final PatientChatService patientChatService;

    @GetMapping("/doctors")
    @Operation(summary = "Láº¥y danh sÃ¡ch bÃ¡c sÄ© tÆ° váº¥n")
    public ResponseEntity<ApiResponse<List<DoctorInfoDto>>> getChatDoctors() {
        return ResponseEntity.ok(ApiResponse.success(patientChatService.getAvailableDoctors()));
    }

    @GetMapping("/history/{doctorId}")
    @Operation(summary = "Láº¥y lá»‹ch sá»­ chat vá»›i bÃ¡c sÄ©")
    public ResponseEntity<ApiResponse<List<PatientChatMessageDto>>> getChatHistory(@PathVariable UUID doctorId) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(patientChatService.getChatHistory(p, doctorId)));
    }

    @PostMapping("/send")
    @Operation(summary = "Gá»­i tin nháº¯n cho bÃ¡c sÄ©")
    public ResponseEntity<ApiResponse<PatientChatMessageDto>> sendChatMessage(
            @RequestBody SendChatMessageRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse
                .success(patientChatService.sendMessage(p, request.getDoctorUserId(), request.getContent())));
    }

    @PostMapping(value = "/send-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Gá»­i tin nháº¯n kÃ¨m file/áº£nh cho bÃ¡c sÄ©")
    public ResponseEntity<ApiResponse<PatientChatMessageDto>> sendChatFile(
            @RequestParam UUID doctorUserId,
            @RequestParam(required = false) String content,
            @RequestParam("file") MultipartFile file) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse
                .success(patientChatService.sendMessageWithFile(p, doctorUserId, content, file)));
    }
}

