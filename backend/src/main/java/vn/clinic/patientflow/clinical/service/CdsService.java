package vn.clinic.patientflow.clinical.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.api.dto.CdsAdviceDto;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.aiaudit.service.AiAuditServiceV2;
import vn.clinic.patientflow.aiaudit.domain.AiAuditLog;

@Service
@RequiredArgsConstructor
@Slf4j
public class CdsService {

    private final ClinicalContextService contextService;
    private final PromptRegistry promptRegistry;
    private final AiAuditServiceV2 aiAuditService;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private ChatLanguageModel chatModel;

    @org.springframework.cache.annotation.Cacheable(value = "cds_advice", key = "#consultation.id")
    public CdsAdviceDto getCdsAdvice(ClinicalConsultation consultation) {
        if (chatModel == null) {
            return fallbackAdvice("AI Model not configured");
        }

        long startTime = System.currentTimeMillis();
        String context = contextService.buildStandardMedicalContext(consultation);
        String prompt = promptRegistry.getCdsAdvicePrompt(context);

        try {
            log.info("Requesting Enterprise CDS for patient: {}", consultation.getPatient().getId());
            String response = chatModel.chat(prompt);
            long latency = System.currentTimeMillis() - startTime;

            CdsAdviceDto dto = parseJson(response);

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CDS,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    response,
                    latency,
                    "SUCCESS",
                    null);

            return dto;

        } catch (Exception e) {
            long latency = System.currentTimeMillis() - startTime;
            log.error("CDS Service Error: {}", e.getMessage());

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.CDS,
                    consultation.getPatient().getId(),
                    null,
                    prompt,
                    null,
                    latency,
                    "FAILED",
                    e.getMessage());

            return fallbackAdvice("Error: " + e.getMessage());
        }
    }

    private CdsAdviceDto parseJson(String aiResponse) {
        try {
            String jsonPart = aiResponse;
            if (aiResponse.contains("{")) {
                jsonPart = aiResponse.substring(aiResponse.indexOf("{"), aiResponse.lastIndexOf("}") + 1);
            }
            return objectMapper.readValue(jsonPart, CdsAdviceDto.class);
        } catch (Exception e) {
            log.error("Failed to parse CDS JSON: {}", e.getMessage());
            throw new RuntimeException("Invalid AI Response format", e);
        }
    }

    private CdsAdviceDto fallbackAdvice(String reason) {
        return CdsAdviceDto.builder()
                .riskLevel("UNKNOWN")
                .summary("Dịch vụ hỗ trợ quyết định lâm sàng đang gặp sự cố.")
                .aiReasoning(reason)
                .build();
    }
}
