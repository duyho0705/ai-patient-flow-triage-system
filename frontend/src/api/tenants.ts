import { get, post, put } from './client'
import type { TenantDto, TenantBranchDto, CreateTenantRequest, CreateBranchRequest, UpdateTenantSettingsRequest } from '@/types/api'

export async function listTenants(): Promise<TenantDto[]> {
  return get<TenantDto[]>('/tenants', null)
}

export async function getTenant(id: string): Promise<TenantDto> {
  return get<TenantDto>(`/tenants/${id}`, null)
}

export async function getTenantByCode(code: string): Promise<TenantDto> {
  return get<TenantDto>(`/tenants/by-code/${code}`, null)
}

export async function createTenant(data: CreateTenantRequest): Promise<TenantDto> {
  return post<TenantDto>('/tenants', data, null)
}

export async function listBranches(tenantId: string): Promise<TenantBranchDto[]> {
  return get<TenantBranchDto[]>(`/tenants/${tenantId}/branches`, null)
}

export async function createBranch(data: CreateBranchRequest): Promise<TenantBranchDto> {
  return post<TenantBranchDto>('/tenants/branches', data, null)
}

export async function getBranch(id: string): Promise<TenantBranchDto> {
  return get<TenantBranchDto>(`/tenants/branches/${id}`, null)
}

export async function updateBranch(id: string, data: Partial<TenantBranchDto>): Promise<TenantBranchDto> {
  return put<TenantBranchDto>(`/tenants/branches/${id}`, data, null)
}

// System/Global Admin Settings
export async function updateTenantSettings(
  tenantId: string,
  settings: { enableAi?: boolean; aiProvider?: string; aiConfidenceThreshold?: number }
): Promise<TenantDto> {
  const settingsJson = JSON.stringify(settings)
  const req: UpdateTenantSettingsRequest = { settingsJson: settingsJson }
  return put<TenantDto>(`/tenants/${tenantId}/settings`, req, null)
}

export const getBranches = listBranches

