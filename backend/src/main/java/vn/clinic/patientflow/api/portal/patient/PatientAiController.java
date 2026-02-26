package vn.clinic.patientflow.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.AiChatRequest;
import vn.clinic.patientflow.api.dto.AiChatResponse;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientAiChatService;
import vn.clinic.patientflow.patient.service.PatientPortalService;

@RestController
@RequestMapping("/api/portal/ai")
@RequiredArgsConstructor
@Tag(name = "Patient AI", description = "AI Assistant dành cho bệnh nhân - CDM Specialization")
@Slf4j
@PreAuthorize("hasRole('PATIENT')")
public class PatientAiController {

    private final PatientPortalService portalService;
    private final PatientAiChatService aiChatService;

    @PostMapping("/assistant")
    @Operation(summary = "Chat với trợ lý AI y tế (Enterprise AI)")
    public ResponseEntity<ApiResponse<AiChatResponse>> getAiAssistant(@RequestBody AiChatRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(
                ApiResponse.success(aiChatService.getAssistantResponse(p, request.getMessage(), request.getHistory())));
    }

    @GetMapping("/health-summary")
    @Operation(summary = "Tóm tắt sức khỏe tổng quát (Enterprise AI Report)")
    public ResponseEntity<ApiResponse<String>> getHealthSummary() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(aiChatService.getPersonalHealthSummary(p)));
    }
}
