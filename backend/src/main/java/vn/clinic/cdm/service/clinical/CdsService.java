package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.ai.CdsAdviceDto;
import vn.clinic.cdm.entity.clinical.ClinicalConsultation;

public interface CdsService {
    CdsAdviceDto getCdsAdvice(ClinicalConsultation consultation);
}
