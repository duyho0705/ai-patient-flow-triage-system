import { get } from './client'
import type { TenantHeaders } from './client'
import type { AiTriageAuditDto, PagedResponse } from '@/types/api'

export async function listAiAudits(
  params: { branchId: string; page?: number; size?: number },
  tenant: TenantHeaders | null
): Promise<PagedResponse<AiTriageAuditDto>> {
  const sp = new URLSearchParams()
  sp.set('branchId', params.branchId)
  if (params.page != null) sp.set('page', String(params.page))
  if (params.size != null) sp.set('size', String(params.size))
  return get<PagedResponse<AiTriageAuditDto>>(`/ai-audit?${sp}`, tenant)
}
