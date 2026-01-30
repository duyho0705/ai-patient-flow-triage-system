package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.api.dto.CreateBranchRequest;
import vn.clinic.patientflow.api.dto.CreateTenantRequest;
import vn.clinic.patientflow.api.dto.TenantBranchDto;
import vn.clinic.patientflow.api.dto.TenantDto;
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

    @GetMapping("/{id}")
    @Operation(summary = "Lấy tenant theo ID")
    public TenantDto getById(@PathVariable UUID id) {
        return TenantDto.fromEntity(tenantService.getById(id));
    }

    @GetMapping("/by-code/{code}")
    @Operation(summary = "Lấy tenant theo mã")
    public TenantDto getByCode(@PathVariable String code) {
        return TenantDto.fromEntity(tenantService.getByCode(code));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo tenant (phòng khám)")
    public TenantDto create(@Valid @RequestBody CreateTenantRequest request) {
        Tenant tenant = Tenant.builder()
                .code(request.getCode())
                .nameVi(request.getNameVi())
                .nameEn(request.getNameEn())
                .taxCode(request.getTaxCode())
                .locale(request.getLocale() != null ? request.getLocale() : "vi-VN")
                .timezone(request.getTimezone() != null ? request.getTimezone() : "Asia/Ho_Chi_Minh")
                .build();
        return TenantDto.fromEntity(tenantService.createTenant(tenant));
    }

    @GetMapping("/{tenantId}/branches")
    @Operation(summary = "Danh sách chi nhánh của tenant")
    public List<TenantBranchDto> getBranches(@PathVariable UUID tenantId) {
        return tenantService.getBranchesByTenantId(tenantId).stream()
                .map(TenantBranchDto::fromEntity)
                .collect(Collectors.toList());
    }

    @PostMapping("/branches")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo chi nhánh")
    public TenantBranchDto createBranch(@Valid @RequestBody CreateBranchRequest request) {
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
        return TenantBranchDto.fromEntity(tenantService.createBranch(branch));
    }

    @GetMapping("/branches/{branchId}")
    @Operation(summary = "Lấy chi nhánh theo ID")
    public TenantBranchDto getBranchById(@PathVariable UUID branchId) {
        return TenantBranchDto.fromEntity(tenantService.getBranchById(branchId));
    }
}
