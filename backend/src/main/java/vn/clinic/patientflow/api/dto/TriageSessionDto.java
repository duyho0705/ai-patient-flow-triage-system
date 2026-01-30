package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.patientflow.triage.domain.TriageSession;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageSessionDto {

    private UUID id;
    private UUID tenantId;
    private UUID branchId;
    private UUID patientId;
    private UUID appointmentId;
    private UUID triagedByUserId;
    private Instant startedAt;
    private Instant endedAt;
    private String acuityLevel;
    private String acuitySource;
    private String aiSuggestedAcuity;
    private BigDecimal aiConfidenceScore;
    private String chiefComplaintText;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public static TriageSessionDto fromEntity(TriageSession e) {
        if (e == null) return null;
        return TriageSessionDto.builder()
                .id(e.getId())
                .tenantId(e.getTenant() != null ? e.getTenant().getId() : null)
                .branchId(e.getBranch() != null ? e.getBranch().getId() : null)
                .patientId(e.getPatient() != null ? e.getPatient().getId() : null)
                .appointmentId(e.getAppointment() != null ? e.getAppointment().getId() : null)
                .triagedByUserId(e.getTriagedByUser() != null ? e.getTriagedByUser().getId() : null)
                .startedAt(e.getStartedAt())
                .endedAt(e.getEndedAt())
                .acuityLevel(e.getAcuityLevel())
                .acuitySource(e.getAcuitySource())
                .aiSuggestedAcuity(e.getAiSuggestedAcuity())
                .aiConfidenceScore(e.getAiConfidenceScore())
                .chiefComplaintText(e.getChiefComplaintText())
                .notes(e.getNotes())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
