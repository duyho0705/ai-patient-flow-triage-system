package vn.clinic.cdm.common.ai;

import dev.langchain4j.model.chat.ChatLanguageModel;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import vn.clinic.cdm.entity.aiaudit.AiAuditLog;
import vn.clinic.cdm.dto.ai.AiAuditRequest;
import vn.clinic.cdm.service.aiaudit.AiAuditService;
import vn.clinic.cdm.common.util.JsonUtils;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Enterprise AI Execution Engine.
 * Encapsulates the standard AI interaction lifecycle:
 * Rate Limiting -> Execution -> Auditing -> Parsing -> Error Handling.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AiExecutionEngine {

    private final ChatLanguageModel chatModel;
    private final AiAuditService aiAuditService;

    /**
     * Executes a chat model request with full auditing and error handling.
     */
    public <T> T execute(AiAuditLog.AiFeatureType feature, UUID patientId, String prompt, Class<T> responseType, Supplier<T> fallback) {
        if (chatModel == null) return fallback.get();

        long startTime = System.currentTimeMillis();
        try {
            log.info("Executing AI Feature [{}]: patientId={}", feature, patientId);
            String rawResponse = chatModel.chat(prompt);
            
            T result = parseResponse(rawResponse, responseType);

            recordAudit(feature, patientId, prompt, rawResponse, startTime, "SUCCESS", null);
            return result;
        } catch (Exception e) {
            log.error("AI Feature [{}] failed: {}", feature, e.getMessage());
            recordAudit(feature, patientId, prompt, null, startTime, "FAILED", e.getMessage());
            return fallback.get();
        }
    }

    /**
     * Simple string response execution.
     */
    public String executeText(AiAuditLog.AiFeatureType feature, UUID patientId, String prompt, String fallbackValue) {
        if (chatModel == null) return fallbackValue;

        long startTime = System.currentTimeMillis();
        try {
            String res = chatModel.chat(prompt);
            recordAudit(feature, patientId, prompt, res, startTime, "SUCCESS", null);
            return res;
        } catch (Exception e) {
            log.error("AI Text Feature [{}] failed: {}", feature, e.getMessage());
            recordAudit(feature, patientId, prompt, null, startTime, "FAILED", e.getMessage());
            return fallbackValue;
        }
    }

    private <T> T parseResponse(String raw, Class<T> type) throws Exception {
        if (type == String.class) return type.cast(raw);
        return JsonUtils.fromJson(JsonUtils.extractJson(raw), type);
    }

    private void recordAudit(AiAuditLog.AiFeatureType feature, UUID patientId, String prompt, String response, long startTime, String status, String error) {
        aiAuditService.recordInteraction(new AiAuditRequest(
                feature, 
                patientId, 
                null, 
                prompt, 
                response, 
                System.currentTimeMillis() - startTime, 
                status, 
                error
        ));
    }
}
