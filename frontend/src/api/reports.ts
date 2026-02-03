import { get, downloadFile } from './client'
import type { TenantHeaders } from './client'
import type { WaitTimeSummaryDto, DailyVolumeDto, AiEffectivenessDto, RevenueReportDto } from '@/types/api'

export async function getRevenueReport(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
): Promise<RevenueReportDto> {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return get<RevenueReportDto>(`/reports/revenue?${sp}`, tenant)
}

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

export async function exportDailyVolumeExcel(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
) {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return downloadFile(`/reports/daily-volume/excel?${sp}`, tenant, 'daily-volume.xlsx')
}

export async function exportAiEffectivenessPdf(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
) {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return downloadFile(`/reports/ai-effectiveness/pdf?${sp}`, tenant, 'ai-effectiveness.pdf')
}

export async function exportWaitTimeExcel(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
) {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return downloadFile(`/reports/wait-time/excel?${sp}`, tenant, 'wait-time.xlsx')
}
