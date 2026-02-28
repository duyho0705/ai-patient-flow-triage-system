package vn.clinic.cdm.clinical.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.clinical.event.ConsultationCompletedEvent;
import vn.clinic.cdm.clinical.repository.ClinicalConsultationRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class AiClinicalInsightListener {

    private final AiClinicalService aiClinicalService;
    private final ClinicalConsultationRepository consultationRepository;

    @Async
    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onConsultationCompleted(ConsultationCompletedEvent event) {
        var consultation = event.getConsultation();
        log.info("Starting Async AI Insight generation for consultation: {}", consultation.getId());

        try {
            // Generate insight using AI
            String insight = aiClinicalService.generateLongTermCarePlan(consultation);

            // Re-fetch to ensure we have the latest state (since it's a new transaction)
            consultationRepository.findById(consultation.getId()).ifPresent(c -> {
                c.setAiInsights(insight);
                consultationRepository.save(c);
                log.info("AI Insight successfully saved for consultation: {}", c.getId());
            });

        } catch (Exception e) {
            log.error("Failed to generate AI insight for consultation {}: {}", consultation.getId(), e.getMessage());
        }
    }
}

