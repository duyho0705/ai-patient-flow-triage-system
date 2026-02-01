package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Kết quả gợi ý acuity từ AI/rule (không ghi audit; audit khi tạo session với useAiSuggestion=true).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageSuggestionDto {

    /** Mức độ ưu tiên gợi ý (1–5 hoặc ESI). */
    private String suggestedAcuity;

    /** Độ tin cậy 0–1. */
    private BigDecimal confidence;

    /** Thời gian xử lý (ms). */
    private Integer latencyMs;

    /** Provider đã dùng (rule-based, ...). */
    private String providerKey;

    /** Giải thích ngắn gọn lý do AI đề xuất mức độ này (VD: "High priority: SpO2 89% + chest pain"). */
    private String explanation;
}
