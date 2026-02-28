package vn.clinic.cdm.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.clinic.cdm.api.dto.common.ApiResponse;

import java.util.Map;

/**
 * Simple health for API (detailed health via Actuator /actuator/health).
 */
@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Health", description = "Kiá»ƒm tra API")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "API liveness")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("status", "UP", "service", "cdm-platform-triage")));
    }
}


