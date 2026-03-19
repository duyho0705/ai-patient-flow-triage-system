package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.medication.CreatePrescriptionTemplateRequest;
import vn.clinic.cdm.dto.medication.PrescriptionTemplateDto;
import vn.clinic.cdm.entity.clinical.PrescriptionTemplate;

import java.util.List;
import java.util.UUID;

public interface PrescriptionTemplateService {
    PrescriptionTemplate createTemplate(CreatePrescriptionTemplateRequest request, UUID creatorId);
    List<PrescriptionTemplateDto> getTemplates();
}
