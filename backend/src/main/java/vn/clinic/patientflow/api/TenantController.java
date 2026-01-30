package vn.clinic.patientflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.tenant.domain.Tenant;
import vn.clinic.patientflow.tenant.domain.TenantBranch;
import vn.clinic.patientflow.tenant.service.TenantService;

import java.util.List;
import java.util.UUID;

/**
 * Tenant and branch lookup (admin / bootstrap). No tenant context required.
 */
@RestController
@RequestMapping(value = "/api/tenants", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Tenant", description = "Phòng khám / chi nhánh")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping("/{id}")
    @Operation(summary = "Lấy tenant theo ID")
    public Tenant getById(@PathVariable UUID id) {
        return tenantService.getById(id);
    }

    @GetMapping("/by-code/{code}")
    @Operation(summary = "Lấy tenant theo mã")
    public Tenant getByCode(@PathVariable String code) {
        return tenantService.getByCode(code);
    }

    @GetMapping("/{tenantId}/branches")
    @Operation(summary = "Danh sách chi nhánh của tenant")
    public List<TenantBranch> getBranches(@PathVariable UUID tenantId) {
        return tenantService.getBranchesByTenantId(tenantId);
    }

    @GetMapping("/branches/{branchId}")
    @Operation(summary = "Lấy chi nhánh theo ID")
    public TenantBranch getBranchById(@PathVariable UUID branchId) {
        return tenantService.getBranchById(branchId);
    }
}
