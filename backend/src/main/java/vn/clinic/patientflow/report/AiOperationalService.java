package vn.clinic.patientflow.report;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.aiaudit.domain.AiAuditLog;
import vn.clinic.patientflow.aiaudit.service.AiAuditServiceV2;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.clinical.service.PromptRegistry;
import vn.clinic.patientflow.common.tenant.TenantContext;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Enterprise Operational Intelligence Service.
 * Provides strategic insights using AI to optimize clinic performance.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiOperationalService {

    private final PromptRegistry promptRegistry;
    private final AiAuditServiceV2 aiAuditService;
    private final ObjectMapper objectMapper;
    private final ReportService reportService;

    @Autowired(required = false)
    private ChatLanguageModel chatModel;

    // Enterprise: Rate Limiting
    private final Map<UUID, Bucket> branchBuckets = new ConcurrentHashMap<>();

    public AiOperationalInsightDto getOperationalInsights(UUID branchId) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(7);

        var revenue = reportService.getRevenueReport(branchId, start, end);
        var waitTime = reportService.getWaitTimeSummary(branchId, start, end);
        var volume = reportService.getDailyVolume(branchId, start, end);
        var effectiveness = reportService.getAiEffectiveness(branchId, start, end);
        var heatmap = reportService.getOperationalHeatmap(branchId);

        return generateOperationalInsights(revenue, waitTime, volume, effectiveness, heatmap);
    }

    public AiOperationalInsightDto generateOperationalInsights(
            RevenueReportDto revenue,
            WaitTimeSummaryDto waitTime,
            java.util.List<DailyVolumeDto> volume,
            AiEffectivenessDto aiEffectiveness,
            BranchOperationalHeatmapDto heatmap) {

        if (chatModel == null)
            return fallbackInsights();

        UUID branchId = TenantContext.getBranchId().orElse(null);
        if (branchId != null && !getBucket(branchId).tryConsume(1)) {
            log.warn("Operational AI Rate limit exceeded for branch: {}", branchId);
            return fallbackInsights();
        }

        long startTime = System.currentTimeMillis();
        String context = buildOperationalContext(revenue, waitTime, volume, aiEffectiveness, heatmap);
        String prompt = promptRegistry.getOperationalInsightsPrompt(context);

        try {
            String res = chatModel.chat(prompt);
            AiOperationalInsightDto dto = parseInsights(res);

            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.OPERATIONAL_INSIGHT,
                    null,
                    null,
                    prompt,
                    res,
                    System.currentTimeMillis() - startTime,
                    "SUCCESS",
                    null);
            return dto;
        } catch (Exception e) {
            log.error("AI Operational Intelligence Error: {}", e.getMessage());
            aiAuditService.recordInteraction(
                    AiAuditLog.AiFeatureType.OPERATIONAL_INSIGHT,
                    null,
                    null,
                    prompt,
                    null,
                    System.currentTimeMillis() - startTime,
                    "FAILED",
                    e.getMessage());
            return fallbackInsights();
        }
    }

    private String buildOperationalContext(
            RevenueReportDto revenue,
            WaitTimeSummaryDto waitTime,
            java.util.List<DailyVolumeDto> volume,
            AiEffectivenessDto aiEffectiveness,
            BranchOperationalHeatmapDto heatmap) {

        StringBuilder sb = new StringBuilder();
        sb.append("1. Revenue: Total ").append(revenue.getTotalRevenue()).append("\n");
        sb.append("2. Wait Time: Avg ").append(waitTime.getAverageWaitMinutes()).append(" mins over ")
                .append(waitTime.getTotalCompletedEntries()).append(" patients.\n");
        sb.append("3. Volume Trends (Last 7 days): ")
                .append(volume.stream()
                        .map(v -> v.getDate() + ": Triage=" + v.getTriageCount() + ", Completed="
                                + v.getCompletedQueueEntries())
                        .collect(Collectors.joining("; ")))
                .append("\n");
        sb.append("4. AI Effectiveness: Match Rate=").append(aiEffectiveness.getMatchRate()).append(", Override Rate=")
                .append(aiEffectiveness.getOverrideRate()).append("\n");
        sb.append("5. Current Heatmap: Load=").append(heatmap.getSystemLoadLevel()).append(", Total Active=")
                .append(heatmap.getTotalActivePatients()).append("\n");

        return sb.toString();
    }

    private AiOperationalInsightDto parseInsights(String res) {
        try {
            String jsonPart = res;
            if (res.contains("{")) {
                jsonPart = res.substring(res.indexOf("{"), res.lastIndexOf("}") + 1);
            }
            return objectMapper.readValue(jsonPart, AiOperationalInsightDto.class);
        } catch (Exception e) {
            log.error("Failed to parse AI Operational Insights: {}", e.getMessage());
            return fallbackInsights();
        }
    }

    private AiOperationalInsightDto fallbackInsights() {
        return AiOperationalInsightDto.builder()
                .executiveSummary(
                        "Hệ thống hiện đang thu thập dữ liệu vận hành. Chưa có đủ thông tin để phân tích chuyên sâu.")
                .riskAssessment("N/A")
                .metrics(java.util.List.of())
                .recommendations(java.util.List.of())
                .forecasts(java.util.List.of())
                .leakageAlerts(java.util.List.of())
                .build();
    }

    private Bucket getBucket(UUID branchId) {
        return branchBuckets.computeIfAbsent(branchId, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofHours(1))))
                .build());
    }
}
