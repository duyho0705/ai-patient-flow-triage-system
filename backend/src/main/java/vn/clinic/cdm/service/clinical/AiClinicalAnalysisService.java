package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.entity.clinical.HealthMetric;
import vn.clinic.cdm.entity.patient.Patient;
import java.util.List;

public interface AiClinicalAnalysisService {
    String analyzePatientHealth(Patient patient, List<HealthMetric> metrics);
}