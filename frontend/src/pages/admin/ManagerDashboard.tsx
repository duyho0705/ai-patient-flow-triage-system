import {
    Users,
    Activity,
    Calendar,
    AlertCircle,
    Search,
    Stethoscope,
    Download,
    Loader2,
    CheckCircle2,
    PieChart as PieChartIcon
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getManagerSummary, exportPatientExcelReport } from '@/api/management'
import { useTenant } from '@/context/TenantContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { toastService } from '@/services/toast'

export function ManagerDashboard() {
    const { headers } = useTenant()
    const [searchTerm, setSearchTerm] = useState('')

    const { data: summary, isLoading } = useQuery({
        queryKey: ['manager-summary'],
        queryFn: () => getManagerSummary(headers),
        enabled: !!headers?.tenantId
    })

    const stats = useMemo(() => [
        {
            label: 'Tổng bệnh nhân CDM',
            value: summary?.totalPatients?.toLocaleString() || '0',
            trend: '—',
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30'
        },
        {
            label: 'Tổng bác sĩ',
            value: summary?.totalDoctors?.toString() || '0',
            trend: 'Hoạt động',
            icon: Stethoscope,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            label: 'Bệnh nhân nguy cơ cao',
            value: summary?.highRiskCount?.toString() || '0',
            trend: 'Cần can thiệp',
            icon: AlertCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-100 dark:bg-rose-900/30'
        }
    ], [summary])

    const chartData = useMemo(() => {
        if (!summary?.diseaseDistribution) return []
        return Object.entries(summary.diseaseDistribution).map(([name, value]) => ({
            name: name || 'Chưa phân loại',
            value
        }))
    }, [summary])

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    const handleExport = async () => {
        try {
            await toastService.promise(
                exportPatientExcelReport(headers),
                {
                    loading: 'Đang chuẩn bị báo cáo...',
                    success: 'Đã tải xuống báo cáo doanh nghiệp!',
                    error: 'Lỗi khi xuất báo cáo'
                }
            )
        } catch (error) {
            // Error managed by promise
        }
    }

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Đang phân tích dữ liệu phòng khám...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-600/20">
                        <Activity className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tightest uppercase">
                            Giám sát điều trị CDM Enterprise
                        </h1>
                        <p className="text-slate-500 font-bold text-sm">
                            Hệ thống quản trị và phân tích dữ liệu bệnh nhân thực tế.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExport}
                        className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Xuất báo cáo Excel
                    </button>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full h-11 pl-10 pr-4 rounded-xl border-none bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-emerald-600/20 text-sm font-medium"
                            placeholder="Tìm kiếm bệnh nhân trễ lịch..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${stat.trend.includes('+') || stat.trend.includes('%') || stat.trend === 'Hoạt động' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-black uppercase tracking-wider mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tightest">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Disease Distribution Chart */}
                <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-blue-600/10 text-blue-600 p-2 rounded-xl">
                            <PieChartIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Tỷ lệ bệnh lý</h2>
                            <p className="text-sm text-slate-400 font-bold">Phân bổ theo chronic conditions</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                        <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Activity className="w-12 h-12 opacity-10 mb-2" />
                                <p className="text-xs font-bold">Chưa có dữ liệu phân loại bệnh</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Missed Follow-up Section */}
                <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-600/10 text-amber-600 p-2 rounded-xl">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Bệnh nhân cần can thiệp</h2>
                                <p className="text-sm text-slate-400 font-bold">Trễ lịch hẹn tái khám {'>'} 30 ngày</p>
                            </div>
                        </div>
                        <button className="text-[10px] font-black text-emerald-600 border-b-2 border-emerald-600 uppercase tracking-widest pb-1 hover:text-emerald-700 transition-colors">
                            Xem tất cả
                        </button>
                    </div>
                    <div className="space-y-4">
                        {(summary?.missedFollowUpPatients ?? []).length > 0 ? (
                            summary?.missedFollowUpPatients.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center font-black text-slate-400 border border-slate-200 dark:border-slate-700">
                                            {p.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 dark:text-white">{p.fullName}</p>
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{p.condition || 'CDM'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                            {p.riskLevel}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center opacity-40">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
                                <p className="text-xs font-bold uppercase tracking-widest">Tất cả bệnh nhân đều tái khám đúng hạn</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer CDM Info */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50 dark:border-slate-800 opacity-60">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-600/10 text-emerald-600 p-2 rounded-lg">
                        <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CDM Clinical Manager Enterprise v2.5</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">© Hệ thống quản lý điều trị bệnh mãn tính thông minh.</p>
            </div>
        </div>
    )
}

