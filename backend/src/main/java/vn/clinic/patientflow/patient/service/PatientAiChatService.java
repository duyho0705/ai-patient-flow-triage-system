package vn.clinic.patientflow.patient.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.aiaudit.domain.AiAuditLog.AiFeatureType;
import vn.clinic.patientflow.aiaudit.service.AiAuditServiceV2;
import vn.clinic.patientflow.api.dto.AiChatRequest;
import vn.clinic.patientflow.api.dto.AiChatResponse;
import vn.clinic.patientflow.clinical.repository.LabResultRepository;
import vn.clinic.patientflow.clinical.repository.PrescriptionRepository;
import vn.clinic.patientflow.clinical.service.ClinicalService;
import vn.clinic.patientflow.clinical.service.PromptRegistry;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.scheduling.service.SchedulingService;
import vn.clinic.patientflow.triage.repository.TriageVitalRepository;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

/**
 * Enterprise AI Chat Service for Patient Portal.
 * <p>
 * Uses LangChain4j + Gemini to provide personalized medical advice
 * based on real patient data (vitals, prescriptions, appointments, invoices).
 * Falls back to rule-based responses if AI is not configured.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatientAiChatService {

        private final SchedulingService schedulingService;
        private final PrescriptionRepository prescriptionRepository;
        private final TriageVitalRepository triageVitalRepository;
        private final LabResultRepository labResultRepository;
        private final ClinicalService clinicalService;
        private final PromptRegistry promptRegistry;
        private final MedicationReminderService medicationReminderService;
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

                        // Record Audit Log (Enterprise)
                        recordAudit(patient, prompt, aiResponse, startTime, "SUCCESS", null);

                        // Extract JSON from AI response
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
                        return "Tính năng tóm tắt sức khỏe AI hiện đang bảo trì. Vui lòng thử lại sau.";
                }

                try {
                        String context = buildPatientContext(patient);
                        String prompt = promptRegistry.getPatientHealthSummaryPrompt(
                                        patient.getFullNameVi(), context);
                        return chatModel.chat(prompt);
                } catch (Exception e) {
                        log.error("Failed to generate AI Health Summary: {}", e.getMessage());
                        return "Không thể tạo bản tóm tắt sức khỏe lúc này. Lỗi kết nối AI.";
                }
        }

        // ── Private Helpers ──────────────────────────────────────────────

        private String buildPatientContext(Patient p) {
                StringBuilder sb = new StringBuilder();

                // Basic Info
                sb.append("=== THÔNG TIN BỆNH NHÂN ===\n");
                sb.append("- Tên: ").append(p.getFullNameVi()).append("\n");
                sb.append("- Tuổi: ").append(Period.between(p.getDateOfBirth(), LocalDate.now()).getYears())
                                .append("\n");
                sb.append("- Giới tính: ").append(p.getGender()).append("\n\n");

                // Latest Vitals
                var vitals = triageVitalRepository.findByPatientId(p.getId());
                if (!vitals.isEmpty()) {
                        sb.append("=== SINH HIỆU MỚI NHẤT ===\n");
                        vitals.stream().limit(8).forEach(v -> sb.append("- ").append(v.getVitalType())
                                        .append(": ").append(v.getValueNumeric()).append(" ").append(v.getUnit())
                                        .append(" (ghi nhận lúc ").append(v.getRecordedAt()).append(")\n"));
                        sb.append("\n");
                }

                // Recent Consultations
                var recentConsultations = clinicalService.getRecentConsultationsByPatient(p.getId(), 5);
                if (!recentConsultations.isEmpty()) {
                        sb.append("=== LỊCH SỬ THĂM KHÁM GẦN ĐÂY ===\n");
                        recentConsultations.forEach(c -> sb.append("- Ngày ").append(c.getStartedAt())
                                        .append(": ").append(c.getDiagnosisNotes()).append("\n"));
                        sb.append("\n");
                }

                // Lab Results
                var recentLabs = labResultRepository.findByConsultationPatientIdOrderByCreatedAtDesc(p.getId());
                if (!recentLabs.isEmpty()) {
                        sb.append("=== KẾT QUẢ XÉT NGHIỆM ===\n");
                        recentLabs.stream().limit(10).forEach(l -> sb.append("- ").append(l.getTestName())
                                        .append(": ").append(l.getValue()).append(" ").append(l.getUnit())
                                        .append(" (").append(l.getStatus()).append(")\n"));
                        sb.append("\n");
                }

                // Current Medications
                var prescriptions = prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(p.getId());
                if (!prescriptions.isEmpty()) {
                        sb.append("=== THUỐC ĐANG DÙNG (ĐƠN MỚI NHẤT) ===\n");
                        prescriptions.get(0).getItems().forEach(i -> {
                                String name = i.getProductNameCustom();
                                if ((name == null || name.isBlank()) && i.getProduct() != null) {
                                        name = i.getProduct().getNameVi();
                                }
                                sb.append("- ").append(name).append(": ").append(i.getDosageInstruction()).append("\n");
                        });
                        sb.append("\n");
                }

                // Medication Reminders
                var reminders = medicationReminderService.getRemindersByPatient(p.getId());
                if (!reminders.isEmpty()) {
                        sb.append("=== LỊCH NHẮC UỐNG THUỐC HIỆN TẠI ===\n");
                        reminders.stream().filter(r -> r.getIsActive()).forEach(r -> sb.append("- ")
                                        .append(r.getMedicineName()).append(" lúc ").append(r.getReminderTime())
                                        .append("\n"));
                        sb.append("\n");
                }

                // Upcoming Appointments
                var appts = schedulingService.getUpcomingAppointmentsByPatient(p.getId());
                if (!appts.isEmpty()) {
                        sb.append("=== LỊCH HẸN SẮP TỚI ===\n");
                        appts.forEach(a -> sb.append("- Ngày ").append(a.getAppointmentDate()).append(" lúc ")
                                        .append(a.getSlotStartTime()).append(" (").append(a.getAppointmentType())
                                        .append(")\n"));
                        sb.append("\n");
                }

                return sb.toString();
        }

        private String buildChatHistory(List<AiChatRequest.ChatMessage> history) {
                if (history == null || history.isEmpty()) {
                        return "";
                }
                StringBuilder sb = new StringBuilder();
                for (var msg : history) {
                        sb.append(msg.getRole().toUpperCase()).append(": ")
                                        .append(msg.getContent()).append("\n");
                }
                return sb.toString();
        }

        private String buildChatPrompt(String context, String history, String message) {
                return String.format(
                                "Bạn là Trợ lý Y tế AI 'PatientFlow' của phòng khám. "
                                                + "Hãy dùng thông tin hồ sơ sau để hỗ trợ bệnh nhân:\n\n"
                                                + "HỒ SƠ BỆNH NHÂN:\n%s\n\n"
                                                + "LỊCH SỬ TRÒ CHUYỆN:\n%s\n"
                                                + "CÂU HỎI MỚI: \"%s\"\n\n"
                                                + "YÊU CẦU QUAN TRỌNG:\n"
                                                + "1. Trả lời bằng tiếng Việt, chuyên nghiệp, lịch sự.\n"
                                                + "2. Nếu bệnh nhân có triệu chứng cấp cứu (đau ngực, khó thở nặng, v.v.), "
                                                + "hãy khuyên đi cấp cứu ngay.\n"
                                                + "3. Trả về DUY NHẤT định dạng JSON sau:\n"
                                                + "{ \"response\": \"...nội dung trả lời...\", "
                                                + "\"suggestions\": [\"gợi ý 1\", \"gợi ý 2\"] }",
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
                                patient.getIdentityUserId(),
                                prompt,
                                response,
                                System.currentTimeMillis() - startTime,
                                status,
                                errorMsg);
        }

        private AiChatResponse processRuleBased(Patient patient, AiChatRequest request) {
                String msg = request.getMessage().toLowerCase();
                String response = "Chào " + patient.getFullNameVi() + "! Tôi có thể giúp gì cho bạn?";
                List<String> suggestions = List.of("Lịch khám", "Sức khỏe", "Thanh toán");

                if (msg.contains("lịch")) {
                        response = "Bạn có thể xem lịch khám tại mục Lịch hẹn.";
                        suggestions = List.of("Xem ngay", "Đặt lịch mới");
                }

                return AiChatResponse.builder().response(response).suggestions(suggestions).build();
        }
}
