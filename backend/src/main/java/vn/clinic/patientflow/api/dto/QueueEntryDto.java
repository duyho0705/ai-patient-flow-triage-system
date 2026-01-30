package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.patientflow.queue.domain.QueueEntry;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueEntryDto {

    private UUID id;
    private UUID tenantId;
    private UUID branchId;
    private UUID queueDefinitionId;
    private UUID patientId;
    private UUID triageSessionId;
    private UUID appointmentId;
    private Integer position;
    private String status;
    private Instant joinedAt;
    private Instant calledAt;
    private Instant completedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public static QueueEntryDto fromEntity(QueueEntry e) {
        if (e == null) return null;
        return QueueEntryDto.builder()
                .id(e.getId())
                .tenantId(e.getTenant() != null ? e.getTenant().getId() : null)
                .branchId(e.getBranch() != null ? e.getBranch().getId() : null)
                .queueDefinitionId(e.getQueueDefinition() != null ? e.getQueueDefinition().getId() : null)
                .patientId(e.getPatient() != null ? e.getPatient().getId() : null)
                .triageSessionId(e.getTriageSession() != null ? e.getTriageSession().getId() : null)
                .appointmentId(e.getAppointment() != null ? e.getAppointment().getId() : null)
                .position(e.getPosition())
                .status(e.getStatus())
                .joinedAt(e.getJoinedAt())
                .calledAt(e.getCalledAt())
                .completedAt(e.getCompletedAt())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
