package vn.clinic.patientflow.api.dto;

import java.util.UUID;

public record TriageComplaintDto(
        UUID id,
        String complaintType,
        String complaintText,
        Integer displayOrder) {
}
