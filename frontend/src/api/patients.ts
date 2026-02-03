import { get, post, put } from './client'
import type { TenantHeaders } from './client'
import type { PatientDto, PagedResponse, CreatePatientRequest } from '@/types/api'

export async function listPatients(
  params: { page?: number; size?: number; query?: string },
  tenant: TenantHeaders | null
): Promise<PagedResponse<PatientDto>> {
  const sp = new URLSearchParams()
  if (params.page != null) sp.set('page', String(params.page))
  if (params.size != null) sp.set('size', String(params.size))
  if (params.query) sp.set('query', params.query)
  const q = sp.toString()
  return get<PagedResponse<PatientDto>>(`/patients${q ? `?${q}` : ''}`, tenant)
}

export async function getPatient(id: string, tenant: TenantHeaders | null): Promise<PatientDto> {
  return get<PatientDto>(`/patients/${id}`, tenant)
}

export async function findPatientByCccd(
  cccd: string,
  tenant: TenantHeaders | null
): Promise<PatientDto | null> {
  try {
    return await get<PatientDto>(`/patients/by-cccd?cccd=${encodeURIComponent(cccd)}`, tenant)
  } catch {
    return null
  }
}

export async function findPatientByPhone(
  phone: string,
  tenant: TenantHeaders | null
): Promise<PatientDto | null> {
  try {
    return await get<PatientDto>(`/patients/by-phone?phone=${encodeURIComponent(phone)}`, tenant)
  } catch {
    return null
  }
}

export async function createPatient(
  body: CreatePatientRequest,
  tenant: TenantHeaders | null
): Promise<PatientDto> {
  return post<PatientDto>('/patients', body, tenant)
}

export async function updatePatient(
  id: string,
  body: Partial<CreatePatientRequest>,
  tenant: TenantHeaders | null
): Promise<PatientDto> {
  return put<PatientDto>(`/patients/${id}`, body, tenant)
}
