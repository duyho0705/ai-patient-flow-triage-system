import { get } from './client'
import type { TenantDto, TenantBranchDto } from '@/types/api'

export async function listTenants(): Promise<TenantDto[]> {
  return get<TenantDto[]>('/tenants')
}

export async function getTenant(id: string): Promise<TenantDto> {
  return get<TenantDto>(`/tenants/${id}`)
}

export async function getTenantByCode(code: string): Promise<TenantDto> {
  return get<TenantDto>(`/tenants/by-code/${encodeURIComponent(code)}`)
}

export async function getBranches(tenantId: string): Promise<TenantBranchDto[]> {
  return get<TenantBranchDto[]>(`/tenants/${tenantId}/branches`)
}

export async function getBranch(branchId: string): Promise<TenantBranchDto> {
  return get<TenantBranchDto>(`/tenants/branches/${branchId}`)
}
