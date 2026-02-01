package vn.clinic.patientflow.clinical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.clinical.domain.ClinicalVital;
import vn.clinic.patientflow.clinical.repository.ClinicalConsultationRepository;
import vn.clinic.patientflow.clinical.repository.ClinicalVitalRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClinicalService {

    private final ClinicalConsultationRepository consultationRepository;
    private final ClinicalVitalRepository vitalRepository;

    @Transactional(readOnly = true)
    public ClinicalConsultation getById(UUID id) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return consultationRepository.findById(id)
                .filter(c -> c.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("ClinicalConsultation", id));
    }

    @Transactional(readOnly = true)
    public List<ClinicalVital> getVitals(UUID consultationId) {
        getById(consultationId);
        return vitalRepository.findByConsultationIdOrderByRecordedAtAsc(consultationId);
    }
}
