package vn.clinic.cdm.service.admin;

import org.springframework.data.domain.Pageable;
import vn.clinic.cdm.dto.admin.AdminDashboardDto;
import vn.clinic.cdm.dto.admin.SystemSettingDto;
import vn.clinic.cdm.dto.auth.*;
import vn.clinic.cdm.dto.clinical.AuditLogDto;
import vn.clinic.cdm.dto.common.PagedResponse;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    AdminDashboardDto getDashboard();
    
    PagedResponse<AdminUserDto> listUsers(UUID tenantId, Pageable pageable);
    
    AdminUserDto getUser(UUID userId);
    
    AdminUserDto createUser(CreateUserRequest request);
    
    AdminUserDto updateUser(UUID userId, UpdateUserRequest request);
    
    void setPassword(UUID userId, SetPasswordRequest request);
    
    void deleteUser(UUID userId);
    
    List<RoleDto> getRoles();
    
    List<PermissionDto> getPermissions();
    
    RoleDto createRole(RoleDto request);
    
    RoleDto getRole(UUID id);
    
    RoleDto updateRole(UUID id, RoleDto request);
    
    void deleteRole(UUID id);
    
    PagedResponse<AuditLogDto> listAuditLogs(UUID tenantId, String action, java.time.Instant startDate, Pageable pageable);
    
    List<SystemSettingDto> listSystemSettings();
    
    SystemSettingDto updateSystemSetting(String key, String value);
}
