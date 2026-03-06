package vn.clinic.cdm.api.dto.messaging;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request gửi lời khuyên / cảnh báo cho bệnh nhân.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendAdviceRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(max = 2000)
    private String content;

    /** ADVICE | ALERT | RECOMMENDATION */
    @Builder.Default
    private String type = "ADVICE";

    /** Mức độ: INFO, WARNING, CRITICAL */
    @Builder.Default
    private String severity = "INFO";
}
