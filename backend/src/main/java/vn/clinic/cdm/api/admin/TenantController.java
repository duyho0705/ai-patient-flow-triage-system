package vn.clinic.cdm.api.admin;

import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.tenant.TenantDto;
import vn.clinic.cdm.api.dto.tenant.CreateTenantRequest;
import vn.clinic.cdm.api.dto.tenant.TenantBranchDto;
import vn.clinic.cdm.api.dto.tenant.CreateBranchRequest;
import vn.clinic.cdm.api.dto.tenant.UpdateTenantSettingsRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.clinic.cdm.tenant.domain.Tenant;
import vn.clinic.cdm.tenant.domain.TenantBranch;
import vn.clinic.cdm.tenant.service.TenantService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Tenant and branch â€“ admin / bootstrap. No tenant context required.
 */
@RestController
@RequestMapping(value = "/api/tenants", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Tenant", description = "PhÃ²ng khÃ¡m / chi nhÃ¡nh")
public class TenantController {

        private final TenantService tenantService;

        @GetMapping
        @Operation(summary = "Danh sÃ¡ch tenant (phÃ²ng khÃ¡m) Ä‘ang hoáº¡t Ä‘á»™ng")
        public ResponseEntity<ApiResponse<List<TenantDto>>> list() {
                var data = tenantService.listAllActive().stream()
                                .map(TenantDto::fromEntity)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success(data));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Láº¥y tenant theo ID")
        public ResponseEntity<ApiResponse<TenantDto>> getById(@PathVariable UUID id) {
                return ResponseEntity.ok(ApiResponse.success(TenantDto.fromEntity(tenantService.getById(id))));
        }

        @GetMapping("/by-code/{code}")
        @Operation(summary = "Láº¥y tenant theo mÃ£")
        public ResponseEntity<ApiResponse<TenantDto>> getByCode(@PathVariable String code) {
                return ResponseEntity.ok(ApiResponse.success(TenantDto.fromEntity(tenantService.getByCode(code))));
        }

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        @Operation(summary = "Táº¡o tenant (phÃ²ng khÃ¡m)")
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
        @Operation(summary = "Danh sÃ¡ch chi nhÃ¡nh cá»§a tenant")
        public ResponseEntity<ApiResponse<List<TenantBranchDto>>> getBranches(@PathVariable UUID tenantId) {
                var data = tenantService.getBranchesByTenantId(tenantId).stream()
                                .map(TenantBranchDto::fromEntity)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success(data));
        }

        @PostMapping("/branches")
        @ResponseStatus(HttpStatus.CREATED)
        @Operation(summary = "Táº¡o chi nhÃ¡nh")
        public ResponseEntity<ApiResponse<TenantBranchDto>> createBranch(
                        @Valid @RequestBody CreateBranchRequest request) {
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
                                .body(ApiResponse.success(
                                                TenantBranchDto.fromEntity(tenantService.createBranch(branch))));
        }

        @GetMapping("/branches/{branchId}")
        @Operation(summary = "Láº¥y chi nhÃ¡nh theo ID")
        public ResponseEntity<ApiResponse<TenantBranchDto>> getBranchById(@PathVariable UUID branchId) {
                return ResponseEntity
                                .ok(ApiResponse.success(
                                                TenantBranchDto.fromEntity(tenantService.getBranchById(branchId))));
        }

        @PutMapping("/branches/{branchId}")
        @Operation(summary = "Cáº­p nháº­t chi nhÃ¡nh")
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
                                .ok(ApiResponse.success(TenantBranchDto
                                                .fromEntity(tenantService.updateBranch(branchId, details))));
        }

        @PutMapping("/{tenantId}/settings")
        @Operation(summary = "Cáº­p nháº­t cáº¥u hÃ¬nh tenant (Admin)")
        public ResponseEntity<ApiResponse<TenantDto>> updateSettings(@PathVariable UUID tenantId,
                        @RequestBody UpdateTenantSettingsRequest request) {
                return ResponseEntity.ok(ApiResponse
                                .success(TenantDto.fromEntity(
                                                tenantService.updateSettings(tenantId, request.getSettingsJson()))));
        }
}

