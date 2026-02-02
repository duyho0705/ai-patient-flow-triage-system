package vn.clinic.patientflow.aiaudit.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.aiaudit.domain.AiModelVersion;
import vn.clinic.patientflow.aiaudit.domain.AiTriageAudit;
import vn.clinic.patientflow.aiaudit.repository.AiModelVersionRepository;
import vn.clinic.patientflow.aiaudit.repository.AiTriageAuditRepository;
import vn.clinic.patientflow.api.dto.AiTriageAuditDto;
import vn.clinic.patientflow.api.dto.PagedResponse;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.triage.domain.TriageSession;

/**
 * AI model version and triage audit – lookup and append-only audit.
 * Enterprise: AI Audit + Explainability (so sánh đề xuất AI vs quyết định thực
 * tế).
 */
@Service
@RequiredArgsConstructor
public class AiAuditService {

    private final AiModelVersionRepository modelVersionRepository;
    private final AiTriageAuditRepository triageAuditRepository;
    private final ObjectMapper objectMapper;

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

    /**
     * Danh sách AI audit theo chi nhánh – so sánh suggested vs actual acuity
     * (Explainability).
     */
    @Transactional(readOnly = true)
    public PagedResponse<AiTriageAuditDto> listAuditsByBranch(UUID branchId, Pageable pageable) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        Page<AiTriageAudit> page = triageAuditRepository
                .findByTriageSessionBranchIdAndTriageSessionTenantIdOrderByCalledAtDesc(
                        branchId, tenantId, pageable);
        List<AiTriageAuditDto> content = page.getContent().stream().map(this::toDto).collect(Collectors.toList());
        return PagedResponse.<AiTriageAuditDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    private AiTriageAuditDto toDto(AiTriageAudit a) {
        TriageSession session = a.getTriageSession();
        String suggestedAcuity = parseSuggestedAcuity(a.getOutputJson());
        String actualAcuity = session.getAcuityLevel();
        return AiTriageAuditDto.builder()
                .id(a.getId())
                .triageSessionId(session.getId())
                .suggestedAcuity(suggestedAcuity)
                .actualAcuity(actualAcuity)
                .matched(suggestedAcuity != null && suggestedAcuity.equals(actualAcuity))
                .calledAt(a.getCalledAt())
                .latencyMs(a.getLatencyMs())
                .patientId(session.getPatient().getId())
                .branchId(session.getBranch().getId())
                .build();
    }

    private String parseSuggestedAcuity(String outputJson) {
        if (outputJson == null || outputJson.isBlank())
            return null;
        try {
            JsonNode node = objectMapper.readTree(outputJson);
            return node.has("suggestedAcuity") ? node.get("suggestedAcuity").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }
}
