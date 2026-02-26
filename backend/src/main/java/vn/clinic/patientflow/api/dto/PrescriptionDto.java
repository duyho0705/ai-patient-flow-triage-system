package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDto {
    private UUID id;
    private UUID consultationId;
    private UUID patientId;
    private String patientName;
    private UUID doctorUserId;
    private String doctorName;
    private String status;
    private String notes;
    private List<PrescriptionItemDto> items;
}
