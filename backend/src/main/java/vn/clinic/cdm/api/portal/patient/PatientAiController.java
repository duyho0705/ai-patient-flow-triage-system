package vn.clinic.cdm.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.ai.AiChatRequest;
import vn.clinic.cdm.api.dto.ai.AiChatResponse;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientAiChatService;
import vn.clinic.cdm.patient.service.PatientPortalService;

@RestController
@RequestMapping("/api/portal/ai")
@RequiredArgsConstructor
@Tag(name = "Patient AI", description = "AI Assistant dÃ nh cho bá»‡nh nhÃ¢n - CDM Specialization")
@PreAuthorize("hasRole('PATIENT')")
public class PatientAiController {

    private final PatientPortalService portalService;
    private final PatientAiChatService aiChatService;

    @PostMapping("/assistant")
    @Operation(summary = "Chat vá»›i trá»£ lÃ½ AI y táº¿ (Enterprise AI)")
    public ResponseEntity<ApiResponse<AiChatResponse>> getAiAssistant(@RequestBody AiChatRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(
                ApiResponse.success(aiChatService.getAssistantResponse(p, request.getMessage(), request.getHistory())));
    }

    @GetMapping("/health-summary")
    @Operation(summary = "TÃ³m táº¯t sá»©c khá»e tá»•ng quÃ¡t (Enterprise AI Report)")
    public ResponseEntity<ApiResponse<String>> getHealthSummary() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(aiChatService.getPersonalHealthSummary(p)));
    }
}

