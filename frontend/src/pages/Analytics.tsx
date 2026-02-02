import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getTodaySummary, getWeekSummary } from '@/api/analytics'
import { SkeletonAnalyticsSummary } from '@/components/Skeleton'

export function Analytics() {
    const { headers, branchId } = useTenant()

    const { data: todayData, isLoading: loadingToday } = useQuery({
        queryKey: ['analytics', 'today', branchId],
        queryFn: () => getTodaySummary(branchId ?? undefined, headers),
        enabled: !!headers?.tenantId,
        refetchInterval: 30000, // Auto-refresh every 30s
    })

    const { data: weekData, isLoading: loadingWeek } = useQuery({
        queryKey: ['analytics', 'week', branchId],
        queryFn: () => getWeekSummary(branchId ?? undefined, headers),
        enabled: !!headers?.tenantId,
    })

    if (loadingToday || loadingWeek) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="page-header">
                    <div className="h-8 bg-slate-200 rounded w-64 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded w-96 mt-2 animate-pulse"></div>
                </div>
                <SkeletonAnalyticsSummary />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
                <p className="text-sm text-slate-600 mt-1">
                    {branchId ? 'Chi nhánh hiện tại' : 'Tất cả chi nhánh'} • Real-time metrics
                </p>
            </div>

            {/* Today's Summary */}
            <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">📊 Hôm nay</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Bệnh nhân phân loại"
                        value={todayData?.triageCount || 0}
                        subtitle="Tổng số lượt triage"
                        icon="👥"
                        color="blue"
                    />
                    <MetricCard
                        title="Hoàn thành khám"
                        value={todayData?.completedCount || 0}
                        subtitle="Đã khám xong"
                        icon="✅"
                        color="green"
                    />
                    <MetricCard
                        title="AI Match Rate"
                        value={`${todayData?.aiMatchRate?.toFixed(1) || 0}%`}
                        subtitle={`${todayData?.totalAiCalls || 0} AI calls`}
                        icon="🤖"
                        color="purple"
                    />
                </div>
            </section>

            {/* Week Summary */}
            <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">📈 7 Ngày qua</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SummaryCard
                        title="Tổng số lượt phân loại"
                        value={weekData?.triageCount || 0}
                        avgValue={weekData?.avgPerDay || 0}
                        suffix="lượt"
                        avgSuffix="lượt/ngày"
                        gradient="from-blue-50 to-cyan-50"
                        borderColor="border-blue-200"
                    />
                    <SummaryCard
                        title="Hoàn thành khám bệnh"
                        value={weekData?.completedCount || 0}
                        avgValue={(weekData?.completedCount || 0) / 7}
                        suffix="lượt"
                        avgSuffix="lượt/ngày"
                        gradient="from-green-50 to-emerald-50"
                        borderColor="border-green-200"
                    />
                </div>
            </section>

            {/* AI Performance Indicator */}
            {todayData && todayData.totalAiCalls > 0 && (
                <section className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                            🧠
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-purple-900 mb-2">AI Performance</h3>
                            <p className="text-sm text-purple-800 mb-3">
                                Hệ thống AI đã hỗ trợ <strong>{todayData.totalAiCalls}</strong> lượt phân loại hôm nay với độ chính xác{' '}
                                <strong>{todayData.aiMatchRate.toFixed(1)}%</strong>
                            </p>
                            <div className="w-full bg-purple-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${todayData.aiMatchRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

interface MetricCardProps {
    title: string
    value: number | string
    subtitle: string
    icon: string
    color: 'blue' | 'green' | 'purple'
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
    const colorClasses = {
        blue: 'from-blue-50 to-cyan-50 border-blue-200',
        green: 'from-green-50 to-emerald-50 border-green-200',
        purple: 'from-purple-50 to-pink-50 border-purple-200',
    }

    const iconBgClasses = {
        blue: 'bg-blue-100',
        green: 'bg-green-100',
        purple: 'bg-purple-100',
    }

    return (
        <div className={`card bg-gradient-to-br ${colorClasses[color]} border`}>
            <div className="flex items-start gap-4">
                <div className={`shrink-0 w-12 h-12 ${iconBgClasses[color]} rounded-xl flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
            </div>
        </div>
    )
}

interface SummaryCardProps {
    title: string
    value: number
    avgValue: number
    suffix: string
    avgSuffix: string
    gradient: string
    borderColor: string
}

function SummaryCard({ title, value, avgValue, suffix, avgSuffix, gradient, borderColor }: SummaryCardProps) {
    return (
        <div className={`card bg-gradient-to-br ${gradient} border ${borderColor}`}>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">{title}</h3>
            <div className="space-y-2">
                <div>
                    <p className="text-4xl font-bold text-slate-900">{value}</p>
                    <p className="text-sm text-slate-600">{suffix}</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                    <p className="text-lg font-semibold text-slate-700">{avgValue.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">{avgSuffix}</p>
                </div>
            </div>
        </div>
    )
}
