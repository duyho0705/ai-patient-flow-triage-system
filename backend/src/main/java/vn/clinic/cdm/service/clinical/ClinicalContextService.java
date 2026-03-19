package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.report.CdmReportDto;
import vn.clinic.cdm.entity.clinical.ClinicalConsultation;

public interface ClinicalContextService {
    String buildStandardMedicalContext(ClinicalConsultation consultation);
    CdmReportDto getCdmReportData(ClinicalConsultation consultation, String carePlan);
}
