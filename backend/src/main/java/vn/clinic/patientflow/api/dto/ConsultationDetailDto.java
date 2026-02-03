package vn.clinic.patientflow.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ConsultationDetailDto {
    private ConsultationDto consultation;
    private PrescriptionDto prescription;
    private InvoiceDto invoice;
    private List<TriageVitalDto> vitals;
}
