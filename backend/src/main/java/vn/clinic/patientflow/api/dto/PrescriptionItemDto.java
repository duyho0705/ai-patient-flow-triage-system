package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemDto {
    private UUID id;
    private UUID productId;
    private String productName;
    private BigDecimal quantity;
    private String dosageInstruction;
    private BigDecimal unitPrice;
    private BigDecimal availableStock;
}
