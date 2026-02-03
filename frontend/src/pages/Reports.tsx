import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import {
    getWaitTimeSummary, getDailyVolume, getAiEffectiveness, getRevenueReport,
    exportWaitTimeExcel, exportDailyVolumeExcel, exportAiEffectivenessPdf
} from '@/api/reports'
import {
    FileDown, FileBarChart, Download, Calendar,
    ArrowUpRight, ArrowDownRight, Activity, Users,
    Clock, Brain, DollarSign, TrendingUp, ChevronRight,
    PieChart, BarChart3, Filter
} from 'lucide-react'
import { toastService } from '@/services/toast'
import { motion, AnimatePresence } from 'framer-motion'

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

    const revenueQuery = useQuery({
        queryKey: ['report-revenue', commonParams],
        queryFn: () => getRevenueReport(commonParams, headers),
        enabled,
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
                            <Brain className="w-7 h-7" />
                        </div>
                        <div className="flex items-center gap-1 text-purple-500 bg-purple-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            AI Audit
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">Tỉ lệ AI chính xác</p>
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
            </div>

            {/* AI Efficiency Audit Section */}
            <div className="bg-slate-900 p-10 lg:p-14 rounded-[4rem] text-white shadow-3xl shadow-slate-200 overflow-hidden relative">
                <div className="absolute -right-20 top-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px]" />
                <div className="absolute -left-20 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px]" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Brain className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI Effectiveness Report</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-6">
                            Tỉ lệ tin cậy <br />của AI: <span className="text-blue-400">{aiEffQuery.data?.matchRate ? (aiEffQuery.data.matchRate * 100).toFixed(1) : 0}%</span>
                        </h2>
                        <p className="text-slate-400 font-bold mb-10 max-w-sm">
                            Đo lường độ chính xác của hệ thống AI Triage dựa trên sự đồng thuận của đội ngũ chuyên môn.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => exportAiEffectivenessPdf(commonParams, headers)}
                                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all shadow-xl"
                            >
                                <div className="flex items-center gap-2">
                                    <FileDown className="w-4 h-4" />
                                    Tải báo cáo PDF
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Khớp hoàn toàn</p>
                            <h5 className="text-4xl font-black text-white mb-2">{aiEffQuery.data?.matchCount ?? 0}</h5>
                            <p className="text-[10px] text-slate-500 font-bold">Quyết định AI trùng khớp với y tế</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Can thiệp y tế</p>
                            <h5 className="text-4xl font-black text-rose-500 mb-2">{aiEffQuery.data?.overrideCount ?? 0}</h5>
                            <p className="text-[10px] text-slate-500 font-bold">Số ca nhân viên y tế thay đổi kết quả</p>
                        </div>
                        <div className="col-span-2 bg-blue-600/10 border border-blue-500/20 p-8 rounded-[2.5rem]">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Tư vấn AI</p>
                                    <h5 className="text-xl font-black text-white">Xây dựng lòng tin</h5>
                                </div>
                                <Activity className="w-10 h-10 text-blue-500/50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
