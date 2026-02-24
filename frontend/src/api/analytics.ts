import { get, type TenantHeaders } from './client'

export interface AnalyticsSummary {
  triageCount: number
  completedCount: number
  aiMatchRate: number
  totalAiCalls: number
  date?: string
  periodDays?: number
  avgPerDay?: number
}

export async function getTodaySummary(branchId: string | undefined, headers: TenantHeaders | null): Promise<AnalyticsSummary> {
  const params = branchId ? `?branchId=${branchId}` : ''
  return get(`/admin/analytics/summary/today${params}`, headers)
}

export async function getWeekSummary(branchId: string | undefined, headers: TenantHeaders | null): Promise<AnalyticsSummary> {
  const params = branchId ? `?branchId=${branchId}` : ''
  return get(`/admin/analytics/summary/week${params}`, headers)
}
