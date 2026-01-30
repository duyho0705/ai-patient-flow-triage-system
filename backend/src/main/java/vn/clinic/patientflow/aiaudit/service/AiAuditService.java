package vn.clinic.patientflow.aiaudit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.aiaudit.domain.AiModelVersion;
import vn.clinic.patientflow.aiaudit.domain.AiTriageAudit;
import vn.clinic.patientflow.aiaudit.repository.AiModelVersionRepository;
import vn.clinic.patientflow.aiaudit.repository.AiTriageAuditRepository;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * AI model version and triage audit – lookup and append-only audit.
 */
@Service
@RequiredArgsConstructor
public class AiAuditService {

    private final AiModelVersionRepository modelVersionRepository;
    private final AiTriageAuditRepository triageAuditRepository;

    @Transactional(readOnly = true)
    public AiModelVersion getModelVersionById(UUID id) {
        return modelVersionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AiModelVersion", id));
    }

    @Transactional(readOnly = true)
    public Optional<AiModelVersion> getCurrentModelVersion(String modelKey) {
        return modelVersionRepository.findByModelKeyAndDeprecatedAtIsNull(modelKey);
    }

    @Transactional(readOnly = true)
    public List<AiTriageAudit> getAuditsByTriageSession(UUID triageSessionId) {
        return triageAuditRepository.findByTriageSessionIdOrderByCalledAtAsc(triageSessionId);
    }
}
