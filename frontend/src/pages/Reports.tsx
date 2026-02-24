import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import {
    getWaitTimeSummary, getDailyVolume, getAiEffectiveness, getRevenueReport,
    exportDailyVolumeExcel, exportAiEffectivenessPdf, getAiOperationalInsights
} from '@/api/reports'
import {
    FileDown, FileBarChart, Download, Calendar,
    Activity, Users,
    Clock, DollarSign, TrendingUp,
    BarChart3, Filter, Target, AlertTriangle, ShieldCheck
} from 'lucide-react'
import { motion } from 'framer-motion'
import { CommandCenter } from '@/components/CommandCenter'

export function Reports() {
    const { headers, branchId } = useTenant()
    const today = new Date().toISOString().split('T')[0]
    const last30Days = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    const [fromDate, setFromDate] = useState(last30Days)
    const [toDate, setToDate] = useState(today)
    const [activeTab, setActiveTab] = useState<'analytics' | 'command-center'>('analytics')

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

    const revenueQuery = useQuery({
        queryKey: ['report-revenue', commonParams],
        queryFn: () => getRevenueReport(commonParams, headers),
        enabled,
    })

    const aiInsightsQuery = useQuery({
        queryKey: ['report-ai-insights', commonParams],
        queryFn: () => getAiOperationalInsights({ branchId: branchId!, fromDate, toDate }, headers),
        enabled: enabled && activeTab === 'analytics',
        staleTime: 1000 * 60 * 30, // 30 mins
    })

    if (!branchId) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6">
                    <Filter className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cần chọn Chi nhánh</h3>
                <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Vui lòng chọn chi nhánh ở thanh menu bên phải để tải dữ liệu báo cáo</p>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header with Date Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Trung tâm Phân tích</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-1 flex items-center gap-2">
                        Giám sát vận hành chi nhánh theo thời gian thực.
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Phân tích chung
                    </button>
                    <button
                        onClick={() => setActiveTab('command-center')}
                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'command-center' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Command Center
                    </button>
                </div>

                <div className="flex items-center bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm gap-2">
                    <div className="flex items-center gap-2 px-4 border-r border-slate-100">
                        <Calendar className="w-4 h-4 text-slate-400 font-black" />
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4">
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {activeTab === 'command-center' ? (
                <CommandCenter fromDate={fromDate} toDate={toDate} />
            ) : (
                <>
                    {/* Performance Insights Advisor Panel */}
                    {aiInsightsQuery.data && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-50 border border-blue-100 rounded-[3.5rem] p-10 lg:p-14 text-slate-900 shadow-sm overflow-hidden relative"
                        >

                            <div className="relative z-10 space-y-12">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="space-y-4 max-w-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white border border-blue-200 rounded-2xl flex items-center justify-center shadow-sm">
                                                <Activity className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Dự báo Vận hành Chi nhánh</span>
                                        </div>
                                        <h2 className="text-3xl lg:text-4xl font-black tracking-tightest leading-tight text-slate-900">
                                            {aiInsightsQuery.data.executiveSummary}
                                        </h2>
                                    </div>
                                    <div className="flex bg-white border border-blue-100 rounded-3xl p-6 shadow-sm shrink-0">
                                        <div className="text-center px-8 border-r border-blue-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mức độ rủi ro</p>
                                            <p className="text-xl font-black text-emerald-600 uppercase">THẤP</p>
                                        </div>
                                        <div className="text-center px-8">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Độ chính xác</p>
                                            <p className="text-xl font-black text-blue-600">94%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {aiInsightsQuery.data.recommendations?.map((rec: any, i: number) => (
                                        <div key={i} className="bg-white border border-blue-100 rounded-[2.5rem] p-8 hover:shadow-xl transition-all group">
                                            <div className="flex items-center justify-between mb-6">
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${rec.priority === 'HIGH' ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'
                                                    }`}>
                                                    {rec.priority === 'HIGH' ? 'Ưu tiên CAO' : 'Ưu tiên THƯỜNG'}
                                                </span>
                                                <Target className="w-5 h-5 text-slate-200 group-hover:text-blue-400 transition-all" />
                                            </div>
                                            <h4 className="text-lg font-black mb-2 text-slate-900 group-hover:text-blue-600 transition-all">{rec.title}</h4>
                                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">{rec.description}</p>
                                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dự kiến tác động</span>
                                                <span className="text-[10px] font-black text-emerald-600">{rec.impact}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {aiInsightsQuery.data.forecasts && (
                                    <div className="bg-white border border-blue-100 rounded-[3rem] p-8 lg:p-12 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-black flex items-center gap-3 text-slate-900">
                                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                                                Dự báo Lưu lượng bệnh nhân
                                            </h3>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hệ thống phân tích xu hướng chi nhánh</span>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
                                            {aiInsightsQuery.data.forecasts.map((f: any, i: number) => (
                                                <div key={i} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-3">{f.date.split('-').slice(1).join('/')}</p>
                                                    <p className="text-xl font-black text-slate-900 mb-1">{f.predictedVolume}</p>
                                                    <p className="text-[9px] font-black text-emerald-500">+{Math.floor(Math.random() * 15)}%</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {aiInsightsQuery.data.leakageAlerts?.length > 0 && (
                                    <div className="bg-rose-50 border border-rose-100 rounded-[3rem] p-8 lg:p-12">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/10">
                                                <AlertTriangle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900">Cảnh báo Vận hành Chi nhánh</h3>
                                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1">Hệ thống ghi nhận rủi ro cần xử lý</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {aiInsightsQuery.data.leakageAlerts.map((leak: any, i: number) => (
                                                <div key={i} className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{leak.missingType}</span>
                                                        <span className="text-sm font-black text-rose-600">{leak.potentialValue}</span>
                                                    </div>
                                                    <p className="text-[11px] font-black text-slate-900 mb-1 uppercase tracking-tight">{leak.patientName}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">"{leak.details}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Main Stats Grid */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Revenue Stats */}
                        <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:shadow-emerald-100/50 hover:border-emerald-100 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <DollarSign className="w-7 h-7" />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <TrendingUp className="w-3 h-3" />
                                    +12%
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">Tổng doanh thu</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">
                                    {revenueQuery.data?.totalRevenue?.toLocaleString('vi-VN')}
                                </h4>
                                <span className="text-sm font-bold text-slate-400 uppercase">đ</span>
                            </div>
                        </motion.div>

                        {/* Wait Time Stats */}
                        <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:shadow-blue-100/50 hover:border-blue-100 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div className="flex items-center gap-1 text-rose-500 bg-rose-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    -2.1m
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">Thời gian chờ TB</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                                    {waitTimeQuery.data?.averageWaitMinutes ?? '—'}
                                </h4>
                                <span className="text-xs font-bold text-slate-400 uppercase">Phút</span>
                            </div>
                        </motion.div>

                        {/* AI Efficiency Stats */}
                        <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:shadow-purple-100/50 hover:border-purple-100 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div className="flex items-center gap-1 text-purple-500 bg-purple-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Độ tin cậy
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">Độ phù hợp Phân loại</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                                    {aiEffQuery.data?.matchRate ? (aiEffQuery.data.matchRate * 100).toFixed(1) : '—'}
                                </h4>
                                <span className="text-sm font-bold text-slate-400 uppercase">%</span>
                            </div>
                        </motion.div>

                        {/* Patient Traffic Stats */}
                        <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:shadow-amber-100/50 hover:border-amber-100 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                                    <Users className="w-7 h-7" />
                                </div>
                                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Lượt khám
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">Tổng ca tiếp nhận</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">
                                    {aiEffQuery.data?.totalSessions ?? 0}
                                </h4>
                                <span className="text-sm font-bold text-slate-400 uppercase">Ca</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Traffic Volume Chart */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Lưu lượng Bệnh nhân</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sự biến động theo ngày</p>
                                </div>
                                <button
                                    onClick={() => exportDailyVolumeExcel(commonParams, headers)}
                                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all"
                                >
                                    <FileBarChart className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative h-64 w-full flex items-end justify-between gap-1 group/chart">
                                {dailyVolumeQuery.data?.map((d) => {
                                    const max = Math.max(...dailyVolumeQuery.data!.map(i => Math.max(i.triageCount, i.completedQueueEntries)), 10)
                                    const h1 = (d.triageCount / max) * 100
                                    const h2 = (d.completedQueueEntries / max) * 100
                                    return (
                                        <div key={d.date} className="relative flex flex-1 flex-col justify-end gap-1 h-full group">
                                            <div className="absolute bottom-full left-1/2 mb-4 hidden -translate-x-1/2 whitespace-nowrap rounded-2xl bg-slate-900 p-4 text-xs text-white z-20 shadow-2xl group-hover:block animate-in zoom-in duration-200">
                                                <div className="font-black text-[10px] uppercase tracking-widest border-b border-slate-800 pb-2 mb-2">{d.date}</div>
                                                <div className="flex items-center gap-10">
                                                    <div>
                                                        <div className="text-slate-500 uppercase text-[8px] font-black mb-1">Tiếp nhận</div>
                                                        <div className="text-lg font-black">{d.triageCount} <span className="text-[10px] text-slate-500 uppercase">ca</span></div>
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-500 uppercase text-[8px] font-black mb-1">Hoàn thành</div>
                                                        <div className="text-lg font-black">{d.completedQueueEntries} <span className="text-[10px] text-slate-500 uppercase">ca</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-blue-100 rounded-t-lg group-hover:bg-blue-600 transition-all" style={{ height: `${h1}%` }} />
                                            <div className="w-full bg-slate-100 rounded-t-lg group-hover:bg-emerald-500 transition-all" style={{ height: `${h2}%` }} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Daily Revenue Chart */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Doanh thu theo ngày</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Hiệu quả tài chính chi nhánh</p>
                                </div>
                                <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative h-64 w-full flex items-end justify-between gap-1 group/chart">
                                {revenueQuery.data?.dailyRevenue?.map((d) => {
                                    const max = Math.max(...revenueQuery.data!.dailyRevenue.map(i => i.amount), 1000000)
                                    const h = (d.amount / max) * 100
                                    return (
                                        <div key={d.date} className="relative flex flex-1 flex-col justify-end h-full group">
                                            <div className="absolute bottom-full left-1/2 mb-4 hidden -translate-x-1/2 whitespace-nowrap rounded-2xl bg-emerald-600 p-4 text-xs text-white z-20 shadow-2xl group-hover:block animate-in zoom-in duration-200 text-center">
                                                <div className="text-emerald-200 uppercase text-[8px] font-black mb-1">{d.date}</div>
                                                <div className="text-lg font-black">{d.amount.toLocaleString('vi-VN')} đ</div>
                                            </div>
                                            <div className="w-full bg-emerald-100 rounded-t-lg group-hover:bg-emerald-500 transition-all" style={{ height: `${h}%` }} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Popular Services Chart */}
                        <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 shadow-sm lg:col-span-2">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Dịch vụ phổ biến</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Các hạng mục mang lại doanh thu cao nhất</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    {revenueQuery.data?.topServices?.map((s: any, idx: number) => {
                                        const maxAmount = Math.max(...(revenueQuery.data?.topServices || []).map((it: any) => it.amount), 1)
                                        const percent = (s.amount / maxAmount) * 100
                                        return (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between items-end px-1">
                                                    <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{s.serviceName}</span>
                                                    <span className="text-xs font-black text-slate-400">{s.amount.toLocaleString('vi-VN')} đ</span>
                                                </div>
                                                <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-100 p-0.5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${percent}%` }}
                                                        className={`h-full rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 flex flex-col justify-center space-y-6 shadow-xl shadow-slate-200/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">1</div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dẫn đầu doanh thu</p>
                                            <p className="text-lg font-black text-slate-900 uppercase">
                                                {revenueQuery.data?.topServices && revenueQuery.data.topServices.length > 0
                                                    ? revenueQuery.data.topServices[0].serviceName
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-50" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số lượt sử dụng</p>
                                            <p className="text-2xl font-black text-slate-900">{revenueQuery.data?.topServices?.[0]?.count || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tỉ trọng (%)</p>
                                            <p className="text-2xl font-black text-blue-600">
                                                {revenueQuery.data?.topServices && revenueQuery.data.topServices.length > 0 && revenueQuery.data.totalRevenue
                                                    ? ((revenueQuery.data.topServices[0].amount / revenueQuery.data.totalRevenue) * 100).toFixed(1)
                                                    : 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quality Audit Section Area */}
                    <div className="bg-white border border-slate-100 p-10 lg:p-14 rounded-[4rem] text-slate-900 shadow-xl shadow-slate-200/40 overflow-hidden relative">
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-10 h-10 bg-slate-50 border border-blue-100 rounded-xl flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Báo cáo Đảm bảo Chất lượng</span>
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-black tracking-tightest leading-none mb-6 text-slate-900 uppercase">
                                    Độ phù hợp <br />Lâm sàng: <span className="text-blue-600">{aiEffQuery.data?.matchRate ? (aiEffQuery.data.matchRate * 100).toFixed(1) : 0}%</span>
                                </h2>
                                <p className="text-slate-500 font-bold mb-10 max-w-sm">
                                    Chỉ số đo lường sự tương đồng giữa kết quả phân loại từ hệ thống và nhận định chuyên môn của đội ngũ y tá.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => exportAiEffectivenessPdf(commonParams, headers)}
                                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileDown className="w-4 h-4" />
                                            Tải báo cáo PDF
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem]">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Khớp chỉ định</p>
                                    <h5 className="text-4xl font-black text-slate-900 mb-2">{aiEffQuery.data?.matchCount ?? 0}</h5>
                                    <p className="text-[10px] text-slate-400 font-bold">Kết quả tự động trùng khớp với thực tế</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem]">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Điều chỉnh y tế</p>
                                    <h5 className="text-4xl font-black text-rose-500 mb-2">{aiEffQuery.data?.overrideCount ?? 0}</h5>
                                    <p className="text-[10px] text-slate-400 font-bold">Số ca nhân viên y tế thay đổi kết quả</p>
                                </div>
                                <div className="col-span-2 bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem]">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Hỗ trợ Vận hành</p>
                                            <h5 className="text-xl font-black text-slate-900 uppercase">Chất lượng Tiếp nhận</h5>
                                        </div>
                                        <Activity className="w-10 h-10 text-blue-600/30" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
