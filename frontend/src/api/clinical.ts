import { get, post, patch } from './client'
import type { TenantHeaders } from './client'
import type { ConsultationDto, CreateConsultationRequest } from '@/types/api'

export async function getConsultation(
    id: string,
    tenant: TenantHeaders | null
): Promise<ConsultationDto> {
    return get<ConsultationDto>(`/clinical/consultations/${id}`, tenant)
}

export async function getPatientHistory(
    patientId: string,
    tenant: TenantHeaders | null
): Promise<ConsultationDto[]> {
    return get<ConsultationDto[]>(`/clinical/consultations/history?patientId=${patientId}`, tenant)
}

export async function startConsultation(
    request: CreateConsultationRequest,
    tenant: TenantHeaders | null
): Promise<ConsultationDto> {
    return post<ConsultationDto>('/clinical/consultations', request, tenant)
}

export async function updateConsultation(
    id: string,
    request: CreateConsultationRequest,
    tenant: TenantHeaders | null
): Promise<ConsultationDto> {
    return patch<ConsultationDto>(`/clinical/consultations/${id}`, request, tenant)
}

export async function completeConsultation(
    id: string,
    tenant: TenantHeaders | null
): Promise<ConsultationDto> {
    return post<ConsultationDto>(`/clinical/consultations/${id}/complete`, undefined, tenant)
}
