package vn.clinic.patientflow.triage.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.clinic.patientflow.triage.domain.TriageSession;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TriageSessionRepository extends JpaRepository<TriageSession, UUID> {

    Page<TriageSession> findByTenantIdAndBranchIdOrderByStartedAtDesc(
            UUID tenantId, UUID branchId, Pageable pageable);

    List<TriageSession> findByPatientIdOrderByStartedAtDesc(UUID patientId, Pageable pageable);

    /** Đếm phiên theo chi nhánh và khoảng thời gian. */
    @Query("SELECT COUNT(ts) FROM TriageSession ts WHERE ts.branch.id = :branchId AND ts.startedAt >= :from AND ts.startedAt <= :to")
    long countByBranchIdAndStartedAtBetween(@Param("branchId") UUID branchId, @Param("from") Instant from,
            @Param("to") Instant to);

    /** Đếm phiên có dùng AI (acuity_source AI hoặc HYBRID). */
    @Query("SELECT COUNT(ts) FROM TriageSession ts WHERE ts.branch.id = :branchId AND ts.startedAt >= :from AND ts.startedAt <= :to AND (ts.acuitySource = 'AI' OR ts.acuitySource = 'HYBRID')")
    long countAiSessionsByBranchAndStartedAtBetween(@Param("branchId") UUID branchId, @Param("from") Instant from,
            @Param("to") Instant to);

    /**
     * Đếm phiên có gợi ý AI khớp với quyết định (ai_suggested_acuity =
     * acuity_level).
     */
    @Query("SELECT COUNT(ts) FROM TriageSession ts WHERE ts.branch.id = :branchId AND ts.startedAt >= :from AND ts.startedAt <= :to AND ts.aiSuggestedAcuity IS NOT NULL AND ts.aiSuggestedAcuity = ts.acuityLevel")
    long countMatchByBranchAndStartedAtBetween(@Param("branchId") UUID branchId, @Param("from") Instant from,
            @Param("to") Instant to);

    /** Đếm phiên có ghi override (override_reason not null). */
    @Query("SELECT COUNT(ts) FROM TriageSession ts WHERE ts.branch.id = :branchId AND ts.startedAt >= :from AND ts.startedAt <= :to AND ts.overrideReason IS NOT NULL AND ts.overrideReason <> ''")
    long countOverrideByBranchAndStartedAtBetween(@Param("branchId") UUID branchId, @Param("from") Instant from,
            @Param("to") Instant to);

    /**
     * Số phiên phân loại theo từng ngày (date, count) – native để GROUP BY date.
     */
    @Query(value = "SELECT (ts.started_at AT TIME ZONE 'UTC')::date AS d, COUNT(*) FROM triage_session ts WHERE ts.branch_id = :branchId AND ts.started_at >= :from AND ts.started_at <= :to GROUP BY (ts.started_at AT TIME ZONE 'UTC')::date ORDER BY d", nativeQuery = true)
    List<Object[]> countTriageByDay(@Param("branchId") UUID branchId, @Param("from") Instant from,
            @Param("to") Instant to);

    /** Count sessions by tenant (across all branches). */
    @Query("SELECT COUNT(ts) FROM TriageSession ts WHERE ts.tenant.id = :tenantId AND ts.startedAt >= :from AND ts.startedAt <= :to")
    long countByTenantIdAndStartedAtBetween(@Param("tenantId") UUID tenantId, @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("SELECT ts FROM TriageSession ts WHERE ts.branch.id = :branchId AND ts.startedAt >= :from AND ts.startedAt <= :to AND ts.overrideReason IS NOT NULL AND ts.overrideReason <> '' ORDER BY ts.startedAt DESC")
    List<TriageSession> findOverridesByBranchAndStartedAtBetween(@Param("branchId") UUID branchId,
            @Param("from") Instant from, @Param("to") Instant to);
}
