package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.CreatePrescriptionRequest;
import vn.clinic.patientflow.api.dto.PrescriptionDto;
import vn.clinic.patientflow.api.dto.PrescriptionItemDto;
import vn.clinic.patientflow.clinical.domain.Prescription;
import vn.clinic.patientflow.clinical.service.ClinicalService;

import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescription", description = "Quản lý đơn thuốc")
public class PrescriptionController {

    private final ClinicalService clinicalService;
    private final vn.clinic.patientflow.billing.service.BillingService billingService;
    private final vn.clinic.patientflow.pharmacy.repository.PharmacyInventoryRepository inventoryRepository;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Tạo đơn thuốc cho phiên khám")
    public ResponseEntity<PrescriptionDto> createPrescription(@RequestBody CreatePrescriptionRequest request) {
        Prescription p = clinicalService.createPrescription(request);
        return ResponseEntity.ok(mapToDto(p));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    @Operation(summary = "Lấy danh sách đơn thuốc chờ cấp phát")
    public ResponseEntity<java.util.List<PrescriptionDto>> getPendingPrescriptions(@RequestParam UUID branchId) {
        var list = clinicalService.getPendingPrescriptions(branchId);
        return ResponseEntity.ok(list.stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    @PostMapping("/{id}/dispense")
    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    @Operation(summary = "Xác nhận đã cấp phát thuốc (Trừ kho)")
    public ResponseEntity<Void> dispensePrescription(@PathVariable UUID id) {
        clinicalService.dispensePrescription(id, vn.clinic.patientflow.auth.AuthPrincipal.getCurrentUserId());
        return ResponseEntity.ok().build();
    }

    private PrescriptionDto mapToDto(Prescription p) {
        String invoiceStatus = billingService.getInvoiceByConsultation(p.getConsultation().getId())
                .map(vn.clinic.patientflow.billing.domain.Invoice::getStatus)
                .orElse("UNKNOWN");

        return PrescriptionDto.builder()
                .id(p.getId())
                .consultationId(p.getConsultation().getId())
                .patientId(p.getPatient().getId())
                .patientName(p.getPatient().getFullNameVi())
                .doctorUserId(p.getDoctorUserId())
                .status(p.getStatus().name())
                .notes(p.getNotes())
                .invoiceStatus(invoiceStatus)
                .items(p.getItems().stream().map(item -> {
                    java.math.BigDecimal stock = java.math.BigDecimal.ZERO;
                    if (item.getProduct() != null) {
                        stock = inventoryRepository
                                .findByBranchIdAndProductId(p.getConsultation().getBranch().getId(),
                                        item.getProduct().getId())
                                .map(vn.clinic.patientflow.pharmacy.domain.PharmacyInventory::getCurrentStock)
                                .orElse(java.math.BigDecimal.ZERO);
                    }

                    return PrescriptionItemDto.builder()
                            .id(item.getId())
                            .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                            .productName(
                                    item.getProduct() != null ? item.getProduct().getNameVi()
                                            : item.getProductNameCustom())
                            .quantity(item.getQuantity())
                            .dosageInstruction(item.getDosageInstruction())
                            .unitPrice(item.getUnitPrice())
                            .availableStock(stock)
                            .build();
                }).collect(Collectors.toList()))
                .build();
    }
}
