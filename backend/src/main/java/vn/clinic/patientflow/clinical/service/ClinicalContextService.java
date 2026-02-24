package vn.clinic.patientflow.clinical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.clinical.repository.ClinicalVitalRepository;
import vn.clinic.patientflow.clinical.repository.LabResultRepository;
import vn.clinic.patientflow.triage.repository.TriageVitalRepository;

import java.time.LocalDate;
import java.time.Period;

/**
 * Enterprise Clinical Context Service.
 * Standardizes how patient data is prepared for AI models to ensure
 * high-quality and consistent reasoning.
 * 
 * Context quality directly impacts AI output quality.
 * This service is the SINGLE SOURCE OF TRUTH for AI context construction.
 */
@Service
@RequiredArgsConstructor
public class ClinicalContextService {

    private final TriageVitalRepository vitalsRepository;
    private final LabResultRepository labResultRepository;
    private final ClinicalVitalRepository clinicalVitalRepository;
    private final vn.clinic.patientflow.clinical.repository.PrescriptionRepository prescriptionRepository;
    private final vn.clinic.patientflow.patient.repository.PatientChronicConditionRepository chronicConditionRepository;
    private final vn.clinic.patientflow.patient.repository.PatientVitalTargetRepository vitalTargetRepository;
    private final vn.clinic.patientflow.patient.repository.MedicationReminderRepository medicationReminderRepository;

    /**
     * Builds a comprehensive, structured medical context for AI consumption.
     * Sections are ordered by clinical priority (demographics → encounter → vitals
     * → labs → meds → guardrails).
     */
    public String buildStandardMedicalContext(ClinicalConsultation consultation) {
        StringBuilder sb = new StringBuilder(2048); // Pre-allocate for typical context size

        appendPatientProfile(sb, consultation);
        appendCurrentEncounter(sb, consultation);
        appendTriageVitals(sb, consultation);
        appendClinicalVitals(sb, consultation);
        appendLabResults(sb, consultation);
        appendChronicDiseaseContext(sb, consultation);
        appendCurrentMedications(sb, consultation);
        appendMedicationAdherence(sb, consultation);
        appendClinicalGuardrails(sb);

        return sb.toString();
    }

    private void appendPatientProfile(StringBuilder sb, ClinicalConsultation consultation) {
        var patient = consultation.getPatient();
        sb.append("### PATIENT PROFILE\n");
        sb.append("- Name: ").append(patient.getFullNameVi()).append("\n");

        if (patient.getDateOfBirth() != null) {
            int age = Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();
            sb.append("- Age: ").append(age).append(" years\n");
            sb.append("- DOB: ").append(patient.getDateOfBirth()).append("\n");
        }

        sb.append("- Gender: ").append(patient.getGender() != null ? patient.getGender() : "Unknown").append("\n");

        // Allergies – Critical for drug interaction and CDS
        if (patient.getAllergies() != null && !patient.getAllergies().isBlank()) {
            sb.append("- ⚠️ ALLERGIES: ").append(patient.getAllergies()).append("\n");
        } else {
            sb.append("- Allergies: NKDA (No Known Drug Allergies)\n");
        }

        // Chronic conditions – Important for risk stratification
        if (patient.getChronicConditions() != null && !patient.getChronicConditions().isBlank()) {
            sb.append("- Chronic Conditions: ").append(patient.getChronicConditions()).append("\n");
        }

        sb.append("- Branch: ").append(consultation.getBranch().getNameVi()).append("\n\n");
    }

    private void appendCurrentEncounter(StringBuilder sb, ClinicalConsultation consultation) {
        sb.append("### CURRENT ENCOUNTER\n");
        sb.append("- Chief Complaint: ").append(safeStr(consultation.getChiefComplaintSummary())).append("\n");
        sb.append("- Diagnosis (Draft): ").append(safeStr(consultation.getDiagnosisNotes())).append("\n");
        sb.append("- Status: ").append(consultation.getStatus()).append("\n");

        if (consultation.getAiInsights() != null && !consultation.getAiInsights().isBlank()) {
            sb.append("- Previous AI Insights: ").append(truncate(consultation.getAiInsights(), 300)).append("\n");
        }
        sb.append("\n");
    }

