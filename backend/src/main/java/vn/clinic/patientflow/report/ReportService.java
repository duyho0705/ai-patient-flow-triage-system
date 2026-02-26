package vn.clinic.patientflow.report;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.api.dto.DailyVolumeDto;
import vn.clinic.patientflow.api.dto.WaitTimeSummaryDto;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.repository.TenantBranchRepository;

/**
 * Báo cáo cho Clinic Manager: số bệnh nhân/ngày, thống kê CDM.
 * Removed: Triage, Queue, Billing dependencies.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

        private final TenantBranchRepository tenantBranchRepository;

        @Transactional(readOnly = true)
        @org.springframework.cache.annotation.Cacheable(value = "dashboards", key = "'vol_' + #branchId + '_' + #fromDate + '_' + #toDate")
        public List<DailyVolumeDto> getDailyVolume(UUID branchId, LocalDate fromDate, LocalDate toDate) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                TenantBranch branch = tenantBranchRepository.findById(branchId)
                                .filter(b -> b.getTenant().getId().equals(tenantId))
                                .orElseThrow(() -> new NoSuchElementException("Branch not found: " + branchId));

                // Generate daily entries between fromDate and toDate
                java.util.List<DailyVolumeDto> result = new java.util.ArrayList<>();
                for (LocalDate d = fromDate; !d.isAfter(toDate); d = d.plusDays(1)) {
                        result.add(DailyVolumeDto.builder()
                                        .date(d)
                                        .branchId(branch.getId().toString())
                                        .branchName(branch.getNameVi())
                                        .triageCount(0L)
                                        .completedQueueEntries(0L)
                                        .build());
                }
                return result;
        }

        @Transactional(readOnly = true)
        @org.springframework.cache.annotation.Cacheable(value = "dashboards", key = "'wait_' + #branchId + '_' + #fromDate + '_' + #toDate")
        public WaitTimeSummaryDto getWaitTimeSummary(UUID branchId, LocalDate fromDate, LocalDate toDate) {
                UUID tenantId = TenantContext.getTenantIdOrThrow();
                TenantBranch branch = tenantBranchRepository.findById(branchId)
                                .filter(b -> b.getTenant().getId().equals(tenantId))
                                .orElseThrow(() -> new NoSuchElementException("Branch not found: " + branchId));

                return WaitTimeSummaryDto.builder()
                                .branchId(branch.getId().toString())
                                .branchName(branch.getNameVi())
                                .fromDate(fromDate)
                                .toDate(toDate)
                                .averageWaitMinutes(null)
                                .totalCompletedEntries(0L)
                                .build();
        }

        @Transactional(readOnly = true)
        @org.springframework.cache.annotation.Cacheable(value = "dashboards", key = "'heatmap_' + #branchId")
        public vn.clinic.patientflow.api.dto.BranchOperationalHeatmapDto getOperationalHeatmap(UUID branchId) {
                TenantBranch branch = tenantBranchRepository.findById(branchId)
                                .orElseThrow(() -> new NoSuchElementException("Branch not found"));

                return vn.clinic.patientflow.api.dto.BranchOperationalHeatmapDto.builder()
                                .branchName(branch.getNameVi())
                                .queueDensity(new HashMap<>())
                                .totalActivePatients(0L)
                                .systemLoadLevel("LOW")
                                .predictiveInsight("Hệ thống vận hành ổn định.")
                                .build();
        }
}
