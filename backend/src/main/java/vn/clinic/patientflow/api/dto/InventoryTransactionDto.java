package vn.clinic.patientflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionDto {
    private UUID id;
    private UUID branchId;
    private PharmacyProductDto product;
    private String type;
    private BigDecimal quantity;
    private UUID referenceId;
    private UUID performedByUserId;
    private String performedByUserName;
    private String notes;
    private Instant createdAt;
}
