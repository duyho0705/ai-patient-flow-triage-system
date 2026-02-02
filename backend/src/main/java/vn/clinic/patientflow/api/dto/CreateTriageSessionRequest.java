package vn.clinic.patientflow.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTriageSessionRequest {

    @NotNull
    private UUID branchId;

    @NotNull
    private UUID patientId;

    private UUID appointmentId;

    private UUID triagedByUserId;

    @NotNull
    private Instant startedAt;

    /** Bắt buộc khi useAiSuggestion=false; bị ghi đè bởi AI khi useAiSuggestion=true. */
    @Size(max = 32)
    private String acuityLevel;

    @Size(max = 32)
    private String acuitySource;

    @Size(max = 32)
    private String aiSuggestedAcuity;

    private BigDecimal aiConfidenceScore;

    private String aiExplanation;

    private String chiefComplaintText;

    private String notes;

    /** Lý do override khi không chấp nhận gợi ý AI. */
    private String overrideReason;

    /** Nếu true: gọi AI gợi ý acuity, ghi audit; acuityLevel từ request bị ghi đè bởi kết quả AI. */
    private Boolean useAiSuggestion;

    private List<ComplaintItem> complaints;

    private List<VitalItem> vitals;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplaintItem {
        @Size(max = 64)
        private String complaintType;
        @NotNull
        @Size(max = 500)
        private String complaintText;
        private int displayOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VitalItem {
        @NotNull
        @Size(max = 32)
        private String vitalType;
        private java.math.BigDecimal valueNumeric;
        @Size(max = 20)
        private String unit;
        @NotNull
        private Instant recordedAt;
    }
}