    private void appendTriageVitals(StringBuilder sb, ClinicalConsultation consultation) {
        sb.append("### TRIAGE VITALS (Pre-Encounter)\n");
        var triageVitals = vitalsRepository.findByPatientId(consultation.getPatient().getId());
        if (triageVitals.isEmpty()) {
            sb.append("- No triage vitals recorded.\n");
        } else {
            triageVitals.stream().limit(5).forEach(v -> sb.append(String.format("- %s: %.1f %s (%s)\n",
                    v.getVitalType(),
                    v.getValueNumeric(),
                    safeStr(v.getUnit()),
                    v.getCreatedAt())));
        }
        sb.append("\n");
    }

    private void appendClinicalVitals(StringBuilder sb, ClinicalConsultation consultation) {
        sb.append("### CLINICAL VITALS (In-Encounter)\n");
        var clinicalVitals = clinicalVitalRepository
                .findByConsultationIdOrderByRecordedAtAsc(consultation.getId());
        if (clinicalVitals.isEmpty()) {
            sb.append("- No clinical vitals recorded in this encounter.\n");
        } else {
            clinicalVitals.forEach(v -> sb.append(String.format("- %s: %s %s (%s)\n",
                    v.getVitalType(),
                    v.getValueNumeric(),
                    safeStr(v.getUnit()),
                    v.getRecordedAt())));
        }
        sb.append("\n");
    }

    private void appendLabResults(StringBuilder sb, ClinicalConsultation consultation) {
        sb.append("### RELEVANT LABS\n");
        var labs = labResultRepository.findByConsultation(consultation);
        if (labs.isEmpty()) {
            sb.append("- No labs in this encounter.\n");
        } else {
            labs.forEach(l -> sb.append(String.format("- %s: %s %s [%s]\n",
                    l.getTestName(),
                    l.getValue(),
                    safeStr(l.getUnit()),
                    l.getStatus())));
        }
        sb.append("\n");
    }

    private void appendChronicDiseaseContext(StringBuilder sb, ClinicalConsultation consultation) {
        var patientId = consultation.getPatient().getId();
        var chronicConditions = chronicConditionRepository.findByPatientId(patientId);
        var vitalTargets = vitalTargetRepository.findByPatientId(patientId);

        sb.append("### STRUCTURED CHRONIC DISEASE DATA\n");
        if (chronicConditions.isEmpty()) {
            sb.append("- No structured chronic conditions found.\n");
        } else {
            chronicConditions.forEach(c -> sb.append(String.format("- %s (ICD10: %s, Severity: %s, Status: %s)\n",
                    c.getConditionName(), c.getIcd10Code(), c.getSeverityLevel(), c.getStatus())));
        }

        sb.append("\n### PERSONALIZED VITAL TARGETS\n");
        if (vitalTargets.isEmpty()) {
            sb.append("- No personalized targets. Use standard clinical ranges.\n");
        } else {
            vitalTargets.forEach(t -> sb.append(String.format("- Target %s: %s - %s %s (Note: %s)\n",
                    t.getVitalType(), t.getMinValue(), t.getMaxValue(), t.getUnit(), safeStr(t.getNotes()))));
        }
        sb.append("\n");
    }

    private void appendMedicationAdherence(StringBuilder sb, ClinicalConsultation consultation) {
        sb.append("### PATIENT MEDICATION ADHERENCE\n");
        var reminders = medicationReminderRepository.findByPatientId(consultation.getPatient().getId());
        if (reminders.isEmpty()) {
            sb.append("- No medication track records for this patient.\n");
        } else {
            reminders.forEach(r -> sb.append(String.format("- %s: Adherence Score: %s%% (Last taken: %s)\n",
                    r.getMedicineName(),
                    r.getAdherenceScore() != null ? r.getAdherenceScore() : "0",
                    r.getLastTakenAt() != null ? r.getLastTakenAt() : "Never")));
        }
        sb.append("\n");
    }

