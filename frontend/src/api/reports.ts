import { get } from './client'
import type { TenantHeaders } from './client'
import type { WaitTimeSummaryDto, DailyVolumeDto, AiEffectivenessDto } from '@/types/api'

export async function getWaitTimeSummary(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
): Promise<WaitTimeSummaryDto> {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return get<WaitTimeSummaryDto>(`/reports/wait-time?${sp}`, tenant)
}

export async function getDailyVolume(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
): Promise<DailyVolumeDto[]> {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return get<DailyVolumeDto[]>(`/reports/daily-volume?${sp}`, tenant)
}

export async function getAiEffectiveness(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
): Promise<AiEffectivenessDto> {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return get<AiEffectivenessDto>(`/reports/ai-effectiveness?${sp}`, tenant)
}
