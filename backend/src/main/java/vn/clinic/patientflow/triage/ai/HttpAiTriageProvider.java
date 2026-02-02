package vn.clinic.patientflow.triage.ai;

import java.math.BigDecimal;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.patientflow.triage.ai.AiTriageService.TriageInput;
import vn.clinic.patientflow.triage.ai.AiTriageService.TriageSuggestionResult;

/**
 * Gọi AI qua HTTP (Python/FastAPI Service).
 * Endpoint: POST /predict (hoặc /triage/suggest)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HttpAiTriageProvider implements AiTriageProvider {

    private final RestTemplate restTemplate;

    @Value("${triage.ai.service-url:http://localhost:5000/predict}")
    private String serviceUrl;

    @Override
    public TriageSuggestionResult suggest(TriageInput input) {
        log.debug("Calling External AI at {}", serviceUrl);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<TriageInput> request = new HttpEntity<>(input, headers);

            // DTO trả về từ Python service
            // Giả sử Python trả về: { "acuity": "2", "confidence": 0.95, "explanation":
            // "..." }
            ResponseEntity<ExternalAiResponse> response = restTemplate.postForEntity(
                    serviceUrl,
                    request,
                    ExternalAiResponse.class);

            if (response.getBody() == null) {
                throw new RuntimeException("Empty response from AI Service");
            }

            ExternalAiResponse body = response.getBody();
            return TriageSuggestionResult.builder()
                    .suggestedAcuity(body.acuity)
                    .confidence(body.confidence)
                    .explanation(body.explanation)
                    .build();

        } catch (Exception e) {
            log.error("Failed to call External AI: {}", e.getMessage());
            throw new RuntimeException("External AI Service unavailable: " + e.getMessage());
        }
    }

    @Override
    public String getProviderKey() {
        return "http-python";
    }

    // DTO nội bộ map response của Python
    @lombok.Data
    static class ExternalAiResponse {
        private String acuity;
        private BigDecimal confidence;
        private String explanation;
    }
}