    private void appendCurrentMedications(StringBuilder sb, ClinicalConsultation consultation) {
        sb.append("### CURRENT MEDICATIONS\n");
        var prescription = prescriptionRepository.findByConsultationId(consultation.getId());
        if (prescription.isEmpty()) {
            sb.append("- No active prescriptions for this encounter.\n");
        } else {
            prescription.ifPresent(p -> p.getItems().forEach(item -> {
                String med = item.getProduct() != null
                        ? item.getProduct().getNameVi()
                        : item.getProductNameCustom();
                sb.append(String.format("- %s (Qty: %s) - %s\n",
                        med, item.getQuantity(), safeStr(item.getDosageInstruction())));
            }));
        }
        sb.append("\n");
    }

    private void appendClinicalGuardrails(StringBuilder sb) {
        sb.append("### CLINICAL GUARDRAILS\n");
        sb.append("- Local Guidelines: MOH Vietnam (Bộ Y Tế)\n");
        sb.append("- Safety Level: HIGH\n");
        sb.append("- IMPORTANT: Always recommend physician review for critical findings.\n");
        sb.append("- IMPORTANT: Drug dosages must be verified by a licensed pharmacist.\n");
    }

    public vn.clinic.patientflow.api.dto.CdmReportDto getCdmReportData(ClinicalConsultation consultation,
            String carePlan) {
        var patient = consultation.getPatient();
        var patientId = patient.getId();

        var conditions = chronicConditionRepository.findByPatientId(patientId).stream()
                .map(c -> vn.clinic.patientflow.api.dto.CdmReportDto.ConditionInfo.builder()
                        .name(c.getConditionName())
                        .icd10(c.getIcd10Code())
                        .severity(c.getSeverityLevel())
                        .diagnosedAt(c.getDiagnosedAt() != null ? c.getDiagnosedAt().toString() : "N/A")
                        .build())
                .toList();

        var targets = vitalTargetRepository.findByPatientId(patientId).stream()
                .map(t -> vn.clinic.patientflow.api.dto.CdmReportDto.TargetInfo.builder()
                        .type(t.getVitalType())
                        .range(t.getMinValue() + " - " + t.getMaxValue())
                        .unit(t.getUnit())
                        .build())
                .toList();

        var adherence = medicationReminderRepository.findByPatientId(patientId).stream()
                .map(r -> vn.clinic.patientflow.api.dto.CdmReportDto.AdherenceInfo.builder()
                        .medicine(r.getMedicineName())
                        .score(r.getAdherenceScore() != null ? r.getAdherenceScore() : java.math.BigDecimal.ZERO)
                        .lastTaken(r.getLastTakenAt() != null ? r.getLastTakenAt().toString() : "Chưa uống")
                        .build())
                .toList();

        return vn.clinic.patientflow.api.dto.CdmReportDto.builder()
                .patientName(patient.getFullNameVi())
                .patientDob(patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : "N/A")
                .patientGender(patient.getGender() != null ? patient.getGender() : "N/A")
                .doctorName(consultation.getDoctorUser() != null ? consultation.getDoctorUser().getFullNameVi() : "N/A")
                .reportDate(LocalDate.now().toString())
                .conditions(conditions)
                .targets(targets)
                .adherence(adherence)
                .aiCarePlan(carePlan)
                .build();
    }

    // ── Utility Methods ──────────────────────────────────────────────────

    private String safeStr(String value) {
        return value != null ? value : "N/A";
    }

    private String truncate(String text, int maxLen) {
        if (text == null)
            return "N/A";
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "...";
    }
}
