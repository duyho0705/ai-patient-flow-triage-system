package vn.clinic.patientflow.triage.ai;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.patientflow.aiaudit.domain.AiModelVersion;
import vn.clinic.patientflow.aiaudit.domain.AiTriageAudit;
import vn.clinic.patientflow.aiaudit.repository.AiModelVersionRepository;
import vn.clinic.patientflow.aiaudit.repository.AiTriageAuditRepository;
import vn.clinic.patientflow.triage.domain.TriageSession;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;

/**
 * Điều phối gọi AI phân loại: chọn provider, đo latency, ghi audit.
 * Tuân thủ: mọi lần gọi AI đều có bản ghi ai_triage_audit + model_version.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiTriageService {

    private final RuleBasedTriageProvider ruleBasedProvider;
    private final HttpAiTriageProvider httpProvider;
    private final AiModelVersionRepository modelVersionRepository;
    private final AiTriageAuditRepository triageAuditRepository;
    private final TriageSessionRepository triageSessionRepository;
    private final ObjectMapper objectMapper;
    private final vn.clinic.patientflow.tenant.service.TenantService tenantService;

    @Value("${triage.ai.model-key:triage_acuity_v1}")
    private String modelKey;

    @Value("${triage.ai.provider:rule-based}")
    private String defaultProvider;

    /**
     * Gợi ý acuity từ lý do khám, sinh hiệu, tuổi.
     * Chọn provider dựa trên cấu hình Tenant.
     */
    public TriageSuggestionResult suggest(TriageInput input) {
        AiTriageProvider selectedProvider = "http-endpoint".equalsIgnoreCase(defaultProvider) ? httpProvider
                : ruleBasedProvider;

        try {
            // Check Tenant settings
            var tenantIdOpt = vn.clinic.patientflow.common.tenant.TenantContext.getTenantId();
            if (tenantIdOpt.isPresent()) {
                var tenant = tenantService.getById(tenantIdOpt.get());
                if (tenant.getSettingsJson() != null) {
                    var node = objectMapper.readTree(tenant.getSettingsJson());
                    if (node.has("enableAi") && node.get("enableAi").asBoolean()) {
                        String provider = node.has("aiProvider") ? node.get("aiProvider").asText() : "rule-based";
                        if ("http-endpoint".equalsIgnoreCase(provider)) {
                            selectedProvider = httpProvider;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to read tenant AI settings, falling back to rule-based: {}", e.getMessage());
        }

        long startMs = System.currentTimeMillis();
        TriageSuggestionResult result;
        try {
            result = selectedProvider.suggest(input);
            result.setProviderKey(selectedProvider.getProviderKey());
        } catch (Exception e) {
            log.error("Provider {} failed, fallback to rule-based: {}", selectedProvider.getProviderKey(),
                    e.getMessage());
            // Fallback strategy if HTTP fails
            if (selectedProvider != ruleBasedProvider) {
                result = ruleBasedProvider.suggest(input);
                result.setExplanation("(Fallback) " + result.getExplanation());
                result.setProviderKey(ruleBasedProvider.getProviderKey());
            } else {
                throw e;
            }
        }

        int latencyMs = (int) (System.currentTimeMillis() - startMs);
        result.setLatencyMs(latencyMs);
        return result;
    }

    private final vn.clinic.patientflow.aiaudit.service.AiAuditServiceV2 universalAuditService;

    /**
     * Ghi audit sau khi đã tạo triage_session (để có triage_session_id).
     */
    @Transactional
    public void recordAudit(UUID triageSessionId, TriageInput input, TriageSuggestionResult result) {
        TriageSession session = triageSessionRepository.findById(triageSessionId)
                .orElseThrow(() -> new IllegalArgumentException("TriageSession not found: " + triageSessionId));

        AiModelVersion modelVersion = getOrCreateCurrentModelVersion(modelKey);
        String inputJson = toJsonSafe(inputToMap(input));
        String outputJson = toJsonSafe(resultToMap(result));
        String suggestedAcuity = result.getSuggestedAcuity();
        String actualAcuity = session.getAcuityLevel();
        boolean matched = suggestedAcuity != null && suggestedAcuity.equalsIgnoreCase(actualAcuity);

        // 1. Domain-specific Audit (Legacy/Detailed)
        AiTriageAudit audit = AiTriageAudit.builder()
                .triageSession(session)
                .modelVersion(modelVersion)
                .inputJson(inputJson)
                .outputJson(outputJson)
                .latencyMs(result.getLatencyMs())
                .matched(matched)
                .calledAt(Instant.now())
                .build();
        triageAuditRepository.save(audit);

        // 2. Enterprise Universal Audit (New)
        universalAuditService.recordInteraction(
                vn.clinic.patientflow.aiaudit.domain.AiAuditLog.AiFeatureType.TRIAGE,
                session.getPatient().getId(),
                null,
                inputJson,
                outputJson,
                result.getLatencyMs().longValue(),
                "SUCCESS",
                null);

        log.debug("Recorded dual ai_triage_audit for session {}", triageSessionId);
    }

    public AiModelVersion getOrCreateCurrentModelVersion(String key) {
        // Simple versioning based on provider key for now
        // In real system, this should track actual model versions from MLFlow/etc.
        return modelVersionRepository.findByModelKeyAndDeprecatedAtIsNull(key)
                .orElseGet(() -> {
                    AiModelVersion v = AiModelVersion.builder()
                            .modelKey(key)
                            .version("1.0.0")
                            .configJson("{\"provider\":\"dynamic\"}")
                            .deployedAt(Instant.now())
                            .build();
                    return modelVersionRepository.save(v);
                });
    }

    private Map<String, Object> inputToMap(TriageInput input) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("chiefComplaintText", input.getChiefComplaintText());
        m.put("ageInYears", input.getAgeInYears());
        m.put("vitals", input.getVitals());
        m.put("complaintTypes", input.getComplaintTypes());
        return m;
    }

    private Map<String, Object> resultToMap(TriageSuggestionResult result) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("suggestedAcuity", result.getSuggestedAcuity());
        m.put("confidence", result.getConfidence());
        m.put("latencyMs", result.getLatencyMs());
        m.put("explanation", result.getExplanation());
        return m;
    }

    private String toJsonSafe(Object o) {
        try {
            return objectMapper.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize for audit: {}", e.getMessage());
            return "{}";
        }
    }

    /** Input cho provider: lý do khám, tuổi, vitals (type -> value). */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TriageInput {
        private String chiefComplaintText;
        private Integer ageInYears;
        @lombok.Singular
        private Map<String, java.math.BigDecimal> vitals;
        @lombok.Singular
        private List<String> complaintTypes;
    }

    /** Kết quả gợi ý + metadata cho audit. */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TriageSuggestionResult {
        private String suggestedAcuity;
        private java.math.BigDecimal confidence;
        private Integer latencyMs;
        private String explanation; // Giải thích ngắn gọn lý do AI đề xuất
        private String providerKey;
    }
}
