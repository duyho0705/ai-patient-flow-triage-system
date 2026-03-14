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

export async function sendDoctorChatFile(
    patientId: string,
    file: File,
    content: string | undefined,
    tenant: TenantHeaders | null
): Promise<PatientChatMessageDto> {
    const formData = new FormData()
    formData.append('file', file)
    if (content) formData.append('content', content)
    
    // We need a way to send multipart via our client, or use fetch
    const url = `/api/doctor-portal/chat/send-file/${patientId}`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            ...tenant
        } as HeadersInit,
        body: formData
    })
    
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Failed to upload chat file')
    return json.data
}
