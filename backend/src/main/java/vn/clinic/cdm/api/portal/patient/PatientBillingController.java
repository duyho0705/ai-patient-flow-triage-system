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
@Tag(name = "Patient Billing", description = "Quáº£n lÃ½ hÃ³a Ä‘Æ¡n cá»§a bá»‡nh nhÃ¢n")
@PreAuthorize("hasRole('PATIENT')")
public class PatientBillingController {

    private final PatientPortalService portalService;
    private final BillingService billingService;

    @GetMapping("/invoices")
    @Operation(summary = "Láº¥y danh sÃ¡ch hÃ³a Ä‘Æ¡n cá»§a bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<List<InvoiceDto>>> getInvoices() {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(billingService.getInvoicesByPatient(p.getId())));
    }

    @PostMapping("/invoices/{id}/pay")
    @Operation(summary = "Thanh toÃ¡n hÃ³a Ä‘Æ¡n")
    public ResponseEntity<ApiResponse<InvoiceDto>> payInvoice(
            @PathVariable UUID id,
            @RequestBody String paymentMethod) {
        Patient p = portalService.getAuthenticatedPatient();
        return ResponseEntity.ok(ApiResponse.success(billingService.payInvoice(p.getId(), id, paymentMethod)));
    }
}

