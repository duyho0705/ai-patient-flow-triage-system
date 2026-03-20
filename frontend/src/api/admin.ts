import type {
  PagedResponse,
  AdminUserDto,
  CreateUserRequest,
  UpdateUserRequest,
  SetPasswordRequest,
  RoleDto,
  PermissionDto,
  AuditLogDto,
} from '@/types/api'
import { get, post, patch, put, del } from './client'

export async function getAuditLogs(params: {
  tenantId?: string | null
  action?: string | null
  startDate?: string | null
  page?: number
  size?: number
}): Promise<PagedResponse<AuditLogDto>> {
  const sp = new URLSearchParams()
  if (params.tenantId) sp.set('tenantId', params.tenantId)
  if (params.action) sp.set('action', params.action)
  if (params.startDate) sp.set('startDate', params.startDate)
  if (params.page != null) sp.set('page', String(params.page))
  if (params.size != null) sp.set('size', String(params.size))
  const q = sp.toString()
  return get<PagedResponse<AuditLogDto>>(`/admin/audit-logs${q ? `?${q}` : ''}`)
}

export async function getAdminUsers(params: {
  tenantId?: string | null
  page?: number
  size?: number
}): Promise<PagedResponse<AdminUserDto>> {
  const sp = new URLSearchParams()
  if (params.tenantId) sp.set('tenantId', params.tenantId)
  if (params.page != null) sp.set('page', String(params.page))
  if (params.size != null) sp.set('size', String(params.size))
  const q = sp.toString()
  return get<PagedResponse<AdminUserDto>>(`/admin/users${q ? `?${q}` : ''}`)
}

export async function getAdminUser(id: string): Promise<AdminUserDto> {
  return get<AdminUserDto>(`/admin/users/${id}`)
}

export async function createUser(body: CreateUserRequest): Promise<AdminUserDto> {
  return post<AdminUserDto>('/admin/users', body)
}

export async function updateUser(id: string, body: UpdateUserRequest): Promise<AdminUserDto> {
  return patch<AdminUserDto>(`/admin/users/${id}`, body)
}

export async function setPassword(id: string, body: SetPasswordRequest): Promise<void> {
  return patch<void>(`/admin/users/${id}/password`, body)
}

export async function deleteUser(id: string): Promise<void> {
  return del<void>(`/admin/users/${id}`)
}

export async function getRoles(): Promise<RoleDto[]> {
  return get<RoleDto[]>('/admin/roles')
}

export async function createRole(body: RoleDto): Promise<RoleDto> {
  return post<RoleDto>('/admin/roles', body)
}

export async function updateRole(id: string, body: RoleDto): Promise<RoleDto> {
  return put<RoleDto>(`/admin/roles/${id}`, body)
}

export async function deleteRole(id: string): Promise<void> {
  return del<void>(`/admin/roles/${id}`)
}

export async function getPermissions(): Promise<PermissionDto[]> {
  return get<PermissionDto[]>('/admin/permissions')
}



export interface SystemSettingDto {
    id: string
    settingKey: string
    settingValue: string
    description: string
    category: string
}

export async function getSystemSettings(): Promise<SystemSettingDto[]> {
    return get<SystemSettingDto[]>('/admin/settings')
}

export async function updateSystemSetting(key: string, value: string): Promise<SystemSettingDto> {
    return patch<SystemSettingDto>(`/admin/settings/${key}?value=${encodeURIComponent(value)}`)
}

export interface AdminDashboardDto {
    totalUsers: number
    activeUsers: number
    totalPatients: number
    totalDoctors: number
    totalRoles: number
    totalTenants: number
    totalBranches: number
    todayAuditLogs: number
    failedAuditLogs: number
    highRiskPatients: number
}

export async function getAdminDashboard(): Promise<AdminDashboardDto> {
    return get<AdminDashboardDto>('/admin/dashboard')
}
