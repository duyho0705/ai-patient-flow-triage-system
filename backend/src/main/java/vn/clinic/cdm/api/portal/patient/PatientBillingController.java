package vn.clinic.cdm.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.billing.InvoiceDto;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientPortalService;
import vn.clinic.cdm.billing.service.BillingService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal/billing")
@RequiredArgsConstructor
@Tag(name = "Patient Billing", description = "Quản lý hóa đơn của bệnh nhân")
@PreAuthorize("hasRole('PATIENT')")
public class PatientBillingController {

    private final PatientPortalService portalService;
    private final BillingService billingService;

    @GetMapping("/invoices")
    @Operation(summary = "Lấy danh sách hóa đơn của bệnh nhân")
    public ResponseEntity<ApiResponse<List<InvoiceDto>>> getInvoices() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(billingService.getInvoicesByPatient(p.getId())));
    }

    @PostMapping("/invoices/{id}/pay")
    @Operation(summary = "Thanh toán hóa đơn")
    public ResponseEntity<ApiResponse<InvoiceDto>> payInvoice(
            @PathVariable UUID id,
            @RequestBody String paymentMethod) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(billingService.payInvoice(p.getId(), id, paymentMethod)));
    }
}
