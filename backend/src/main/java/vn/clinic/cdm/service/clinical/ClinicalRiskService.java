package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.ai.RiskPatientDto;
import vn.clinic.cdm.entity.patient.Patient;
import java.util.List;

/**
 * Service to identify risk patients.
 */
public interface ClinicalRiskService {
    List<RiskPatientDto> identifyRiskPatients(List<Patient> patients);
}
