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

    List<QueueEntry> findByBranchIdAndQueueDefinitionIdAndStatusOrderByPositionAsc(
            UUID branchId, UUID queueDefinitionId, String status);

    /** Lấy WAITING entries kèm triage session để sort theo acuity (1 trước 5). */
    @Query("SELECT e FROM QueueEntry e LEFT JOIN FETCH e.triageSession ts WHERE e.branch.id = :branchId AND e.queueDefinition.id = :queueDefinitionId AND e.status = :status ORDER BY e.joinedAt ASC")
    List<QueueEntry> findWaitingWithTriageByBranchAndQueue(UUID branchId, UUID queueDefinitionId, String status);

    List<QueueEntry> findByBranchIdAndStatusOrderByJoinedAtAsc(UUID branchId, String status);

    /** Số bản ghi đã gọi (called_at not null) trong kỳ – dùng cho báo cáo thời gian chờ. */
    @Query("SELECT COUNT(e) FROM QueueEntry e WHERE e.branch.id = :branchId AND e.calledAt IS NOT NULL AND e.joinedAt >= :from AND e.joinedAt <= :to")
    long countCompletedByBranchAndJoinedAtBetween(@Param("branchId") UUID branchId, @Param("from") Instant from, @Param("to") Instant to);

    /** Thời gian chờ trung bình (phút) – chỉ entries đã có called_at. */
    @Query("SELECT AVG(EXTRACT(EPOCH FROM (e.calledAt - e.joinedAt)) / 60.0) FROM QueueEntry e WHERE e.branch.id = :branchId AND e.calledAt IS NOT NULL AND e.joinedAt >= :from AND e.joinedAt <= :to")
    Optional<Double> averageWaitMinutesByBranchAndJoinedAtBetween(@Param("branchId") UUID branchId, @Param("from") Instant from, @Param("to") Instant to);

    /** Số lượt hàng chờ đã gọi theo từng ngày (date, count) – native để GROUP BY date. */
    @Query(value = "SELECT (qe.called_at AT TIME ZONE 'UTC')::date AS d, COUNT(*) FROM queue_entry qe WHERE qe.branch_id = :branchId AND qe.called_at IS NOT NULL AND qe.called_at >= :from AND qe.called_at <= :to GROUP BY (qe.called_at AT TIME ZONE 'UTC')::date ORDER BY d", nativeQuery = true)
    List<Object[]> countCompletedQueueByDay(@Param("branchId") UUID branchId, @Param("from") Instant from, @Param("to") Instant to);
}
