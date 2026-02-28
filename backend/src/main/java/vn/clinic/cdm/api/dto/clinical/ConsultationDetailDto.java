package vn.clinic.cdm.api.dto.clinical;

import lombok.Builder;
import lombok.Data;
import vn.clinic.cdm.api.dto.medication.PrescriptionDto;
import java.util.List;

@Data
@Builder
public class ConsultationDetailDto {
    private ConsultationDto consultation;
    private PrescriptionDto prescription;
    private List<LabResultDto> labResults;
    private List<DiagnosticImageDto> diagnosticImages;
}

