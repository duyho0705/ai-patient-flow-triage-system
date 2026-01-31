package vn.clinic.patientflow.api;

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

    @GetMapping("/users")
    @Operation(summary = "Danh sách user (phân trang, lọc theo tenant)")
    public PagedResponse<AdminUserDto> listUsers(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.listUsers(tenantId, PageRequest.of(page, size));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Chi tiết user")
    public ResponseEntity<AdminUserDto> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getUser(id));
    }

    @PostMapping("/users")
    @Operation(summary = "Tạo user và gán role")
    public ResponseEntity<AdminUserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(adminService.createUser(request));
    }

    @PatchMapping("/users/{id}")
    @Operation(summary = "Cập nhật user (profile + role assignments)")
    public ResponseEntity<AdminUserDto> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @PatchMapping("/users/{id}/password")
    @Operation(summary = "Đặt mật khẩu (admin)")
    public ResponseEntity<Void> setPassword(
            @PathVariable UUID id,
            @Valid @RequestBody SetPasswordRequest request) {
        adminService.setPassword(id, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    @Operation(summary = "Danh sách role")
    public List<RoleDto> getRoles() {
        return adminService.getRoles();
    }
}
