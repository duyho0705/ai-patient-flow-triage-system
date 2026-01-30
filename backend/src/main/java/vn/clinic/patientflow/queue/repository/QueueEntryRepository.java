package vn.clinic.patientflow.queue.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.queue.domain.QueueEntry;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface QueueEntryRepository extends JpaRepository<QueueEntry, UUID> {

    List<QueueEntry> findByBranchIdAndQueueDefinitionIdAndStatusOrderByPositionAsc(
            UUID branchId, UUID queueDefinitionId, String status);

    List<QueueEntry> findByBranchIdAndStatusOrderByJoinedAtAsc(UUID branchId, String status);
}
