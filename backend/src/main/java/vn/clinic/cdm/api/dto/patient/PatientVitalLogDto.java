package vn.clinic.cdm.api.dto.patient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientVitalLogDto {
    private UUID id;
    private String vitalType;
    private BigDecimal valueNumeric;
    private String unit;
    private Instant recordedAt;
    private String imageUrl;
    private String notes;
}

