package vn.clinic.cdm.api.dto.medication;

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
    @jakarta.validation.constraints.NotNull(message = "PhiÃªn khÃ¡m khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private UUID consultationId;

    private String notes;

    @jakarta.validation.constraints.NotEmpty(message = "ÄÆ¡n thuá»‘c pháº£i cÃ³ Ã­t nháº¥t má»™t loáº¡i thuá»‘c")
    private List<ItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemRequest {
        private UUID productId;
        private String productNameCustom;

        @jakarta.validation.constraints.NotNull(message = "Sá»‘ lÆ°á»£ng khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
        @jakarta.validation.constraints.Positive(message = "Sá»‘ lÆ°á»£ng pháº£i lá»›n hÆ¡n 0")
        private BigDecimal quantity;

        @jakarta.validation.constraints.NotBlank(message = "HÆ°á»›ng dáº«n sá»­ dá»¥ng khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
        private String dosageInstruction;

        private BigDecimal unitPrice;
    }
}

