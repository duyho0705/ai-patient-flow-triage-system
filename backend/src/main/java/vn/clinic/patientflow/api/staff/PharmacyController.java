package vn.clinic.patientflow.api.staff;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.common.tenant.TenantContext;
import vn.clinic.patientflow.pharmacy.domain.PharmacyInventory;
import vn.clinic.patientflow.pharmacy.domain.PharmacyProduct;
import vn.clinic.patientflow.pharmacy.repository.PharmacyInventoryRepository;
import vn.clinic.patientflow.pharmacy.repository.PharmacyProductRepository;
import vn.clinic.patientflow.pharmacy.service.PharmacyService;
import vn.clinic.patientflow.identity.service.IdentityService;
import vn.clinic.patientflow.common.service.AuditLogService;
import vn.clinic.patientflow.auth.AuthPrincipal;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pharmacy")
@RequiredArgsConstructor
@Tag(name = "Pharmacy", description = "Quản lý dược và kho thuốc")
public class PharmacyController {

    private final PharmacyProductRepository productRepository;
    private final PharmacyInventoryRepository inventoryRepository;
    private final vn.clinic.patientflow.pharmacy.repository.InventoryTransactionRepository transactionRepository;
    private final PharmacyService pharmacyService;
    private final IdentityService identityService;
    private final AuditLogService auditLogService;

    @GetMapping("/products")
    @Operation(summary = "Lấy danh mục thuốc")
    public ResponseEntity<ApiResponse<List<PharmacyProductDto>>> getProducts() {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        var data = productRepository.findByTenantId(tenantId)
                .stream().map(this::mapToProductDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/products")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Thêm thuốc mới vào danh mục")
    public ResponseEntity<ApiResponse<PharmacyProductDto>> createProduct(@RequestBody PharmacyProductDto dto) {
        UUID tenantId = TenantContext.getTenantIdOrThrow();
        PharmacyProduct product = PharmacyProduct.builder()
                .tenantId(tenantId)
                .code(dto.getCode())
                .nameVi(dto.getNameVi())
                .genericName(dto.getGenericName())
                .unit(dto.getUnit())
                .standardPrice(dto.getStandardPrice())
                .active(true)
                .build();
        product = productRepository.save(product);
        auditLogService.log("CREATE", "PHARMACY_PRODUCT", product.getId().toString(),
                "Thêm thuốc mới: " + product.getNameVi());
        return ResponseEntity.ok(ApiResponse.success(mapToProductDto(product)));
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLINIC_MANAGER')")
    @Operation(summary = "Cập nhật thông tin thuốc")
    public ResponseEntity<ApiResponse<PharmacyProductDto>> updateProduct(@PathVariable UUID id,
            @RequestBody PharmacyProductDto dto) {
        PharmacyProduct product = productRepository.findById(id)
                .orElseThrow(() -> new vn.clinic.patientflow.common.exception.ResourceNotFoundException(
                        "PharmacyProduct", id));

        product.setCode(dto.getCode());
        product.setNameVi(dto.getNameVi());
        product.setGenericName(dto.getGenericName());
        product.setUnit(dto.getUnit());
        product.setStandardPrice(dto.getStandardPrice());
        product.setActive(dto.isActive());

        product = productRepository.save(product);
        auditLogService.log("UPDATE", "PHARMACY_PRODUCT", id.toString(), "Cập nhật thuốc: " + product.getNameVi());
        return ResponseEntity.ok(ApiResponse.success(mapToProductDto(product)));
    }

    @GetMapping("/inventory")
    @Operation(summary = "Xem tồn kho của chi nhánh")
    public ResponseEntity<ApiResponse<List<PharmacyInventoryDto>>> getInventory(@RequestParam UUID branchId) {
        var data = inventoryRepository.findByBranchId(branchId)
                .stream().map(this::mapToInventoryDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/inventory/restock")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'CLINIC_MANAGER')")
    @Operation(summary = "Nhập thuốc vào kho")
    public ResponseEntity<ApiResponse<Void>> restock(@RequestParam UUID branchId,
            @RequestParam UUID productId,
            @RequestParam BigDecimal quantity,
            @RequestParam(required = false) String notes) {
        pharmacyService.addStock(branchId, productId, quantity,
                AuthPrincipal.getCurrentUserId(), notes);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/inventory/transactions")
    @Operation(summary = "Xem lịch sử nhập xuất kho")
    public ResponseEntity<ApiResponse<List<InventoryTransactionDto>>> getTransactions(
            @RequestParam UUID branchId) {
        var data = transactionRepository.findByBranchIdOrderByCreatedAtDesc(branchId)
                .stream().map(this::mapToTransactionDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    private InventoryTransactionDto mapToTransactionDto(
            vn.clinic.patientflow.pharmacy.domain.InventoryTransaction t) {
        String userName = null;
        if (t.getPerformedByUserId() != null) {
            try {
                userName = identityService.getUserById(t.getPerformedByUserId()).getFullNameVi();
            } catch (Exception e) {
                userName = "Hệ thống";
            }
        }

        return InventoryTransactionDto.builder()
                .id(t.getId())
                .branchId(t.getBranchId())
                .product(mapToProductDto(t.getProduct()))
                .type(t.getType().name())
                .quantity(t.getQuantity())
                .referenceId(t.getReferenceId())
                .performedByUserId(t.getPerformedByUserId())
                .performedByUserName(userName)
                .notes(t.getNotes())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private PharmacyProductDto mapToProductDto(PharmacyProduct p) {
        return PharmacyProductDto.builder()
                .id(p.getId())
                .code(p.getCode())
                .nameVi(p.getNameVi())
                .genericName(p.getGenericName())
                .unit(p.getUnit())
                .standardPrice(p.getStandardPrice())
                .active(p.isActive())
                .build();
    }

    private PharmacyInventoryDto mapToInventoryDto(PharmacyInventory i) {
        return PharmacyInventoryDto.builder()
                .id(i.getId())
                .branchId(i.getBranchId())
                .product(mapToProductDto(i.getProduct()))
                .currentStock(i.getCurrentStock())
                .minStockLevel(i.getMinStockLevel())
                .lastRestockAt(i.getLastRestockAt())
                .updatedAt(i.getUpdatedAt())
                .build();
    }
}
