package vn.clinic.patientflow.api.portal.pharmacy;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.PrescriptionDto;
import vn.clinic.patientflow.clinical.service.ClinicalService;
import vn.clinic.patientflow.pharmacy.service.PharmacyAiService;
import vn.clinic.patientflow.pharmacy.repository.PharmacyInventoryRepository;
import vn.clinic.patientflow.pharmacy.domain.PharmacyInventory;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/pharmacy")
@RequiredArgsConstructor
@Tag(name = "Pharmacy Portal", description = "Cổng thông tin dành cho Dược sĩ")
@PreAuthorize("hasRole('PHARMACIST')")
public class PharmacyPortalController {

    private final ClinicalService clinicalService;
    private final PharmacyAiService pharmacyAiService;
    private final PharmacyInventoryRepository inventoryRepository;

    @GetMapping("/pending")
    @Operation(summary = "Danh sách đơn thuốc chờ cấp phát")
    public ResponseEntity<ApiResponse<List<PrescriptionDto>>> getPending(@RequestParam UUID branchId) {
        var data = clinicalService.getPendingPrescriptions(branchId).stream()
                .map(clinicalService::mapPrescriptionToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/inventory")
    @Operation(summary = "Kiểm tra tồn kho tại chi nhánh")
    public ResponseEntity<ApiResponse<List<PharmacyInventory>>> getInventory(@RequestParam UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryRepository.findByBranchId(branchId)));
    }

    @GetMapping("/drug-info")
    @Operation(summary = "Tra cứu thông tin thuốc bằng AI")
    public ResponseEntity<ApiResponse<String>> getDrugInfo(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(pharmacyAiService.searchDrugInfo(query)));
    }

    @PostMapping("/check-interactions")
    @Operation(summary = "Kiểm tra tương tác thuốc bằng AI")
    public ResponseEntity<ApiResponse<String>> checkInteractions(@RequestBody List<String> drugs) {
        return ResponseEntity.ok(ApiResponse.success(pharmacyAiService.checkInteractions(String.join(", ", drugs))));
    }
}
