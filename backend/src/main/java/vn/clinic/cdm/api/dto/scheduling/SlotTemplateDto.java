package vn.clinic.cdm.api.dto.scheduling;

import java.time.LocalTime;
import java.util.UUID;

public record SlotTemplateDto(
        UUID id,
        String code,
        LocalTime startTime,
        Integer durationMinutes) {
}

