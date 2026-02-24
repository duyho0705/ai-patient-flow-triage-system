package vn.clinic.patientflow.pharmacy.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.aiaudit.domain.AiAuditLog;
import vn.clinic.patientflow.aiaudit.service.AiAuditServiceV2;
import vn.clinic.patientflow.clinical.service.PromptRegistry;

@Service
@RequiredArgsConstructor
@Slf4j
public class PharmacyAiService {

    private final PromptRegistry promptRegistry;
    private final AiAuditServiceV2 aiAuditService;

    @Autowired(required = false)
    private ChatLanguageModel chatModel;

    @Cacheable(value = "ai_support", key = "'drug_' + #query")
    public String searchDrugInfo(String query) {
        if (chatModel == null)
            return "AI Drug Search is unavailable.";

        long startTime = System.currentTimeMillis();
        String prompt = promptRegistry.getPharmacyDrugSearchPrompt(query);

        try {
            String response = chatModel.chat(prompt);

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.PHARMACY,
                    null, null,
                    prompt, response,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS", null);

            return response;
        } catch (Exception e) {
            log.error("AI Drug Search error: {}", e.getMessage());
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.PHARMACY,
                    null, null,
                    prompt, null,
                    System.currentTimeMillis() - startTime,
                    "FAILED", e.getMessage());
            return "Lỗi khi tìm kiếm thông tin thuốc qua AI.";
        }
    }

    @Cacheable(value = "ai_support", key = "'interaction_' + #drugsList.hashCode()")
    public String checkInteractions(String drugsList) {
        if (chatModel == null)
            return "AI Interaction Check is unavailable.";

        long startTime = System.currentTimeMillis();
        String prompt = promptRegistry.getPharmacyInteractionCheckPrompt(drugsList);

        try {
            String response = chatModel.chat(prompt);

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.PHARMACY,
                    null, null,
                    prompt, response,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS", null);

            return response;
        } catch (Exception e) {
            log.error("AI Interaction Check error: {}", e.getMessage());
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.PHARMACY,
                    null, null,
                    prompt, null,
                    System.currentTimeMillis() - startTime,
                    "FAILED", e.getMessage());
            return "{\"severity\": \"UNKNOWN\", \"summary\": \"Không thể kiểm tra tương tác lúc này.\"}";
        }
    }
}
