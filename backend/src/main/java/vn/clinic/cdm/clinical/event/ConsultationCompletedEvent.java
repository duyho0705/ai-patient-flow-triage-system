package vn.clinic.cdm.clinical.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import vn.clinic.cdm.clinical.domain.ClinicalConsultation;

@Getter
public class ConsultationCompletedEvent extends ApplicationEvent {
    private final ClinicalConsultation consultation;

    public ConsultationCompletedEvent(Object source, ClinicalConsultation consultation) {
        super(source);
        this.consultation = consultation;
    }
}

