import { get, post } from './client'
import type { TenantHeaders } from './client'
import type {
  TriageSessionDto,
  TriageSuggestionDto,
  SuggestAcuityRequest,
  CreateTriageSessionRequest,
  PagedResponse,
} from '@/types/api'

export async function suggestAcuity(
  body: SuggestAcuityRequest,
  tenant: TenantHeaders | null
): Promise<TriageSuggestionDto> {
  return post<TriageSuggestionDto>('/triage/suggest', body, tenant)
}

export async function createTriageSession(
  body: CreateTriageSessionRequest,
  tenant: TenantHeaders | null
): Promise<TriageSessionDto> {
  return post<TriageSessionDto>('/triage/sessions', body, tenant)
}

export async function getTriageSession(
  id: string,
  tenant: TenantHeaders | null
): Promise<TriageSessionDto> {
  return get<TriageSessionDto>(`/triage/sessions/${id}`, tenant)
}

export async function listTriageSessions(
  params: { branchId: string; page?: number; size?: number },
  tenant: TenantHeaders | null
): Promise<PagedResponse<TriageSessionDto>> {
  const sp = new URLSearchParams({ branchId: params.branchId })
  if (params.page != null) sp.set('page', String(params.page))
  if (params.size != null) sp.set('size', String(params.size))
  return get<PagedResponse<TriageSessionDto>>(`/triage/sessions?${sp}`, tenant)
}
