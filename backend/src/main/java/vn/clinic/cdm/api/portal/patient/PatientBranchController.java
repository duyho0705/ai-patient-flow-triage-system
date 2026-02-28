package vn.clinic.cdm.api.portal.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.tenant.TenantBranchDto;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.service.PatientPortalService;
import vn.clinic.cdm.tenant.service.TenantService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/branches")
@RequiredArgsConstructor
@Tag(name = "Patient Branches", description = "Danh sÃ¡ch chi nhÃ¡nh cho Ä‘áº·t lá»‹ch")
@PreAuthorize("hasRole('PATIENT')")
public class PatientBranchController {

    private final PatientPortalService portalService;
    private final TenantService tenantService;

    @GetMapping
    @Operation(summary = "Láº¥y danh sÃ¡ch chi nhÃ¡nh cá»§a tenant bá»‡nh nhÃ¢n")
    public ResponseEntity<ApiResponse<List<TenantBranchDto>>> getBranches() {
        Patient p = portalService.getAuthenticatedPatient();
        var branches = tenantService.getBranchesByTenantId(p.getTenant().getId()).stream()
                .map(TenantBranchDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(branches));
    }
}

