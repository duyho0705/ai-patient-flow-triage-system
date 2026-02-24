package vn.clinic.patientflow.api.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.*;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.service.TenantService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Tenant and branch – admin / bootstrap. No tenant context required.
 */
@RestController
@RequestMapping(value = "/api/tenants", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Tenant", description = "Phòng khám / chi nhánh")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    @Operation(summary = "Danh sách tenant (phòng khám) đang hoạt động")
    public ResponseEntity<ApiResponse<List<TenantDto>>> list() {
        var data = tenantService.listAllActive().stream()
                .map(TenantDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy tenant theo ID")
    public ResponseEntity<ApiResponse<TenantDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(TenantDto.fromEntity(tenantService.getById(id))));
    }

    @GetMapping("/by-code/{code}")
    @Operation(summary = "Lấy tenant theo mã")
    public ResponseEntity<ApiResponse<TenantDto>> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(TenantDto.fromEntity(tenantService.getByCode(code))));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo tenant (phòng khám)")
    public ResponseEntity<ApiResponse<TenantDto>> create(@Valid @RequestBody CreateTenantRequest request) {
        Tenant tenant = Tenant.builder()
                .code(request.getCode())
                .nameVi(request.getNameVi())
                .nameEn(request.getNameEn())
                .taxCode(request.getTaxCode())
                .locale(request.getLocale() != null ? request.getLocale() : "vi-VN")
                .timezone(request.getTimezone() != null ? request.getTimezone() : "Asia/Ho_Chi_Minh")
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(TenantDto.fromEntity(tenantService.createTenant(tenant))));
    }

    @GetMapping("/{tenantId}/branches")
    @Operation(summary = "Danh sách chi nhánh của tenant")
    public ResponseEntity<ApiResponse<List<TenantBranchDto>>> getBranches(@PathVariable UUID tenantId) {
        var data = tenantService.getBranchesByTenantId(tenantId).stream()
                .map(TenantBranchDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/branches")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo chi nhánh")
    public ResponseEntity<ApiResponse<TenantBranchDto>> createBranch(@Valid @RequestBody CreateBranchRequest request) {
        Tenant tenant = tenantService.getById(request.getTenantId());
        TenantBranch branch = TenantBranch.builder()
                .tenant(tenant)
                .code(request.getCode())
                .nameVi(request.getNameVi())
                .addressLine(request.getAddressLine())
                .city(request.getCity())
                .district(request.getDistrict())
                .ward(request.getWard())
                .phone(request.getPhone())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(TenantBranchDto.fromEntity(tenantService.createBranch(branch))));
    }

    @GetMapping("/branches/{branchId}")
    @Operation(summary = "Lấy chi nhánh theo ID")
    public ResponseEntity<ApiResponse<TenantBranchDto>> getBranchById(@PathVariable UUID branchId) {
        return ResponseEntity
                .ok(ApiResponse.success(TenantBranchDto.fromEntity(tenantService.getBranchById(branchId))));
    }

    @PutMapping("/branches/{branchId}")
    @Operation(summary = "Cập nhật chi nhánh")
    public ResponseEntity<ApiResponse<TenantBranchDto>> updateBranch(@PathVariable UUID branchId,
            @RequestBody TenantBranchDto dto) {
        TenantBranch details = TenantBranch.builder()
                .nameVi(dto.getNameVi())
                .addressLine(dto.getAddressLine())
                .city(dto.getCity())
                .district(dto.getDistrict())
                .ward(dto.getWard())
                .phone(dto.getPhone())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        return ResponseEntity
                .ok(ApiResponse.success(TenantBranchDto.fromEntity(tenantService.updateBranch(branchId, details))));
    }

    @PutMapping("/{tenantId}/settings")
    @Operation(summary = "Cập nhật cấu hình tenant (Admin)")
    public ResponseEntity<ApiResponse<TenantDto>> updateSettings(@PathVariable UUID tenantId,
            @RequestBody UpdateTenantSettingsRequest request) {
        return ResponseEntity.ok(ApiResponse
                .success(TenantDto.fromEntity(tenantService.updateSettings(tenantId, request.getSettingsJson()))));
    }
}
