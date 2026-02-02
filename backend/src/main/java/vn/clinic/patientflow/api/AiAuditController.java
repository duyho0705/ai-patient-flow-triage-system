package vn.clinic.patientflow.api;

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
import vn.clinic.patientflow.aiaudit.service.AiAuditService;
import vn.clinic.patientflow.api.dto.AiTriageAuditDto;
import vn.clinic.patientflow.api.dto.PagedResponse;

/**
 * API AI Audit – so sánh đề xuất AI vs quyết định thực tế (Explainability).
 * Yêu cầu X-Tenant-Id, X-Branch-Id.
 */
@RestController
@RequestMapping("/api/ai-audit")
@RequiredArgsConstructor
@Tag(name = "AI Audit", description = "AI Audit + Explainability")
public class AiAuditController {

    private final AiAuditService aiAuditService;

    @GetMapping
    @Operation(summary = "Danh sách AI audit theo chi nhánh", description = "So sánh suggested acuity vs actual acuity (quyết định con người)")
    public ResponseEntity<PagedResponse<AiTriageAuditDto>> listByBranch(
            @RequestParam UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<AiTriageAuditDto> body = aiAuditService.listAuditsByBranch(
                branchId, PageRequest.of(page, size));
        return ResponseEntity.ok(body);
    }
}
