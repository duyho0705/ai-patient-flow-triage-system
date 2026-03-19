package vn.clinic.cdm.dto.medication;

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

    public static PrescriptionDto fromEntity(vn.clinic.cdm.entity.clinical.Prescription p) {
        if (p == null) return null;
        return PrescriptionDto.builder()
                .id(p.getId())
                .consultationId(p.getConsultation() != null ? p.getConsultation().getId() : null)
                .patientId(p.getPatient() != null ? p.getPatient().getId() : null)
                .patientName(p.getPatient() != null ? p.getPatient().getFullNameVi() : null)
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .notes(p.getNotes())
                .build();
    }
}

