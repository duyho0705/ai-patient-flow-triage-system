package vn.clinic.cdm.clinical.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.clinical.domain.HealthMetric;
import vn.clinic.cdm.patient.domain.Patient;

import java.util.List;

/**
 * PhÃ¢n tÃ­ch rá»§i ro báº±ng AI (Role 2).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiClinicalAnalysisService {

    @Autowired(required = false)
    private ChatLanguageModel chatModel;

    public String analyzePatientHealth(Patient patient, List<HealthMetric> metrics) {
        if (chatModel == null) {
            return "AI Analysis is currently unavailable. Please check system configuration.";
        }

        String context = buildPatientSummary(patient, metrics);
        String prompt = "Báº¡n lÃ  bÃ¡c sÄ© AI chuyÃªn nghiá»‡p. HÃ£y phÃ¢n tÃ­ch cÃ¡c chá»‰ sá»‘ sá»©c khá»e sau vÃ  Ä‘Æ°a ra Ä‘Ã¡nh giÃ¡ rá»§i ro (Tháº¥p, Trung bÃ¬nh, Cao) kÃ¨m theo lá»i khuyÃªn chuyÃªn mÃ´n:\n\n"
                + context + "\n\n"
                + "YÃªu cáº§u:\n"
                + "1. Tráº£ lá»i báº±ng tiáº¿ng Viá»‡t.\n"
                + "2. Táº­p trung vÃ o cÃ¡c báº¥t thÆ°á»ng.\n"
                + "3. ÄÆ°a ra cÃ¡c bÆ°á»›c tiáº¿p theo cho bÃ¡c sÄ© Ä‘iá»u trá»‹.";

        try {
            return chatModel.chat(prompt);
        } catch (Exception e) {
            log.error("AI Analysis failed: {}", e.getMessage());
            return "Lá»—i khi phÃ¢n tÃ­ch báº±ng AI: " + e.getMessage();
        }
    }

    private String buildPatientSummary(Patient p, List<HealthMetric> metrics) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bá»‡nh nhÃ¢n: ").append(p.getFullNameVi()).append("\n");
        sb.append("Giá»›i tÃ­nh: ").append(p.getGender()).append("\n");
        sb.append("Chá»‰ sá»‘ gáº§n Ä‘Ã¢y:\n");
        metrics.stream().limit(10).forEach(m -> {
            sb.append("- ").append(m.getMetricType()).append(": ")
                    .append(m.getValue()).append(" ").append(m.getUnit())
                    .append(" (").append(m.getRecordedAt()).append(")\n");
        });
        return sb.toString();
    }
}

