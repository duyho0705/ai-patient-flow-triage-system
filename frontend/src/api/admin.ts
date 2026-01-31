import { get, post, patch } from './client'
import type {
  PagedResponse,
  AdminUserDto,
  CreateUserRequest,
  UpdateUserRequest,
  SetPasswordRequest,
  RoleDto,
} from '@/types/api'

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

export async function getRoles(): Promise<RoleDto[]> {
  return get<RoleDto[]>('/admin/roles')
}
