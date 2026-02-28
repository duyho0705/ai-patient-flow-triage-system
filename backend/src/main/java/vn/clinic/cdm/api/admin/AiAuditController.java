package vn.clinic.cdm.api.admin;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import vn.clinic.cdm.aiaudit.domain.AiAuditLog;
import vn.clinic.cdm.aiaudit.repository.AiAuditLogRepository;
import vn.clinic.cdm.api.dto.common.ApiResponse;
import vn.clinic.cdm.api.dto.common.PagedResponse;

/**
 * API AI Audit â€“ Xem log tÆ°Æ¡ng tÃ¡c AI (Enterprise Observability).
 * YÃªu cáº§u X-Tenant-Id, X-Branch-Id.
 */
@RestController
@RequestMapping("/api/admin/ai-audit")
@RequiredArgsConstructor
@Tag(name = "AI Audit", description = "AI Audit + Observability")
public class AiAuditController {

    private final AiAuditLogRepository aiAuditLogRepository;

    @GetMapping
    @Operation(summary = "Danh sÃ¡ch AI audit log theo chi nhÃ¡nh")
    public ResponseEntity<ApiResponse<PagedResponse<AiAuditLog>>> listByBranch(
            @RequestParam UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AiAuditLog> logs = aiAuditLogRepository.findByBranchIdOrderByCreatedAtDesc(
                branchId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(logs)));
    }
}

