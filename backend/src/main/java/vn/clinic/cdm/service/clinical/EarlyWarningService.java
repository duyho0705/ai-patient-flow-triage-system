package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.ai.ClinicalEarlyWarningDto;
import vn.clinic.cdm.entity.clinical.ClinicalConsultation;

public interface EarlyWarningService {
    ClinicalEarlyWarningDto calculateEarlyWarning(ClinicalConsultation consultation);
}
