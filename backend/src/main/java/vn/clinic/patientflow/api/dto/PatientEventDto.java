package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientEventDto {
    public enum EventType {
        NOTIFICATION, // Persistent notification (already handled by DB + WS)
        QUEUE_REFRESH, // Signal to refresh queue status UI
        APPOINTMENT_REFRESH, // Signal to refresh appointment list
        EMERGENCY_ALERT // Direct alert to the user
    }

    private EventType type;
    private String title;
    private String body;
    private Map<String, Object> metadata;
}
