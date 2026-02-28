package vn.clinic.cdm.report;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.clinic.cdm.api.dto.report.DailyVolumeDto;
import vn.clinic.cdm.api.dto.report.WaitTimeSummaryDto;
import vn.clinic.cdm.common.tenant.TenantContext;
import vn.clinic.cdm.tenant.domain.TenantBranch;
import vn.clinic.cdm.tenant.repository.TenantBranchRepository;

/**
 * BÃ¡o cÃ¡o cho Clinic Manager: sá»‘ bá»‡nh nhÃ¢n/ngÃ y, thá»‘ng kÃª CDM.
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
        public vn.clinic.cdm.api.dto.tenant.BranchOperationalHeatmapDto getOperationalHeatmap(UUID branchId) {
                TenantBranch branch = tenantBranchRepository.findById(branchId)
                                .orElseThrow(() -> new NoSuchElementException("Branch not found"));

                return vn.clinic.cdm.api.dto.tenant.BranchOperationalHeatmapDto.builder()
                                .branchName(branch.getNameVi())
                                .queueDensity(new HashMap<>())
                                .totalActivePatients(0L)
                                .systemLoadLevel("LOW")
                                .predictiveInsight("Há»‡ thá»‘ng váº­n hÃ nh á»•n Ä‘á»‹nh.")
                                .build();
        }
}

