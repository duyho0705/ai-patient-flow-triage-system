package vn.clinic.patientflow.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.CreateInvoiceRequest;
import vn.clinic.patientflow.api.dto.InvoiceDto;
import vn.clinic.patientflow.api.dto.RevenueReportDto;
import vn.clinic.patientflow.billing.domain.Invoice;
import vn.clinic.patientflow.billing.domain.InvoiceItem;
import vn.clinic.patientflow.billing.service.BillingService;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.tenant.domain.TenantBranch;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/billing/invoices", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Quản lý viện phí và thanh toán")
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'CLINIC_MANAGER')")
public class BillingController {

    private final BillingService billingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo hóa đơn mới")
    public ResponseEntity<ApiResponse<InvoiceDto>> create(@Valid @RequestBody CreateInvoiceRequest request) {
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

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(InvoiceDto.fromEntity(billingService.createInvoice(invoice))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'CLINIC_MANAGER', 'DOCTOR')")
    @Operation(summary = "Lấy chi tiết hóa đơn")
    public ResponseEntity<ApiResponse<InvoiceDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(InvoiceDto.fromEntity(billingService.getById(id))));
    }

    @GetMapping
    @Operation(summary = "Danh sách hóa đơn")
    public ResponseEntity<ApiResponse<List<InvoiceDto>>> list(@RequestParam UUID branchId,
            @RequestParam(required = false) String status) {
        var data = billingService.getInvoices(branchId, status).stream()
                .map(InvoiceDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Xác nhận thanh toán hóa đơn")
    public ResponseEntity<ApiResponse<InvoiceDto>> pay(@PathVariable UUID id, @RequestParam String paymentMethod) {
        return ResponseEntity
                .ok(ApiResponse.success(InvoiceDto.fromEntity(billingService.markAsPaid(id, paymentMethod))));
    }

    @GetMapping("/report/revenue")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Báo cáo doanh thu theo chi nhánh và khoảng thời gian")
    public ResponseEntity<ApiResponse<RevenueReportDto>> getRevenueReport(
            @RequestParam UUID branchId,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getRevenueReport(branchId, from, to)));
    }
}
