package vn.clinic.cdm.billing.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.api.dto.billing.InvoiceDto;
import vn.clinic.cdm.api.dto.billing.InvoiceItemDto;
import vn.clinic.cdm.billing.domain.BillingInvoice;
import vn.clinic.cdm.billing.domain.BillingInvoiceItem;
import vn.clinic.cdm.billing.repository.BillingInvoiceRepository;
import vn.clinic.cdm.common.exception.ResourceNotFoundException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BillingService {

    private final BillingInvoiceRepository invoiceRepository;

    public List<InvoiceDto> getInvoicesByPatient(UUID patientId) {
        return invoiceRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceDto payInvoice(UUID patientId, UUID invoiceId, String method) {
        BillingInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));

        if (!invoice.getPatient().getId().equals(patientId)) {
            throw new ResourceNotFoundException("Invoice", invoiceId);
        }

        invoice.setStatus("PAID");
        invoice.setPaymentMethod(method.replace("\"", "")); // Clean up JSON string
        invoice.setPaidAt(Instant.now());

        return mapToDto(invoiceRepository.save(invoice));
    }

    public InvoiceDto mapToDto(BillingInvoice entity) {
        return InvoiceDto.builder()
                .id(entity.getId())
                .invoiceNumber(entity.getInvoiceNumber())
                .patientId(entity.getPatient().getId())
                .patientName(entity.getPatient().getFullNameVi())
                .consultationId(entity.getConsultationId())
                .totalAmount(entity.getTotalAmount())
                .discountAmount(entity.getDiscountAmount())
                .finalAmount(entity.getFinalAmount())
                .status(entity.getStatus())
                .paymentMethod(entity.getPaymentMethod())
                .paidAt(entity.getPaidAt())
                .createdAt(entity.getCreatedAt())
                .items(entity.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList()))
                .build();
    }

    private InvoiceItemDto mapItemToDto(BillingInvoiceItem item) {
        return InvoiceItemDto.builder()
                .id(item.getId())
                .itemCode(item.getItemCode())
                .itemName(item.getItemName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .build();
    }
}

