package vn.clinic.cdm.dto.management;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReportDto {
    private int year;
    private int month;
    private long newPatients;
    private long totalConsultations;
    private double retentionRate;
    private double avgSatisfaction; // CSAT
    
    private List<WeeklyTrendDto> weeklyTrends;
    private Map<String, Long> diseaseDistribution;
    private List<DoctorPerformanceDto> topDoctors;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class WeeklyTrendDto {
    private String label;
    private long value;
}
