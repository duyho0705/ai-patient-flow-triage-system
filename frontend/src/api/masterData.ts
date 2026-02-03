import { get, post, put } from './client'
import type { TenantHeaders } from './client'
import type { MedicalServiceDto } from '@/types/api'

export async function listMedicalServices(params: { onlyActive?: boolean }, tenant: TenantHeaders | null): Promise<MedicalServiceDto[]> {
    const sp = new URLSearchParams()
    if (params.onlyActive) sp.set('onlyActive', 'true')
    return get<MedicalServiceDto[]>(`/master-data/medical-services?${sp.toString()}`, tenant)
}

export async function createMedicalService(data: Partial<MedicalServiceDto>, tenant: TenantHeaders | null): Promise<MedicalServiceDto> {
    return post<MedicalServiceDto>('/master-data/medical-services', data, tenant)
}

export async function updateMedicalService(id: string, data: Partial<MedicalServiceDto>, tenant: TenantHeaders | null): Promise<MedicalServiceDto> {
    return put<MedicalServiceDto>(`/master-data/medical-services/${id}`, data, tenant)
}
