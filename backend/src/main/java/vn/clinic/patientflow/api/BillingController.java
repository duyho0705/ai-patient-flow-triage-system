package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.CreateInvoiceRequest;
import vn.clinic.patientflow.api.dto.InvoiceDto;
import vn.clinic.patientflow.billing.domain.Invoice;
import vn.clinic.patientflow.billing.domain.InvoiceItem;
import vn.clinic.patientflow.billing.service.BillingService;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.tenant.domain.TenantBranch;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/billing/invoices", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Quản lý viện phí và thanh toán")
public class BillingController {

    private final BillingService billingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Tạo hóa đơn mới")
    public InvoiceDto create(@Valid @RequestBody CreateInvoiceRequest request) {
        Invoice invoice = Invoice.builder()
                .patient(new Patient(request.getPatientId()))
                .branch(request.getBranchId() != null ? new TenantBranch(request.getBranchId()) : null)
                .consultation(
                        request.getConsultationId() != null ? new ClinicalConsultation(request.getConsultationId())
                                : null)
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .status("PENDING")
                .items(request.getItems().stream().map(itemReq -> InvoiceItem.builder()
                        .itemCode(itemReq.getItemCode())
                        .itemName(itemReq.getItemName())
                        .quantity(itemReq.getQuantity())
                        .unitPrice(itemReq.getUnitPrice())
                        .lineTotal(itemReq.getQuantity().multiply(itemReq.getUnitPrice()))
                        .build()).collect(Collectors.toList()))
                .build();

        return InvoiceDto.fromEntity(billingService.createInvoice(invoice));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'CLINIC_MANAGER', 'DOCTOR')")
    @Operation(summary = "Lấy chi tiết hóa đơn")
    public InvoiceDto getById(@PathVariable UUID id) {
        return InvoiceDto.fromEntity(billingService.getById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Danh sách hóa đơn")
    public java.util.List<InvoiceDto> list(@RequestParam UUID branchId,
            @RequestParam(required = false) String status) {
        return billingService.getInvoices(branchId, status).stream()
                .map(InvoiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Xác nhận thanh toán hóa đơn")
    public InvoiceDto pay(@PathVariable UUID id, @RequestParam String paymentMethod) {
        return InvoiceDto.fromEntity(billingService.markAsPaid(id, paymentMethod));
    }
}
