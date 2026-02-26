package vn.clinic.patientflow.api.admin;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import vn.clinic.patientflow.aiaudit.service.AiAuditServiceV2;
import vn.clinic.patientflow.api.dto.ApiResponse;
import vn.clinic.patientflow.api.dto.PagedResponse;
import vn.clinic.patientflow.aiaudit.domain.AiAuditLog;

/**
 * API AI Audit – Xem log tương tác AI (Enterprise Observability).
 * Yêu cầu X-Tenant-Id, X-Branch-Id.
 */
@RestController
@RequestMapping("/api/admin/ai-audit")
@RequiredArgsConstructor
@Tag(name = "AI Audit", description = "AI Audit + Observability")
public class AiAuditController {

    private final AiAuditServiceV2 aiAuditService;

    @GetMapping
    @Operation(summary = "Danh sách AI audit log theo chi nhánh")
    public ResponseEntity<ApiResponse<PagedResponse<AiAuditLog>>> listByBranch(
            @RequestParam UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var logs = aiAuditService.findByBranch(branchId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
