package vn.clinic.cdm.service.report;

import vn.clinic.cdm.dto.report.*;
import vn.clinic.cdm.dto.tenant.BranchOperationalHeatmapDto;

import java.util.UUID;

public interface AiOperationalService {
    AiOperationalInsightDto getOperationalInsights(UUID branchId);
    AiOperationalInsightDto generateOperationalInsights(
            WaitTimeSummaryDto waitTime,
            java.util.List<DailyVolumeDto> volume,
            BranchOperationalHeatmapDto heatmap);
}
