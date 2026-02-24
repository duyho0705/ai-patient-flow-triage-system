package vn.clinic.patientflow.clinical.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.clinical.domain.DiagnosticImage;
import vn.clinic.patientflow.clinical.domain.LabResult;
import vn.clinic.patientflow.clinical.repository.DiagnosticImageRepository;
import vn.clinic.patientflow.clinical.repository.LabResultRepository;
import vn.clinic.patientflow.clinical.domain.ClinicalVital;
import vn.clinic.patientflow.clinical.repository.ClinicalVitalRepository;
import vn.clinic.patientflow.triage.domain.TriageVital;
import vn.clinic.patientflow.triage.repository.TriageVitalRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Random;

/**
 * Enterprise Medical Data Simulator.
 * Used for R&D, demonstration, and automated testing environments.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClinicalSimulationService {

    private final LabResultRepository labResultRepository;
    private final DiagnosticImageRepository diagnosticImageRepository;
    private final TriageVitalRepository triageVitalRepository;
    private final ClinicalVitalRepository clinicalVitalRepository;
    private final Random rand = new Random();

    @Transactional
    public void generateSimulatedData(ClinicalConsultation cons) {
        log.debug("Simulating medical data for consultation: {}", cons.getId());

        simulateLabs(cons);
        simulateImaging(cons);
        simulateVitals(cons);
    }

    private void simulateLabs(ClinicalConsultation cons) {
        if (labResultRepository.findByConsultation(cons).isEmpty()) {
            labResultRepository.save(LabResult.builder()
                    .consultation(cons)
                    .testName("Tổng phân tích tế bào máu / CBC")
                    .value(String.format("%.1f", 4.0 + rand.nextDouble() * 2))
                    .unit("T/L")
                    .referenceRange("3.8 - 5.8")
                    .status("NORMAL")
                    .build());

            labResultRepository.save(LabResult.builder()
                    .consultation(cons)
                    .testName("Chỉ số Glucose (Lúc đói)")
                    .value(String.format("%.1f", 3.0 + rand.nextDouble() * 5))
                    .unit("mmol/L")
                    .referenceRange("3.9 - 6.4")
                    .status(rand.nextBoolean() ? "NORMAL" : "HIGH")
                    .build());
        }
    }

    private void simulateImaging(ClinicalConsultation cons) {
        if (diagnosticImageRepository.findByConsultation(cons).isEmpty()) {
            String[] placeholders = {
                    "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000",
                    "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000"
            };

            diagnosticImageRepository.save(DiagnosticImage.builder()
                    .consultation(cons)
                    .title("X-Quang Ngực Thẳng (PA View)")
                    .imageUrl(placeholders[rand.nextInt(placeholders.length)])
                    .description(
                            "Lồng ngực cân đối, không sẹo mổ cũ. Phổi sáng, không ran. Kết luận: Tim phổi bình thường.")
                    .build());
        }
    }

    private void simulateVitals(ClinicalConsultation cons) {
        // Seed Triage Vitals if session exists and is empty
        if (cons.getQueueEntry() != null && cons.getQueueEntry().getTriageSession() != null) {
            var session = cons.getQueueEntry().getTriageSession();
            if (triageVitalRepository.findByTriageSessionIdOrderByRecordedAtAsc(session.getId()).isEmpty()) {
                triageVitalRepository.save(TriageVital.builder()
                        .triageSession(session)
                        .vitalType("SpO2")
                        .valueNumeric(new BigDecimal("96.0"))
                        .unit("%")
                        .recordedAt(Instant.now().minusSeconds(1800))
                        .build());
                triageVitalRepository.save(TriageVital.builder()
                        .triageSession(session)
                        .vitalType("Heart Rate")
                        .valueNumeric(new BigDecimal("82"))
                        .unit("bpm")
                        .recordedAt(Instant.now().minusSeconds(1800))
                        .build());
            }
        }

        // Seed Clinical Vitals (Current Encounter)
        if (clinicalVitalRepository.findByConsultationIdOrderByRecordedAtAsc(cons.getId()).isEmpty()) {
            clinicalVitalRepository.save(ClinicalVital.builder()
                    .consultation(cons)
                    .vitalType("Blood Pressure (Sys)")
                    .valueNumeric(new BigDecimal(String.valueOf(110 + rand.nextInt(30))))
                    .unit("mmHg")
                    .recordedAt(Instant.now().minusSeconds(300))
                    .build());
            clinicalVitalRepository.save(ClinicalVital.builder()
                    .consultation(cons)
                    .vitalType("SpO2")
                    .valueNumeric(new BigDecimal(String.valueOf(95 + rand.nextInt(5))))
                    .unit("%")
                    .recordedAt(Instant.now().minusSeconds(300))
                    .build());
        }
    }
}
