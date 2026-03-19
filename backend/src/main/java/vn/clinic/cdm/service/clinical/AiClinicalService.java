package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.ai.*;
import vn.clinic.cdm.dto.medication.PrescriptionVerificationDto;
import vn.clinic.cdm.dto.medication.PrescriptionItemDto;
import vn.clinic.cdm.dto.clinical.Icd10CodeDto;
import vn.clinic.cdm.dto.clinical.ClinicalChecklistDto;
import vn.clinic.cdm.dto.clinical.StandardizedClinicalNoteDto;
import vn.clinic.cdm.entity.clinical.ClinicalConsultation;
import vn.clinic.cdm.entity.patient.Patient;

import java.util.List;

public interface AiClinicalService {
    String getClinicalSupport(ClinicalConsultation consultation);
    String generateLongTermCarePlan(ClinicalConsultation consultation);
    PrescriptionVerificationDto verifyPrescription(ClinicalConsultation consultation, List<PrescriptionItemDto> items);
    Icd10CodeDto suggestIcd10Code(String diagnosis);
    String interpretLabResults(ClinicalConsultation consultation);
    DifferentialDiagnosisDto getDifferentialDiagnosis(ClinicalConsultation consultation);
    ClinicalChecklistDto getSuggestedChecklist(ClinicalConsultation consultation);
    String getClinicalChatResponse(ClinicalConsultation consultation, String userMessage, List<AiChatRequest.ChatMessage> history);
    FollowUpSuggestionDto suggestFollowUp(ClinicalConsultation consultation);
    ComplicationRiskDto predictComplicationRisk(ClinicalConsultation consultation);
    
    // Additional methods from DoctorAiSupportController
    String suggestTemplates(ClinicalConsultation consultation, List<?> templates);
    String generateDischargeInstructions(ClinicalConsultation consultation);
    TreatmentEfficacyDto analyzeTreatmentEfficacy(ClinicalConsultation consultation);
    StandardizedClinicalNoteDto standardizeClinicalNote(ClinicalConsultation consultation);

    // Support for Patient History Summary
    String generatePatientHistorySummary(Patient patient);
}
