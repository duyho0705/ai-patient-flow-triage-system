package vn.clinic.cdm.api.dto.tenant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchOperationalHeatmapDto {
    private String branchName;
    private Map<String, Long> queueDensity;
    private Long totalActivePatients;
    private String systemLoadLevel; // LOW, NORMAL, HIGH, CRITICAL
    private String predictiveInsight;
}

