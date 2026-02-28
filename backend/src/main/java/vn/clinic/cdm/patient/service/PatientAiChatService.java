package vn.clinic.cdm.patient.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.aiaudit.domain.AiAuditLog.AiFeatureType;
import vn.clinic.cdm.aiaudit.service.AiAuditServiceV2;
import vn.clinic.cdm.api.dto.ai.AiChatRequest;
import vn.clinic.cdm.api.dto.ai.AiChatResponse;
import vn.clinic.cdm.clinical.repository.LabResultRepository;
import vn.clinic.cdm.clinical.repository.PrescriptionRepository;
import vn.clinic.cdm.clinical.service.ClinicalService;
import vn.clinic.cdm.clinical.service.PromptRegistry;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.clinical.repository.HealthMetricRepository;
import vn.clinic.cdm.clinical.service.MedicationService;
import vn.clinic.cdm.scheduling.service.SchedulingService;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

/**
 * Enterprise AI Chat Service for Patient Portal.
 * CDM Specialization.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatientAiChatService {

        private final SchedulingService schedulingService;
        private final PrescriptionRepository prescriptionRepository;
        private final HealthMetricRepository healthMetricRepository;
        private final LabResultRepository labResultRepository;
        private final ClinicalService clinicalService;
        private final PromptRegistry promptRegistry;
        private final MedicationService medicationService;
        private final AiAuditServiceV2 aiAuditService;

        private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

        @Autowired(required = false)
        private ChatLanguageModel chatModel;

        public AiChatResponse getAssistantResponse(Patient patient, String message,
                        List<AiChatRequest.ChatMessage> history) {
                AiChatRequest request = new AiChatRequest();
                request.setMessage(message);
                request.setHistory(history);
                return processMessage(patient, request);
        }

        public AiChatResponse processMessage(Patient patient, AiChatRequest request) {
                if (chatModel == null) {
                        log.warn("Gemini AI is not configured. Using rule-based fallback.");
                        return processRuleBased(patient, request);
                }

                long startTime = System.currentTimeMillis();
                String prompt = "";
                String aiResponse = "";
                try {
                        String context = buildPatientContext(patient);
                        String historyStr = buildChatHistory(request.getHistory());

                        prompt = buildChatPrompt(context, historyStr, request.getMessage());
                        aiResponse = chatModel.chat(prompt);

                        recordAudit(patient, prompt, aiResponse, startTime, "SUCCESS", null);

                        String jsonOnly = extractJson(aiResponse);
                        return OBJECT_MAPPER.readValue(jsonOnly, AiChatResponse.class);

                } catch (Exception e) {
                        log.error("AI Service Error: {}", e.getMessage(), e);
                        recordAudit(patient, prompt, aiResponse, startTime, "FAILED", e.getMessage());
                        return processRuleBased(patient, request);
                }
        }

        public String getPersonalHealthSummary(Patient patient) {
                if (chatModel == null) {
                        return "TÃ­nh nÄƒng tÃ³m táº¯t sá»©c khá»e AI hiá»‡n Ä‘ang báº£o trÃ¬. Vui lÃ²ng thá»­ láº¡i sau.";
                }

                try {
                        String context = buildPatientContext(patient);
                        String prompt = promptRegistry.getPatientHealthSummaryPrompt(
                                        patient.getFullNameVi(), context);
                        return chatModel.chat(prompt);
                } catch (Exception e) {
                        log.error("Failed to generate AI Health Summary: {}", e.getMessage());
                        return "KhÃ´ng thá»ƒ táº¡o báº£n tÃ³m táº¯t sá»©c khá»e lÃºc nÃ y. Lá»—i káº¿t ná»‘i AI.";
                }
        }

        // â”€â”€ Private Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        private String buildPatientContext(Patient p) {
                StringBuilder sb = new StringBuilder();

                sb.append("=== THÃ”NG TIN Bá»†NH NHÃ‚N ===\n");
                sb.append("- TÃªn: ").append(p.getFullNameVi()).append("\n");
                sb.append("- Tuá»•i: ").append(Period.between(p.getDateOfBirth(), LocalDate.now()).getYears())
                                .append("\n");
                sb.append("- Giá»›i tÃ­nh: ").append(p.getGender()).append("\n\n");

                // Latest Vitals from PatientVitalLog
                var vitals = healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(p.getId());
                if (!vitals.isEmpty()) {
                        sb.append("=== CHá»ˆ Sá» Sá»¨C KHá»ŽE Gáº¦N ÄÃ‚Y ===\n");
                        vitals.stream().limit(10).forEach(v -> sb.append("- ").append(v.getMetricType())
                                        .append(": ").append(v.getValue()).append(" ").append(v.getUnit())
                                        .append(" (ghi nháº­n lÃºc ").append(v.getRecordedAt()).append(")\n"));
                        sb.append("\n");
                }

                var recentConsultations = clinicalService.getRecentConsultationsByPatient(p.getId(), 5);
                if (!recentConsultations.isEmpty()) {
                        sb.append("=== Lá»ŠCH Sá»¬ THÄ‚M KHÃM Gáº¦N ÄÃ‚Y ===\n");
                        recentConsultations.forEach(c -> sb.append("- NgÃ y ").append(c.getStartedAt())
                                        .append(": ").append(c.getDiagnosisNotes()).append("\n"));
                        sb.append("\n");
                }

                var recentLabs = labResultRepository.findByConsultationPatientIdOrderByCreatedAtDesc(p.getId());
                if (!recentLabs.isEmpty()) {
                        sb.append("=== Káº¾T QUáº¢ XÃ‰T NGHIá»†M ===\n");
                        recentLabs.stream().limit(10).forEach(l -> sb.append("- ").append(l.getTestName())
                                        .append(": ").append(l.getValue()).append(" ").append(l.getUnit())
                                        .append(" (").append(l.getStatus()).append(")\n"));
                        sb.append("\n");
                }

                var prescriptions = prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(p.getId());
                if (!prescriptions.isEmpty()) {
                        sb.append("=== THUá»C ÄANG DÃ™NG (ÄÆ N Má»šI NHáº¤T) ===\n");
                        prescriptions.get(0).getMedications().forEach(m -> {
                                sb.append("- ").append(m.getMedicineName()).append(": ")
                                                .append(m.getDosage()).append("\n");
                        });
                        sb.append("\n");
                }

                var schedules = medicationService.getDailySchedules(p.getId());
                if (!schedules.isEmpty()) {
                        sb.append("=== Lá»ŠCH Uá»NG THUá»C HÃ”M NAY ===\n");
                        schedules.forEach(s -> sb.append("- ")
                                        .append(s.getMedication().getMedicineName()).append(" lÃºc ")
                                        .append(s.getScheduledTime())
                                        .append(" (Tráº¡ng thÃ¡i: ").append(s.getStatus()).append(")\n"));
                        sb.append("\n");
                }

                var appts = schedulingService.getUpcomingAppointmentsByPatient(p.getId());
                if (!appts.isEmpty()) {
                        sb.append("=== Lá»ŠCH Háº¸N Sáº®P Tá»šI ===\n");
                        appts.forEach(a -> sb.append("- NgÃ y ").append(a.getAppointmentDate()).append(" lÃºc ")
                                        .append(a.getSlotStartTime()).append(" (").append(a.getAppointmentType())
                                        .append(")\n"));
                        sb.append("\n");
                }

                return sb.toString();
        }

        private String buildChatHistory(List<AiChatRequest.ChatMessage> history) {
                if (history == null || history.isEmpty())
                        return "";
                StringBuilder sb = new StringBuilder();
                for (var msg : history) {
                        sb.append(msg.getRole().toUpperCase()).append(": ")
                                        .append(msg.getContent()).append("\n");
                }
                return sb.toString();
        }

        private String buildChatPrompt(String context, String history, String message) {
                return String.format(
                                "Báº¡n lÃ  'Trá»£ lÃ½ Bá»‡nh mÃ£n tÃ­nh AI' (CDM Companion) cá»§a phÃ²ng khÃ¡m. "
                                                + "Báº¡n chuyÃªn há»— trá»£ bá»‡nh nhÃ¢n quáº£n lÃ½ cÃ¡c bá»‡nh mÃ£n tÃ­nh nhÆ° tiá»ƒu Ä‘Æ°á»ng, huyáº¿t Ã¡p, SPO2 táº¡i nhÃ .\n\n"
                                                + "Há»’ SÆ  Bá»†NH NHÃ‚N:\n%s\n\n"
                                                + "Lá»ŠCH Sá»¬ TRÃ’ CHUYá»†N:\n%s\n"
                                                + "CÃ‚U Há»ŽI Má»šI: \"%s\"\n\n"
                                                + "YÃŠU Cáº¦U QUAN TRá»ŒNG:\n"
                                                + "1. Tráº£ lá»i báº±ng tiáº¿ng Viá»‡t, chuyÃªn nghiá»‡p, lá»‹ch sá»±.\n"
                                                + "2. Náº¿u bá»‡nh nhÃ¢n cÃ³ triá»‡u chá»©ng cáº¥p cá»©u (Ä‘au ngá»±c, khÃ³ thá»Ÿ náº·ng, v.v.), "
                                                + "hÃ£y khuyÃªn Ä‘i cáº¥p cá»©u ngay.\n"
                                                + "3. Tráº£ vá» DUY NHáº¤T Ä‘á»‹nh dáº¡ng JSON sau:\n"
                                                + "{ \"response\": \"...ná»™i dung tráº£ lá»i...\", "
                                                + "\"suggestions\": [\"gá»£i Ã½ 1\", \"gá»£i Ã½ 2\"] }",
                                context, history, message);
        }

        private String extractJson(String aiResponse) {
                String json = aiResponse;
                if (json.contains("{")) {
                        json = json.substring(json.indexOf("{"), json.lastIndexOf("}") + 1);
                }
                return json;
        }

        private void recordAudit(Patient patient, String prompt, String response,
                        long startTime, String status, String errorMsg) {
                aiAuditService.recordInteraction(
                                AiFeatureType.CHAT,
                                patient.getId(),
                                patient.getIdentityUser() != null ? patient.getIdentityUser().getId() : null,
                                prompt,
                                response,
                                System.currentTimeMillis() - startTime, status, errorMsg);
        }

        private AiChatResponse processRuleBased(Patient patient, AiChatRequest request) {
                String msg = request.getMessage().toLowerCase();
                String response = "ChÃ o " + patient.getFullNameVi() + "! TÃ´i cÃ³ thá»ƒ giÃºp gÃ¬ cho báº¡n?";
                List<String> suggestions = List.of("Lá»‹ch khÃ¡m", "Sá»©c khá»e", "Thanh toÃ¡n");

                if (msg.contains("lá»‹ch")) {
                        response = "Báº¡n cÃ³ thá»ƒ xem lá»‹ch khÃ¡m táº¡i má»¥c Lá»‹ch háº¹n.";
                        suggestions = List.of("Xem ngay", "Äáº·t lá»‹ch má»›i");
                }
                return AiChatResponse.builder().response(response).suggestions(suggestions).build();
        }
}

