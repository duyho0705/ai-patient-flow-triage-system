package vn.clinic.patientflow.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TriageVitalDto(
        UUID id,
        String vitalType,
        BigDecimal valueNumeric,
        String unit,
        Instant recordedAt) {
}
