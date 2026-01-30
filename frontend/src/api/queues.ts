import { get, post, patch } from './client'
import type { TenantHeaders } from './client'
import type {
  QueueDefinitionDto,
  QueueEntryDto,
  UpdateQueueEntryRequest,
} from '@/types/api'

export async function getQueueDefinitions(
  branchId: string,
  tenant: TenantHeaders | null
): Promise<QueueDefinitionDto[]> {
  return get<QueueDefinitionDto[]>(`/queues/definitions?branchId=${branchId}`, tenant)
}

export async function getQueueEntries(
  queueDefinitionId: string,
  branchId: string,
  tenant: TenantHeaders | null
): Promise<QueueEntryDto[]> {
  return get<QueueEntryDto[]>(
    `/queues/definitions/${queueDefinitionId}/entries?branchId=${branchId}`,
    tenant
  )
}

export async function addQueueEntry(
  params: {
    queueDefinitionId: string
    patientId: string
    position?: number
    triageSessionId?: string
    appointmentId?: string
  },
  tenant: TenantHeaders | null
): Promise<QueueEntryDto> {
  const sp = new URLSearchParams()
  sp.set('queueDefinitionId', params.queueDefinitionId)
  sp.set('patientId', params.patientId)
  if (params.position != null) sp.set('position', String(params.position))
  if (params.triageSessionId) sp.set('triageSessionId', params.triageSessionId)
  if (params.appointmentId) sp.set('appointmentId', params.appointmentId)
  return post<QueueEntryDto>(`/queues/entries?${sp}`, undefined, tenant)
}

export async function updateQueueEntry(
  id: string,
  body: UpdateQueueEntryRequest,
  tenant: TenantHeaders | null
): Promise<QueueEntryDto> {
  return patch<QueueEntryDto>(`/queues/entries/${id}`, body, tenant)
}

export async function callQueueEntry(
  id: string,
  tenant: TenantHeaders | null
): Promise<QueueEntryDto> {
  return patch<QueueEntryDto>(`/queues/entries/${id}/call`, undefined, tenant)
}

export async function getQueueEntry(
  id: string,
  tenant: TenantHeaders | null
): Promise<QueueEntryDto> {
  return get<QueueEntryDto>(`/queues/entries/${id}`, tenant)
}
