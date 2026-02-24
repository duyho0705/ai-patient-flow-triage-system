import { post } from './client'
import type { TenantHeaders } from './client'

export interface AiChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export interface AiChatRequest {
    message: string
    history?: AiChatMessage[]
}

export interface AiChatResponse {
    response: string
    suggestions: string[]
}

export async function getAiAssistantResponse(
    request: AiChatRequest,
    tenant: TenantHeaders | null
): Promise<AiChatResponse> {
    return post<AiChatResponse>('/portal/ai/assistant', request, tenant)
}
