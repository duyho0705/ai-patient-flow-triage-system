package vn.clinic.cdm.clinical.event;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.clinic.cdm.clinical.service.AiClinicalService;
import vn.clinic.cdm.clinical.repository.ClinicalConsultationRepository;

/**
 * Enterprise Event Listener for post-consultation workflows.
 * Handles: AI Care Plan generation.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ClinicalEventListener {

    private final AiClinicalService aiClinicalService;
    private final ClinicalConsultationRepository consultationRepository;

    @Async
    @EventListener
    @Transactional
    public void handleConsultationCompleted(ConsultationCompletedEvent event) {
        var consultation = event.getConsultation();
        log.info("[EventPipeline] Post-processing consultation: {}", consultation.getId());

        // Generate AI Care Plan
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

