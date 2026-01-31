import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getWaitTimeSummary, getDailyVolume, getAiEffectiveness } from '@/api/reports'

export function Reports() {
    const { headers, branchId } = useTenant()
    const today = new Date().toISOString().split('T')[0]
    const last30Days = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    const [fromDate, setFromDate] = useState(last30Days)
    const [toDate, setToDate] = useState(today)

    const commonParams = { branchId: branchId!, fromDate, toDate }
    const enabled = !!branchId && !!headers?.tenantId

    const waitTimeQuery = useQuery({
        queryKey: ['report-wait-time', commonParams],
        queryFn: () => getWaitTimeSummary(commonParams, headers),
        enabled,
    })

    const dailyVolumeQuery = useQuery({
        queryKey: ['report-daily-volume', commonParams],
        queryFn: () => getDailyVolume(commonParams, headers),
        enabled,
    })

    const aiEffQuery = useQuery({
        queryKey: ['report-ai-eff', commonParams],
        queryFn: () => getAiEffectiveness(commonParams, headers),
        enabled,
    })

    if (!branchId) {
        return (
            <div className="mx-auto max-w-4xl text-center text-slate-500">
                Vui lòng chọn chi nhánh để xem báo cáo.
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-6xl space-y-8">
            <header className="page-header flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Báo cáo hoạt động
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Tổng hợp KPI vận hành, thời gian chờ và hiệu quả AI.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    <span className="text-slate-400">–</span>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm"
                    />
                </div>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1: Wait Time */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500">Thời gian chờ TB</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-semibold text-slate-900">
                            {waitTimeQuery.data?.averageWaitMinutes ?? '—'}
                        </span>
                        <span className="text-sm text-slate-600">phút</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Trên {waitTimeQuery.data?.totalCompletedEntries ?? 0} lượt khám hoàn thành
                    </p>
                </div>

                {/* Card 2: AI Automation */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500">AI Tự động hóa</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-semibold text-slate-900">
                            {aiEffQuery.data?.matchRate ? (aiEffQuery.data.matchRate * 100).toFixed(1) : '—'}
                        </span>
                        <span className="text-sm text-slate-600">%</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Tỷ lệ khớp với quyết định của y tá
                    </p>
                </div>

                {/* Card 3: Traffic */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500">Lượt khám (AI)</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-semibold text-slate-900">
                            {aiEffQuery.data?.aiSessions ?? 0}
                        </span>
                        <span className="text-sm text-slate-600">ca</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Trong tổng số {aiEffQuery.data?.totalSessions ?? 0} ca tiếp nhận
                    </p>
                </div>
            </div>

            {/* Chart Section: Daily Volume */}
            <section className="card">
                <h3 className="section-title mb-6">Biểu đồ lượt khám theo ngày</h3>
                {dailyVolumeQuery.isLoading ? (
                    <div className="h-64 animate-pulse rounded bg-slate-100" />
                ) : (
                    <div className="relative h-64 w-full">
                        <div className="absolute inset-0 flex items-end justify-between gap-1">
                            {dailyVolumeQuery.data?.map((d) => {
                                const max = Math.max(
                                    ...dailyVolumeQuery.data.map((i) => Math.max(i.triageCount, i.completedQueueEntries)),
                                    10
                                )
                                const h1 = (d.triageCount / max) * 100
                                const h2 = (d.completedQueueEntries / max) * 100
                                return (
                                    <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end gap-1">
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:block group-hover:opacity-100 z-10">
                                            <div>{d.date}</div>
                                            <div>Tiếp nhận: {d.triageCount}</div>
                                            <div>Hoàn thành: {d.completedQueueEntries}</div>
                                        </div>

                                        {/* Bar 1: Triage */}
                                        <div
                                            className="w-full bg-blue-400/80 transition-all hover:bg-blue-500"
                                            style={{ height: `${h1}%`, minHeight: '4px' }}
                                        />
                                        {/* Bar 2: Completed */}
                                        <div
                                            className="w-full bg-emerald-400/80 transition-all hover:bg-emerald-500"
                                            style={{ height: `${h2}%`, minHeight: '4px' }}
                                        />

                                        {/* X Axis Label */}
                                        <div className="absolute top-full mt-1 w-full text-center text-[10px] text-slate-400 truncate">
                                            {d.date.slice(8)} {/* Show only day part */}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-blue-400" />
                        <span className="text-slate-600">Tiếp nhận (Triage)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-400" />
                        <span className="text-slate-600">Hoàn thành khám</span>
                    </div>
                </div>
            </section>

            {/* AI Effectiveness Table */}
            <section className="card">
                <h3 className="section-title mb-4">Chi tiết hiệu quả AI</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-900">Tỷ lệ khớp (Match)</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-600">
                            {aiEffQuery.data?.matchRate ? (aiEffQuery.data.matchRate * 100).toFixed(1) : 0}%
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            Số ca AI đề xuất giống hệt y tá ({aiEffQuery.data?.matchCount ?? 0} ca).
                        </p>
                    </div>
                    <div className="rounded bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-900">Tỷ lệ can thiệp (Override)</p>
                        <p className="mt-1 text-2xl font-bold text-amber-600">
                            {aiEffQuery.data?.overrideRate ? (aiEffQuery.data.overrideRate * 100).toFixed(1) : 0}%
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            Số ca y tá phải sửa kết quả AI ({aiEffQuery.data?.overrideCount ?? 0} ca).
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
