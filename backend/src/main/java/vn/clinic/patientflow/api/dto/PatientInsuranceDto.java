package vn.clinic.patientflow.api.dto;

import java.time.LocalDate;
import java.util.UUID;

public record PatientInsuranceDto(
        UUID id,
        String insuranceType,
        String insuranceNumber,
        String holderName,
        LocalDate validFrom,
        LocalDate validTo,
        Boolean isPrimary) {
}
