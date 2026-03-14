package vn.clinic.cdm.api.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenericReportDto {
    private String title;
    private String subtitle;
    private String doctorName;
    private String patientName;
    private String date;
    private String summary;
    private List<ReportSection> sections;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ReportSection {
        private String title;
        private String content;
    }
}
