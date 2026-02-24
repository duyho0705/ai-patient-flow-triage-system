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
        private final vn.clinic.patientflow.billing.repository.InvoiceRepository invoiceRepository;

        @Transactional(readOnly = true)
        @org.springframework.cache.annotation.Cacheable(value = "dashboards", key = "'rev_' + #branchId + '_' + #fromDate + '_' + #toDate")
        public vn.clinic.patientflow.api.dto.RevenueReportDto getRevenueReport(UUID branchId, LocalDate fromDate,
                        LocalDate toDate) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                TenantBranch branch = tenantBranchRepository.findById(branchId)
                                .filter(b -> b.getTenant().getId().equals(tenantId))
                                .orElseThrow(() -> new NoSuchElementException("Branch not found: " + branchId));

                Instant from = fromDate.atStartOfDay(ZoneOffset.UTC).toInstant();
                Instant to = toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

                java.math.BigDecimal total = invoiceRepository.sumTotalAmountPaidByBranchAndCreatedAtBetween(branchId,
                                from, to);
                if (total == null)
                        total = java.math.BigDecimal.ZERO;

                List<Object[]> revenueByDay = invoiceRepository.sumRevenueByDay(branchId, from, to);
                Map<LocalDate, java.math.BigDecimal> revMap = new HashMap<>();
                for (Object[] row : revenueByDay) {
                        LocalDate d = row[0] instanceof java.sql.Date
                                        ? ((java.sql.Date) row[0]).toLocalDate()
                                        : (LocalDate) row[0];
                        java.math.BigDecimal amt = row[1] instanceof java.math.BigDecimal
                                        ? (java.math.BigDecimal) row[1]
                                        : java.math.BigDecimal.ZERO;
                        revMap.put(d, amt);
                }

                List<vn.clinic.patientflow.api.dto.RevenueByDayDto> dailyData = new java.util.ArrayList<>();
                for (LocalDate d = fromDate; !d.isAfter(toDate); d = d.plusDays(1)) {
                        dailyData.add(vn.clinic.patientflow.api.dto.RevenueByDayDto.builder()
                                        .date(d)
                                        .amount(revMap.getOrDefault(d, java.math.BigDecimal.ZERO))
                                        .build());
                }

                // Top Services
                List<Object[]> serviceRevenue = invoiceRepository.sumRevenueByService(branchId, from, to);
                List<vn.clinic.patientflow.api.dto.RevenueReportDto.ServiceRevenueDto> topServices = serviceRevenue
                                .stream()
                                .map(row -> vn.clinic.patientflow.api.dto.RevenueReportDto.ServiceRevenueDto.builder()
                                                .serviceName((String) row[0])
                                                .amount((java.math.BigDecimal) row[1])
                                                .count(((Number) row[2]).longValue())
                                                .build())
                                .limit(5)
                                .collect(Collectors.toList());

                return vn.clinic.patientflow.api.dto.RevenueReportDto.builder()
                                .branchId(branch.getId().toString())
                                .branchName(branch.getNameVi())
                                .fromDate(fromDate)
                                .toDate(toDate)
                                .totalRevenue(total)
                                .dailyRevenue(dailyData)
                                .topServices(topServices)
                                .build();
        }

        @Transactional(readOnly = true)
        @org.springframework.cache.annotation.Cacheable(value = "dashboards", key = "'wait_' + #branchId + '_' + #fromDate + '_' + #toDate")
        public WaitTimeSummaryDto getWaitTimeSummary(UUID branchId, LocalDate fromDate, LocalDate toDate) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                TenantBranch branch = tenantBranchRepository.findById(branchId)
                                .filter(b -> b.getTenant().getId().equals(tenantId))
                                .orElseThrow(() -> new NoSuchElementException("Branch not found: " + branchId));
                Instant from = fromDate.atStartOfDay(ZoneOffset.UTC).toInstant();
                Instant to = toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

                long total = queueEntryRepository.countCompletedByBranchAndJoinedAtBetween(branchId, from, to);
                Double avgMinutes = queueEntryRepository
                                .averageWaitMinutesByBranchAndJoinedAtBetween(branchId, from, to)
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
        @org.springframework.cache.annotation.Cacheable(value = "dashboards", key = "'vol_' + #branchId + '_' + #fromDate + '_' + #toDate")
        public List<DailyVolumeDto> getDailyVolume(UUID branchId, LocalDate fromDate, LocalDate toDate) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
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
        @org.springframework.cache.annotation.Cacheable(value = "dashboards", key = "'ai_eff_' + #branchId + '_' + #fromDate + '_' + #toDate")
        public AiEffectivenessDto getAiEffectiveness(UUID branchId, LocalDate fromDate, LocalDate toDate) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                TenantBranch branch = tenantBranchRepository.findById(branchId)
                                .filter(b -> b.getTenant().getId().equals(tenantId))
                                .orElseThrow(() -> new NoSuchElementException("Branch not found: " + branchId));
                Instant from = fromDate.atStartOfDay(ZoneOffset.UTC).toInstant();
                Instant to = toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

                long totalSessions = triageSessionRepository.countByBranchIdAndStartedAtBetween(branchId, from, to);
                long aiSessions = triageSessionRepository.countAiSessionsByBranchAndStartedAtBetween(branchId, from,
                                to);
                long humanSessions = totalSessions - aiSessions;
                long matchCount = triageSessionRepository.countMatchByBranchAndStartedAtBetween(branchId, from, to);
                long overrideCount = triageSessionRepository.countOverrideByBranchAndStartedAtBetween(branchId, from,
                                to);

                Double matchRate = aiSessions > 0 ? Math.round((matchCount * 10000.0 / aiSessions)) / 10000.0 : null;
                Double overrideRate = aiSessions > 0 ? Math.round((overrideCount * 10000.0 / aiSessions)) / 10000.0
                                : null;

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

        @Transactional(readOnly = true)
        @org.springframework.cache.annotation.Cacheable(value = "dashboards", key = "'heatmap_' + #branchId")
        public vn.clinic.patientflow.api.dto.BranchOperationalHeatmapDto getOperationalHeatmap(UUID branchId) {
                TenantBranch branch = tenantBranchRepository.findById(branchId)
                                .orElseThrow(() -> new NoSuchElementException("Branch not found"));

                List<Object[]> countsByQueue = queueEntryRepository.countActivePatientsByQueue(branchId);
                Map<String, Long> density = new HashMap<>();
                long total = 0;
                for (Object[] row : countsByQueue) {
                        String name = (String) row[0];
                        long count = ((Number) row[1]).longValue();
                        density.put(name, count);
                        total += count;
                }

                String load = total > 50 ? "CRITICAL" : (total > 30 ? "HIGH" : (total > 15 ? "NORMAL" : "LOW"));
                String insight = load.equals("CRITICAL")
                                ? "CẢNH BÁO: Phòng khám đang quá tải. Cần điều phối thêm nhân sự tại các khu vực mật độ cao."
                                : "Hệ thống vận hành ổn định. Lưu lượng bệnh nhân trong tầm kiểm soát.";

                return vn.clinic.patientflow.api.dto.BranchOperationalHeatmapDto.builder()
                                .branchName(branch.getNameVi())
                                .queueDensity(density)
                                .totalActivePatients(total)
                                .systemLoadLevel(load)
                                .predictiveInsight(insight)
                                .build();
        }

        @Transactional(readOnly = true)
        public List<vn.clinic.patientflow.api.dto.AiAuditDetailDto> getAiAuditLogs(UUID branchId, LocalDate fromDate,
                        LocalDate toDate) {
                Instant from = fromDate.atStartOfDay(ZoneOffset.UTC).toInstant();
                Instant to = toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

                return triageSessionRepository.findOverridesByBranchAndStartedAtBetween(branchId, from, to)
                                .stream()
                                .map(ts -> vn.clinic.patientflow.api.dto.AiAuditDetailDto.builder()
                                                .sessionId(ts.getId())
                                                .patientName(ts.getPatient().getFullNameVi())
                                                .symptoms(ts.getChiefComplaintText())
                                                .aiSuggestedAcuity(ts.getAiSuggestedAcuity())
                                                .humanAcuity(ts.getAcuityLevel())
                                                .overrideReason(ts.getOverrideReason())
                                                .timestamp(ts.getStartedAt())
                                                .build())
                                .collect(Collectors.toList());
        }

        private static Map<LocalDate, Long> toDateCountMap(List<Object[]> rows) {
                Map<LocalDate, Long> map = new HashMap<>();
                if (rows == null)
                        return map;
                for (Object[] row : rows) {
                        if (row == null || row.length < 2 || row[0] == null)
                                continue;
                        Object dateObj = row[0];
                        LocalDate d = null;
                        if (dateObj instanceof java.sql.Date) {
                                d = ((java.sql.Date) dateObj).toLocalDate();
                        } else if (dateObj instanceof java.util.Date) {
                                d = new java.sql.Date(((java.util.Date) dateObj).getTime()).toLocalDate();
                        } else if (dateObj instanceof LocalDate) {
                                d = (LocalDate) dateObj;
                        } else if (dateObj instanceof java.time.LocalDateTime) {
                                d = ((java.time.LocalDateTime) dateObj).toLocalDate();
                        }

                        if (d != null) {
                                long count = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
                                map.put(d, count);
                        }
                }
                return map;
        }
}
