package vn.clinic.patientflow.report;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.api.dto.AiEffectivenessDto;
import vn.clinic.patientflow.api.dto.DailyVolumeDto;
import vn.clinic.patientflow.api.dto.WaitTimeSummaryDto;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.queue.repository.QueueEntryRepository;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.repository.TenantBranchRepository;
import vn.clinic.patientflow.triage.repository.TriageSessionRepository;

/**
 * Báo cáo cho Clinic Manager: thời gian chờ trung bình, số bệnh nhân/ngày, hiệu
 * quả AI.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final QueueEntryRepository queueEntryRepository;
    private final TriageSessionRepository triageSessionRepository;
    private final TenantBranchRepository tenantBranchRepository;

    @Transactional(readOnly = true)
    public WaitTimeSummaryDto getWaitTimeSummary(UUID branchId, LocalDate fromDate, LocalDate toDate) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context required");
        }
        TenantBranch branch = tenantBranchRepository.findById(branchId)
                .filter(b -> b.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new NoSuchElementException("Branch not found: " + branchId));
        Instant from = fromDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to = toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        long total = queueEntryRepository.countCompletedByBranchAndJoinedAtBetween(branchId, from, to);
        Double avgMinutes = queueEntryRepository.averageWaitMinutesByBranchAndJoinedAtBetween(branchId, from, to)
                .orElse(null);

        return WaitTimeSummaryDto.builder()
                .branchId(branch.getId().toString())
                .branchName(branch.getNameVi())
                .fromDate(fromDate)
                .toDate(toDate)
                .averageWaitMinutes(avgMinutes != null ? Math.round(avgMinutes * 100.0) / 100.0 : null)
                .totalCompletedEntries(total)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DailyVolumeDto> getDailyVolume(UUID branchId, LocalDate fromDate, LocalDate toDate) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context required");
        }
        TenantBranch branch = tenantBranchRepository.findById(branchId)
                .filter(b -> b.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new NoSuchElementException("Branch not found: " + branchId));
        Instant from = fromDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to = toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<Object[]> triageByDay = triageSessionRepository.countTriageByDay(branchId, from, to);
        List<Object[]> queueByDay = queueEntryRepository.countCompletedQueueByDay(branchId, from, to);

        Map<LocalDate, Long> triageMap = toDateCountMap(triageByDay);
        Map<LocalDate, Long> queueMap = toDateCountMap(queueByDay);

        Set<LocalDate> allDays = new HashSet<>(triageMap.keySet());
        allDays.addAll(queueMap.keySet());
        for (LocalDate d = fromDate; !d.isAfter(toDate); d = d.plusDays(1)) {
            allDays.add(d);
        }
        return allDays.stream()
                .sorted()
                .map(d -> DailyVolumeDto.builder()
                        .date(d)
                        .branchId(branch.getId().toString())
                        .branchName(branch.getNameVi())
                        .triageCount(triageMap.getOrDefault(d, 0L))
                        .completedQueueEntries(queueMap.getOrDefault(d, 0L))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AiEffectivenessDto getAiEffectiveness(UUID branchId, LocalDate fromDate, LocalDate toDate) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context required");
        }
        TenantBranch branch = tenantBranchRepository.findById(branchId)
                .filter(b -> b.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new NoSuchElementException("Branch not found: " + branchId));
        Instant from = fromDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to = toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        long totalSessions = triageSessionRepository.countByBranchIdAndStartedAtBetween(branchId, from, to);
        long aiSessions = triageSessionRepository.countAiSessionsByBranchAndStartedAtBetween(branchId, from, to);
        long humanSessions = totalSessions - aiSessions;
        long matchCount = triageSessionRepository.countMatchByBranchAndStartedAtBetween(branchId, from, to);
        long overrideCount = triageSessionRepository.countOverrideByBranchAndStartedAtBetween(branchId, from, to);

        Double matchRate = aiSessions > 0 ? Math.round((matchCount * 10000.0 / aiSessions)) / 10000.0 : null;
        Double overrideRate = aiSessions > 0 ? Math.round((overrideCount * 10000.0 / aiSessions)) / 10000.0 : null;

        return AiEffectivenessDto.builder()
                .branchId(branch.getId().toString())
                .branchName(branch.getNameVi())
                .fromDate(fromDate)
                .toDate(toDate)
                .totalSessions(totalSessions)
                .aiSessions(aiSessions)
                .humanSessions(humanSessions)
                .matchCount(matchCount)
                .overrideCount(overrideCount)
                .matchRate(matchRate)
                .overrideRate(overrideRate)
                .build();
    }

    private static Map<LocalDate, Long> toDateCountMap(List<Object[]> rows) {
        Map<LocalDate, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate d = row[0] instanceof java.sql.Date
                    ? ((java.sql.Date) row[0]).toLocalDate()
                    : (LocalDate) row[0];
            long count = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
            map.put(d, count);
        }
        return map;
    }
}
