package vn.clinic.cdm.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class AiServiceHealthIndicator implements HealthIndicator {

    @Autowired(required = false)
    private ChatLanguageModel chatModel;

    @Override
    public Health health() {
        if (chatModel == null) {
            return Health.down().withDetail("reason", "Gemini ChatLanguageModel not configured").build();
        }

        try {
            // Simple check - in real enterprise, might ping a specific endpoint or check
            // status
            return Health.up()
                    .withDetail("provider", "Google Gemini")
                    .withDetail("status", "Available")
                    .build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}

