package vn.clinic.patientflow.queue.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.patientflow.common.exception.ResourceNotFoundException;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.queue.domain.QueueDefinition;
import vn.clinic.patientflow.queue.domain.QueueEntry;
import vn.clinic.patientflow.queue.repository.QueueDefinitionRepository;
import vn.clinic.patientflow.queue.repository.QueueEntryRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final QueueDefinitionRepository queueDefinitionRepository;
    private final QueueEntryRepository queueEntryRepository;

    @Transactional(readOnly = true)
    public List<QueueDefinition> getDefinitionsByBranch(UUID branchId) {
        return queueDefinitionRepository.findByBranchIdAndIsActiveTrueOrderByDisplayOrderAsc(branchId);
    }

    @Transactional(readOnly = true)
    public QueueEntry getEntryById(UUID id) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        return queueEntryRepository.findById(id)
                .filter(e -> e.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("QueueEntry", id));
    }

    @Transactional(readOnly = true)
    public List<QueueEntry> getWaitingEntries(UUID branchId, UUID queueDefinitionId) {
        return queueEntryRepository.findByBranchIdAndQueueDefinitionIdAndStatusOrderByPositionAsc(
                branchId, queueDefinitionId, "WAITING");
    }
}
