package vn.clinic.patientflow.api.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.patientflow.admin.AdminService;
import vn.clinic.patientflow.api.dto.*;

import java.util.List;
import java.util.UUID;

/**
 * API Admin – quản lý user, gán role. Chỉ role ADMIN.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Quản lý user và phân quyền (chỉ ADMIN)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final vn.clinic.patientflow.admin.AiSystemHealthService aiSystemHealthService;

    @GetMapping("/users")
    @Operation(summary = "Danh sách user (phân trang, lọc theo tenant)")
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserDto>>> listUsers(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.listUsers(tenantId, PageRequest.of(page, size))));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Chi tiết user")
    public ResponseEntity<ApiResponse<AdminUserDto>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUser(id)));
    }

    @PostMapping("/users")
    @Operation(summary = "Tạo user và gán role")
    public ResponseEntity<ApiResponse<AdminUserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.createUser(request)));
    }

    @PatchMapping("/users/{id}")
    @Operation(summary = "Cập nhật user (profile + role assignments)")
    public ResponseEntity<ApiResponse<AdminUserDto>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateUser(id, request)));
    }

    @PatchMapping("/users/{id}/password")
    @Operation(summary = "Đặt mật khẩu (admin)")
    public ResponseEntity<ApiResponse<Void>> setPassword(
            @PathVariable UUID id,
            @Valid @RequestBody SetPasswordRequest request) {
        adminService.setPassword(id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/roles")
    @Operation(summary = "Danh sách role")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getRoles() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRoles()));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Danh sách nhật ký hệ thống (Audit Log)")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> listAuditLogs(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.listAuditLogs(tenantId, PageRequest.of(page, size))));
    }

    @GetMapping("/revenue-report")
    @Operation(summary = "Báo cáo doanh thu")
    public ResponseEntity<ApiResponse<RevenueReportDto>> getRevenueReport(
            @RequestParam UUID branchId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate from,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRevenueReport(branchId, from, to)));
    }

    @GetMapping("/ai-health")
    @Operation(summary = "Theo dõi sức khỏe và chi phí hệ thống AI")
    public ResponseEntity<ApiResponse<AiSystemHealthDto>> getAiHealth() {
        return ResponseEntity.ok(ApiResponse.success(aiSystemHealthService.getSystemHealth()));
    }
}
