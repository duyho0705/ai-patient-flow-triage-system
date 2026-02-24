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
import vn.clinic.patientflow.clinical.service.ClinicalService;
import vn.clinic.patientflow.clinical.service.ClinicalSimulationService;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientAiChatService;
import vn.clinic.patientflow.patient.service.PatientPortalService;
import vn.clinic.patientflow.triage.ai.AiTriageService;
import vn.clinic.patientflow.triage.service.TriageService;

import java.time.LocalDate;
import java.time.Period;

@RestController
@RequestMapping("/api/portal/ai")
@RequiredArgsConstructor
@Tag(name = "Patient AI", description = "AI Assistant dành cho bệnh nhân")
@Slf4j
@PreAuthorize("hasRole('PATIENT')")
public class PatientAiController {

    private final PatientPortalService portalService;
    private final PatientAiChatService aiChatService;
    private final ClinicalSimulationService simulationService;
    private final ClinicalService clinicalService;
    private final TriageService triageService;

    @PostMapping("/assistant")
    @Operation(summary = "Chat với trợ lý AI y tế (Enterprise AI)")
    public ResponseEntity<ApiResponse<AiChatResponse>> getAiAssistant(@RequestBody AiChatRequest request) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(
                ApiResponse.success(aiChatService.getAssistantResponse(p, request.getMessage(), request.getHistory())));
    }

    @PostMapping("/pre-triage")
    @Operation(summary = "Gợi ý phân loại AI dựa trên triệu chứng")
    public ResponseEntity<ApiResponse<AiTriageService.TriageSuggestionResult>> getPreTriage(
            @RequestBody String symptoms) {
        Patient p = portalService.getAuthenticatedPatient();
        int age = Period.between(p.getDateOfBirth(), LocalDate.now()).getYears();

        var input = AiTriageService.TriageInput.builder()
                .chiefComplaintText(symptoms)
                .ageInYears(age)
                .build();
        return ResponseEntity.ok(ApiResponse.success(triageService.suggestAiTriage(input)));
    }

    @GetMapping("/health-summary")
    @Operation(summary = "Tóm tắt sức khỏe tổng quát (Enterprise AI Report)")
    public ResponseEntity<ApiResponse<String>> getHealthSummary() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(aiChatService.getPersonalHealthSummary(p)));
    }

    @PostMapping("/seed-medical-data")
    @Operation(summary = "Tạo dữ liệu y tế mẫu (Chỉ dành cho Demo/Dev)")
    public ResponseEntity<ApiResponse<Void>> seedMedicalData() {
        Patient p = portalService.getAuthenticatedPatient();
        var consultations = clinicalService.getConsultationsByPatient(p.getId());
        for (var cons : consultations) {
            simulationService.generateSimulatedData(cons);
        }
        log.info("Seeded medical data for patient: {}", p.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
