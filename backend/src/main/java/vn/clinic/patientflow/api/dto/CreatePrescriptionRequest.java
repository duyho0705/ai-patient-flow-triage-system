package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePrescriptionRequest {
    @jakarta.validation.constraints.NotNull(message = "Phiên khám không được để trống")
    private UUID consultationId;

    private String notes;

    @jakarta.validation.constraints.NotEmpty(message = "Đơn thuốc phải có ít nhất một loại thuốc")
    private List<ItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemRequest {
        private UUID productId;
        private String productNameCustom;

        @jakarta.validation.constraints.NotNull(message = "Số lượng không được để trống")
        @jakarta.validation.constraints.Positive(message = "Số lượng phải lớn hơn 0")
        private BigDecimal quantity;

        @jakarta.validation.constraints.NotBlank(message = "Hướng dẫn sử dụng không được để trống")
        private String dosageInstruction;

        private BigDecimal unitPrice;
    }
}
