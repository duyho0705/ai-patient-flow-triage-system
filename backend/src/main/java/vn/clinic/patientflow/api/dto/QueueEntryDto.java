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
    private String patientName;
    private UUID triageSessionId;
    private UUID appointmentId;
    private UUID medicalServiceId;
    private String medicalServiceName;
    private String notes;
    private Integer position;
    private Integer peopleAhead;
    private Integer estimatedWaitMinutes;
    private String status;
    private String queueName;
    /** Mức ưu tiên từ phiên phân loại (nếu có). Dùng để hiển thị và sort. */
    private String acuityLevel;
    private Instant joinedAt;
    private Instant calledAt;
    private Instant completedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public static QueueEntryDto fromEntity(QueueEntry e) {
        if (e == null)
            return null;
        return QueueEntryDto.builder()
                .id(e.getId())
                .tenantId(e.getTenant() != null ? e.getTenant().getId() : null)
                .branchId(e.getBranch() != null ? e.getBranch().getId() : null)
                .queueDefinitionId(e.getQueueDefinition() != null ? e.getQueueDefinition().getId() : null)
                .patientId(e.getPatient() != null ? e.getPatient().getId() : null)
                .patientName(e.getPatient() != null ? e.getPatient().getFullNameVi() : null)
                .triageSessionId(e.getTriageSession() != null ? e.getTriageSession().getId() : null)
                .appointmentId(e.getAppointment() != null ? e.getAppointment().getId() : null)
                .medicalServiceId(e.getMedicalService() != null ? e.getMedicalService().getId() : null)
                .medicalServiceName(e.getMedicalService() != null ? e.getMedicalService().getNameVi() : null)
                .notes(e.getNotes())
                .position(e.getPosition())
                .status(e.getStatus())
                .queueName(e.getQueueDefinition() != null ? e.getQueueDefinition().getNameVi() : null)
                .acuityLevel(e.getTriageSession() != null ? e.getTriageSession().getAcuityLevel() : null)
                .joinedAt(e.getJoinedAt())
                .calledAt(e.getCalledAt())
                .completedAt(e.getCompletedAt())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
