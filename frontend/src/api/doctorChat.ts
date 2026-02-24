import { get, post } from './client'
import type { TenantHeaders } from './client'
import type { PatientChatConversationDto, PatientChatMessageDto } from '@/types/api'

export async function getDoctorChatConversations(tenant: TenantHeaders | null): Promise<PatientChatConversationDto[]> {
    return get<PatientChatConversationDto[]>('/doctor-portal/chat/conversations', tenant)
}

export async function getDoctorChatHistory(patientId: string, tenant: TenantHeaders | null): Promise<PatientChatMessageDto[]> {
    return get<PatientChatMessageDto[]>(`/doctor-portal/chat/history/${patientId}`, tenant)
}

export async function sendDoctorChatMessage(patientId: string, content: string, tenant: TenantHeaders | null): Promise<PatientChatMessageDto> {
    return post<PatientChatMessageDto>(`/doctor-portal/chat/send/${patientId}`, content, tenant)
}
