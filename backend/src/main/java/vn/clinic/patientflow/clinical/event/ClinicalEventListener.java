package vn.clinic.patientflow.clinical.event;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.patientflow.clinical.service.AiClinicalService;
import vn.clinic.patientflow.clinical.service.ClinicalSimulationService;
import vn.clinic.patientflow.clinical.repository.ClinicalConsultationRepository;

/**
 * Enterprise Event Listener for post-consultation workflows.
 * Handles: AI Care Plan generation, Medical data simulation (R&D only),
 * and future extensibility (e.g., notification dispatch, analytics pipeline).
 * 
 * Note: AiClinicalInsightListener is the primary listener for AI insights.
 * This listener delegates additional post-completion tasks.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ClinicalEventListener {

    private final AiClinicalService aiClinicalService;
    private final ClinicalConsultationRepository consultationRepository;
    private final ClinicalSimulationService simulationService;

    @Async
    @EventListener
    @Transactional
    public void handleConsultationCompleted(ConsultationCompletedEvent event) {
        var consultation = event.getConsultation();
        log.info("[EventPipeline] Post-processing consultation: {}", consultation.getId());

        // Stage 1: Simulate medical data for R&D/Demo environments
        try {
            simulationService.generateSimulatedData(consultation);
            log.debug("[EventPipeline] Simulated data seeded for consultation: {}", consultation.getId());
        } catch (Exception e) {
            log.warn("[EventPipeline] Simulation skipped (non-critical): {}", e.getMessage());
        }

        // Stage 2: Generate AI Care Plan (if not already handled by
        // AiClinicalInsightListener)
        try {
            consultationRepository.findById(consultation.getId()).ifPresent(c -> {
                if (c.getAiInsights() == null || c.getAiInsights().isBlank()) {
                    String carePlan = aiClinicalService.generateLongTermCarePlan(c);
                    c.setAiInsights(carePlan);
                    consultationRepository.save(c);
                    log.info("[EventPipeline] Care plan persisted for consultation: {}", c.getId());
                }
            });
        } catch (Exception e) {
            log.error("[EventPipeline] Failed AI insights generation: {}", e.getMessage());
        }
    }
}
