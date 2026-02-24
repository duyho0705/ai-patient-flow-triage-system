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
    return get<RevenueReportDto>(`/admin/reports/revenue?${sp}`, tenant)
}

export async function getWaitTimeSummary(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
): Promise<WaitTimeSummaryDto> {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return get<WaitTimeSummaryDto>(`/admin/reports/wait-time?${sp}`, tenant)
}

export async function getDailyVolume(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
): Promise<DailyVolumeDto[]> {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return get<DailyVolumeDto[]>(`/admin/reports/daily-volume?${sp}`, tenant)
}

export async function getAiEffectiveness(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
): Promise<AiEffectivenessDto> {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return get<AiEffectivenessDto>(`/admin/reports/ai-effectiveness?${sp}`, tenant)
}

export async function exportDailyVolumeExcel(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
) {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return downloadFile(`/admin/reports/daily-volume/excel?${sp}`, tenant, 'daily-volume.xlsx')
}

export async function exportAiEffectivenessPdf(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
) {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return downloadFile(`/admin/reports/ai-effectiveness/pdf?${sp}`, tenant, 'ai-effectiveness.pdf')
}

export async function exportWaitTimeExcel(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
) {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return downloadFile(`/admin/reports/wait-time/excel?${sp}`, tenant, 'wait-time.xlsx')
}

export async function getOperationalHeatmap(
    branchId: string,
    tenant: TenantHeaders | null
): Promise<any> {
    return get<any>(`/admin/reports/operational-heatmap?branchId=${branchId}`, tenant)
}

export async function getAiAuditLogs(
    params: { branchId: string; fromDate?: string; toDate?: string },
    tenant: TenantHeaders | null
): Promise<any[]> {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    if (params.fromDate) sp.set('fromDate', params.fromDate)
    if (params.toDate) sp.set('toDate', params.toDate)
    return get<any[]>(`/admin/reports/ai-audit-logs?${sp}`, tenant)
}

export async function getAiOperationalInsights(
    params: { branchId: string; fromDate: string; toDate: string },
    tenant: TenantHeaders | null
): Promise<any> {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    sp.set('fromDate', params.fromDate)
    sp.set('toDate', params.toDate)
    return get<any>(`/admin/reports/ai-operational-insights?${sp}`, tenant)
}
