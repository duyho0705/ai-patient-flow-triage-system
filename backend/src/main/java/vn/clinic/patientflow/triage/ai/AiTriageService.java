package vn.clinic.patientflow.triage.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.aiaudit.domain.AiModelVersion;
import vn.clinic.patientflow.aiaudit.domain.AiTriageAudit;
import vn.clinic.patientflow.aiaudit.repository.AiModelVersionRepository;
import vn.clinic.patientflow.aiaudit.repository.AiTriageAuditRepository;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.patient.service.PatientService;
import vn.clinic.patientflow.triage.domain.TriageSession;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Điều phối gọi AI phân loại: chọn provider, đo latency, ghi audit.
 * Tuân thủ: mọi lần gọi AI đều có bản ghi ai_triage_audit + model_version.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiTriageService {

    private final AiTriageProvider aiTriageProvider;
    private final AiModelVersionRepository modelVersionRepository;
    private final AiTriageAuditRepository triageAuditRepository;
    private final TriageSessionRepository triageSessionRepository;
    private final ObjectMapper objectMapper;

    @Value("${triage.ai.model-key:triage_acuity_v1}")
    private String modelKey;

    /**
     * Gợi ý acuity từ lý do khám, sinh hiệu, tuổi. Đo latency; không ghi audit (chưa có session).
     * Ghi audit khi gọi từ TriageService.createSession sau khi session được tạo.
     */
    public TriageSuggestionResult suggest(TriageInput input) {
        long startMs = System.currentTimeMillis();
        TriageSuggestionResult result = aiTriageProvider.suggest(input);
        int latencyMs = (int) (System.currentTimeMillis() - startMs);
        result.setLatencyMs(latencyMs);
        return result;
    }

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
        AiTriageAudit audit = AiTriageAudit.builder()
                .triageSession(session)
                .modelVersion(modelVersion)
                .inputJson(inputJson)
                .outputJson(outputJson)
                .latencyMs(result.getLatencyMs())
                .calledAt(Instant.now())
                .build();
        triageAuditRepository.save(audit);
        log.debug("Recorded ai_triage_audit for session {}", triageSessionId);
    }

    public AiModelVersion getOrCreateCurrentModelVersion(String key) {
        return modelVersionRepository.findByModelKeyAndDeprecatedAtIsNull(key)
                .orElseGet(() -> {
                    AiModelVersion v = AiModelVersion.builder()
                            .modelKey(key)
                            .version("1.0.0")
                            .configJson("{\"provider\":\"" + aiTriageProvider.getProviderKey() + "\"}")
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
    }
}
