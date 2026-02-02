import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getTodaySummary, getWeekSummary } from '@/api/analytics'
import { SkeletonAnalyticsSummary } from '@/components/Skeleton'
import {
    Activity,
    CheckCircle2,
    BrainCircuit,
    TrendingUp,
    BarChart3,
    Zap,
    Users2
} from 'lucide-react'
import { motion } from 'framer-motion'

export function Analytics() {
    const { headers, branchId } = useTenant()

    const { data: todayData, isLoading: loadingToday } = useQuery({
        queryKey: ['analytics', 'today', branchId],
        queryFn: () => getTodaySummary(branchId ?? undefined, headers),
        enabled: !!headers?.tenantId,
        refetchInterval: 30000,
    })

    const { data: weekData, isLoading: loadingWeek } = useQuery({
        queryKey: ['analytics', 'week', branchId],
        queryFn: () => getWeekSummary(branchId ?? undefined, headers),
        enabled: !!headers?.tenantId,
    })

    if (loadingToday || loadingWeek) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="space-y-4">
                    <div className="h-10 bg-slate-200 rounded-2xl w-72 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded-lg w-96 animate-pulse"></div>
                </div>
                <SkeletonAnalyticsSummary />
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="p-4 sm:p-8 max-w-7xl mx-auto space-y-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Thống kê Phân tích</h1>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {branchId ? 'Dữ liệu tại chi nhánh hiện tại' : 'Tất cả chi nhánh'} • Cập nhật thời gian thực
                    </p>
                </div>
                <div className="px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                </div>
            </div>

            {/* Today Metrics */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#2b8cee]/10 rounded-xl">
                        <Zap className="w-5 h-5 text-[#2b8cee]" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Hoạt động Hôm nay</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Bệnh nhân Phân loại"
                        value={todayData?.triageCount || 0}
                        subtitle="Tổng lượt xử lý triage hôm nay"
                        icon={<Users2 className="w-6 h-6" />}
                        color="#2b8cee"
                    />
                    <MetricCard
                        title="Đã Khám xong"
                        value={todayData?.completedCount || 0}
                        subtitle="Bệnh nhân đã hoàn tất quy trình"
                        icon={<CheckCircle2 className="w-6 h-6" />}
                        color="#10b981"
                    />
                    <MetricCard
                        title="Tỉ lệ AI Chính xác"
                        value={`${todayData?.aiMatchRate?.toFixed(1) || 0}%`}
                        subtitle={`${todayData?.totalAiCalls || 0} lượt AI hỗ trợ gợi ý`}
                        icon={<BrainCircuit className="w-6 h-6" />}
                        color="#8b5cf6"
                    />
                </div>
            </section>

            {/* AI Performance Deep Dive */}
            {todayData && todayData.totalAiCalls > 0 && (
                <motion.section
                    variants={item}
                    className="relative overflow-hidden group rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                        <BrainCircuit className="w-64 h-64 -mr-20 -mt-20" />
                    </div>

                    <div className="relative flex flex-col lg:flex-row lg:items-center gap-10">
                        <div className="shrink-0">
                            <div className="w-20 h-20 bg-gradient-to-tr from-[#8b5cf6] to-[#d946ef] rounded-[2rem] flex items-center justify-center shadow-lg shadow-purple-200">
                                <Activity className="w-10 h-10 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Hiệu suất Trí tuệ Nhân tạo</h3>
                                <p className="text-slate-500 font-medium mt-1">
                                    Hệ thống AI đã hỗ trợ <span className="text-purple-600 font-bold">{todayData.totalAiCalls}</span> lượt phân loại hôm nay.
                                    Tỉ lệ tương đồng với quyết định thực tế đạt <span className="text-purple-600 font-bold">{todayData.aiMatchRate.toFixed(1)}%</span>.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                                    <span>Độ chính xác</span>
                                    <span className="text-purple-600">{todayData.aiMatchRate.toFixed(1)}%</span>
                                </div>
                                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${todayData.aiMatchRate}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-full shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-48 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Xu hướng</p>
                            <div className="flex items-center justify-center gap-2 text-emerald-500">
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-xl font-black">+12%</span>
                            </div>
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Weekly Trends */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#2b8cee]/10 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-[#2b8cee]" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Xu hướng 7 Ngày qua</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TrendCard
                        title="Tổng lượt Phân loại"
                        value={weekData?.triageCount || 0}
                        avgValue={weekData?.avgPerDay || 0}
                        icon={<Activity className="w-6 h-6" />}
                        color="#2b8cee"
                    />
                    <TrendCard
                        title="Khám bệnh Hoàn tất"
                        value={weekData?.completedCount || 0}
                        avgValue={(weekData?.completedCount || 0) / 7}
                        icon={<CheckCircle2 className="w-6 h-6" />}
                        color="#10b981"
                    />
                </div>
            </section>
        </motion.div>
    )
}

function MetricCard({ title, value, subtitle, icon, color }: {
    title: string, value: string | number, subtitle: string, icon: React.ReactNode, color: string
}) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
            whileHover={{ y: -5 }}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all duration-300"
        >
            <div className="absolute top-0 right-12 w-10 h-1.5 rounded-b-full opacity-20 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }} />

            <div className="flex flex-col gap-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: color, boxShadow: `0 8px 16px -4px ${color}33` }}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
                    <p className="mt-3 text-xs font-semibold text-slate-500 leading-relaxed">{subtitle}</p>
                </div>
            </div>
        </motion.div>
    )
}

function TrendCard({ title, value, avgValue, icon, color }: {
    title: string, value: number, avgValue: number, icon: React.ReactNode, color: string
}) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-lg shadow-slate-200/30 flex flex-col gap-8 relative overflow-hidden"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl" style={{ backgroundColor: `${color}11`, color }}>
                        {icon}
                    </div>
                    <h3 className="font-black text-slate-900 tracking-tight">{title}</h3>
                </div>
                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="space-y-1">
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng lượt</p>
                </div>
                <div className="space-y-1 pl-6 border-l border-slate-100">
                    <p className="text-2xl font-black text-slate-700 tracking-tight">{avgValue.toFixed(1)}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trung bình / ngày</p>
                </div>
            </div>

            <div className="absolute -bottom-4 -right-4 opacity-[0.05] pointer-events-none transform rotate-12">
                {icon}
            </div>
        </motion.div>
    )
}

function ChevronRight(props: any) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
    )
}
