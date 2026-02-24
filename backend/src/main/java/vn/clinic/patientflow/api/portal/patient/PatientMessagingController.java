package vn.clinic.patientflow.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.DoctorInfoDto;
import vn.clinic.patientflow.api.dto.PatientChatMessageDto;
import vn.clinic.patientflow.api.dto.SendChatMessageRequest;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientChatService;
import vn.clinic.patientflow.patient.service.PatientPortalService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal/chat")
@RequiredArgsConstructor
@Tag(name = "Patient Messaging", description = "Chat trực tuyến với bác sĩ")
@PreAuthorize("hasRole('PATIENT')")
public class PatientMessagingController {

    private final PatientPortalService portalService;
    private final PatientChatService patientChatService;

    @GetMapping("/doctors")
    @Operation(summary = "Lấy danh sách bác sĩ tư vấn")
    public ResponseEntity<ApiResponse<List<DoctorInfoDto>>> getChatDoctors() {
        return ResponseEntity.ok(ApiResponse.success(patientChatService.getAvailableDoctors()));
    }

    @GetMapping("/history/{doctorId}")
    @Operation(summary = "Lấy lịch sử chat với bác sĩ")
    public ResponseEntity<ApiResponse<List<PatientChatMessageDto>>> getChatHistory(@PathVariable UUID doctorId) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(patientChatService.getChatHistory(p, doctorId)));
    }

    @PostMapping("/send")
    @Operation(summary = "Gửi tin nhắn cho bác sĩ")
    public ResponseEntity<ApiResponse<PatientChatMessageDto>> sendChatMessage(
            @RequestBody SendChatMessageRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse
                .success(patientChatService.sendMessage(p, request.getDoctorUserId(), request.getContent())));
    }
}
