package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Simple health for API (detailed health via Actuator /actuator/health).
 */
@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Health", description = "Kiểm tra API")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "API liveness")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "patient-flow-triage");
    }
}
