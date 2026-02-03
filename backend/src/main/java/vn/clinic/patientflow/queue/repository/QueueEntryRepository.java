package vn.clinic.patientflow.queue.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.clinic.patientflow.queue.domain.QueueEntry;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QueueEntryRepository extends JpaRepository<QueueEntry, UUID> {

        List<QueueEntry> findByBranchId(UUID branchId);

        Optional<QueueEntry> findFirstByPatientIdAndStatusInOrderByJoinedAtDesc(UUID patientId, List<String> statuses);

        long countByPatientIdAndStatusIn(UUID patientId, List<String> statuses);

        List<QueueEntry> findByPatientIdAndStatusInOrderByJoinedAtDesc(UUID patientId, List<String> statuses);

        @Query("SELECT COUNT(e) FROM QueueEntry e WHERE e.queueDefinition.id = :queueId AND (e.status = 'WAITING' OR e.status = 'CALLING') AND e.joinedAt < :joinedAt")
        long countPeopleAhead(@Param("queueId") UUID queueId, @Param("joinedAt") Instant joinedAt);

        List<QueueEntry> findByBranch_IdAndQueueDefinition_IdAndStatusOrderByPositionAsc(
                        UUID branchId, UUID queueDefinitionId, String status);

        @Query("SELECT e FROM QueueEntry e LEFT JOIN FETCH e.triageSession ts WHERE e.branch.id = :branchId AND e.queueDefinition.id = :queueDefinitionId AND e.status = :status ORDER BY e.joinedAt ASC")
        List<QueueEntry> findWaitingWithTriageByBranchAndQueue(UUID branchId, UUID queueDefinitionId, String status);

        List<QueueEntry> findByBranch_IdAndStatusOrderByJoinedAtAsc(UUID branchId, String status);

        @Query("SELECT COUNT(e) FROM QueueEntry e WHERE e.branch.id = :branchId AND e.calledAt IS NOT NULL AND e.joinedAt >= :from AND e.joinedAt <= :to")
        long countCompletedByBranchAndJoinedAtBetween(@Param("branchId") UUID branchId, @Param("from") Instant from,
                        @Param("to") Instant to);

        @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (qe.called_at - qe.joined_at)) / 60.0) FROM queue_entry qe WHERE qe.branch_id = :branchId AND qe.called_at IS NOT NULL AND qe.joined_at >= :from AND qe.joined_at <= :to", nativeQuery = true)
        Optional<Double> averageWaitMinutesByBranchAndJoinedAtBetween(@Param("branchId") UUID branchId,
                        @Param("from") Instant from, @Param("to") Instant to);

        @Query(value = "SELECT (qe.called_at AT TIME ZONE 'UTC')::date AS d, COUNT(*) FROM queue_entry qe WHERE qe.branch_id = :branchId AND qe.called_at IS NOT NULL AND qe.called_at >= :from AND qe.called_at <= :to GROUP BY (qe.called_at AT TIME ZONE 'UTC')::date ORDER BY d", nativeQuery = true)
        List<Object[]> countCompletedQueueByDay(@Param("branchId") UUID branchId, @Param("from") Instant from,
                        @Param("to") Instant to);

        @Query("SELECT COUNT(e) FROM QueueEntry e WHERE e.branch.id = :branchId AND e.status = :status AND e.completedAt >= :from AND e.completedAt <= :to")
        long countByBranchIdAndStatusAndCompletedAtBetween(@Param("branchId") UUID branchId,
                        @Param("status") String status,
                        @Param("from") Instant from, @Param("to") Instant to);

        @Query("SELECT COUNT(e) FROM QueueEntry e WHERE e.tenant.id = :tenantId AND e.status = :status AND e.completedAt >= :from AND e.completedAt <= :to")
        long countByTenantIdAndStatusAndCompletedAtBetween(@Param("tenantId") UUID tenantId,
                        @Param("status") String status,
                        @Param("from") Instant from, @Param("to") Instant to);
}
