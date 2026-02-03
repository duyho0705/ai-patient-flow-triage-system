package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.clinic.patientflow.queue.domain.QueueDefinition;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueDefinitionDto {

    private UUID id;
    private UUID branchId;
    private String code;
    private String nameVi;
    private String acuityFilter;
    private String roomOrStation;
    private Integer displayOrder;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public static QueueDefinitionDto fromEntity(QueueDefinition e) {
        if (e == null)
            return null;
        return QueueDefinitionDto.builder()
                .id(e.getId())
                .branchId(e.getBranch() != null ? e.getBranch().getId() : null)
                .code(e.getCode())
                .nameVi(e.getNameVi())
                .acuityFilter(e.getAcuityFilter())
                .roomOrStation(e.getRoomOrStation())
                .displayOrder(e.getDisplayOrder())
                .isActive(e.getIsActive())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
