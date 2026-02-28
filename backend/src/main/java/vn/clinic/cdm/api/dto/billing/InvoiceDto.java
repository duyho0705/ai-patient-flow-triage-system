package vn.clinic.cdm.api.dto.billing;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDto {
    private UUID id;
    private String invoiceNumber;
    private UUID patientId;
    private String patientName;
    private UUID consultationId;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String status;
    private String paymentMethod;
    private Instant paidAt;
    private Instant createdAt;
    private List<InvoiceItemDto> items;
}

