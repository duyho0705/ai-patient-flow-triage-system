package vn.clinic.cdm.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.clinic.cdm.service.admin.AdminService;
import vn.clinic.cdm.dto.admin.AdminDashboardDto;
import vn.clinic.cdm.dto.admin.SystemSettingDto;
import vn.clinic.cdm.dto.auth.*;
import vn.clinic.cdm.dto.clinical.AuditLogDto;
import vn.clinic.cdm.dto.common.ApiResponse;
import vn.clinic.cdm.dto.common.PagedResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "System Admin", description = "Quản trị hệ thống (Role 4)")
public class SystemAdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tổng quan Admin Dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Danh sách người dùng hệ thống")
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserDto>>> listUsers(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(adminService.listUsers(tenantId, pageable)));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminUserDto>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUser(id)));
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminUserDto>> createUser(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.createUser(request)));
    }

    @PatchMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminUserDto>> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateUser(id, request)));
    }

    @PatchMapping("/users/{id}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> setPassword(
            @PathVariable UUID id,
            @RequestBody SetPasswordRequest request) {
        adminService.setPassword(id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa tài khoản người dùng")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getRoles() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRoles()));
    }

    @PostMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleDto>> createRole(@RequestBody RoleDto request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.createRole(request)));
    }

    @PutMapping("/roles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleDto>> updateRole(@PathVariable UUID id, @RequestBody RoleDto request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateRole(id, request)));
    }

    @DeleteMapping("/roles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable UUID id) {
        adminService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getPermissions() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPermissions()));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Danh sách nhật ký hệ thống (Audit Logs)")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogDto>>> listAuditLogs(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) java.time.Instant startDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(adminService.listAuditLogs(tenantId, action, startDate, pageable)));
    }

    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Danh sách cấu hình hệ thống")
    public ResponseEntity<ApiResponse<List<SystemSettingDto>>> listSettings() {
        return ResponseEntity.ok(ApiResponse.success(adminService.listSystemSettings()));
    }

    @PutMapping("/settings/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật cấu hình hệ thống")
    public ResponseEntity<ApiResponse<SystemSettingDto>> updateSetting(
            @PathVariable String key,
            @RequestParam String value) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateSystemSetting(key, value)));
    }
}
