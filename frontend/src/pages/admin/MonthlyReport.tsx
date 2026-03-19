import {
    Users,
    Activity,
    Repeat,
    Smile,
    TrendingUp,
    TrendingDown,
    Search,
    Star,
    FileText,
    Table as TableIcon,
    MoreHorizontal,
    CheckCircle,
    ChevronDown,
    Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMonthlyReport, getDoctorPerformance, type DoctorPerformanceDto } from '@/api/management'
import { useTenant } from '@/context/TenantContext'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts'

export function MonthlyReport() {
    const { headers } = useTenant()
    const [selectedDate, setSelectedDate] = useState({ 
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear() 
    })

    const { data: report, isLoading } = useQuery({
        queryKey: ['monthly-report', selectedDate.month, selectedDate.year],
        queryFn: () => getMonthlyReport(selectedDate.year, selectedDate.month, headers),
        enabled: !!headers?.tenantId
    })

    const stats = useMemo(() => [
        {
            label: 'Bệnh nhân mới',
            value: report?.newPatients?.toString() || '0',
            trend: report?.newPatients && report.newPatients > 0 ? 'Phát sinh mới' : 'Ổn định',
            isPositive: true,
            icon: Users,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30'
        },
        {
            label: 'Tổng lượt khám',
            value: report?.totalConsultations?.toString() || '0',
            trend: 'Dữ liệu thực tế',
            isPositive: true,
            icon: Activity,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/30'
        },
        {
            label: 'Tỷ lệ tái khám',
            value: (report?.retentionRate || 0) + '%',
            trend: 'Chỉ số trung thành',
            isPositive: (report?.retentionRate || 0) > 50,
            icon: Repeat,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30'
        },
        {
            label: 'Chỉ số CSAT',
            value: (report?.avgSatisfaction || 0).toFixed(1) + '/5',
            trend: 'Đánh giá BN',
            isPositive: true,
            icon: Smile,
            isCheck: true,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/30'
        }
    ], [report])

    const { data: performance } = useQuery({
        queryKey: ['doctor-performance', headers?.tenantId],
        queryFn: () => getDoctorPerformance(headers),
        enabled: !!headers?.tenantId
    })

    const diseaseChartData = useMemo(() => {
        if (!report?.diseaseDistribution) return []
        return Object.entries(report.diseaseDistribution).map(([name, value]) => ({
            name,
            value
        }))
    }, [report])

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444']

    const diseaseGroups = useMemo(() => {
        if (!report?.diseaseDistribution) return []
        const total = Object.values(report.diseaseDistribution).reduce((a: number, b: number) => a + b, 0)
        return Object.entries(report.diseaseDistribution).map(([name, count]: [string, any], i: number) => ({
            name,
            percent: Math.round(((count as number) / (total as number)) * 100),
            color: COLORS[i % COLORS.length]
        }))
    }, [report])

    const weeklyData = useMemo(() => {
        const total = report?.totalConsultations || 0
        // Simulating weekly breakdown from total (since API doesn't provide breakdown yet)
        const w1 = Math.round(total * 0.22)
        const w2 = Math.round(total * 0.28)
        const w3 = Math.round(total * 0.25)
        const w4 = total - w1 - w2 - w3
        const max = Math.max(w1, w2, w3, w4, 1)
        return [
            { week: 'Tuần 1', value: w1, height: `${Math.round((w1 / max) * 100)}%` },
            { week: 'Tuần 2', value: w2, height: `${Math.round((w2 / max) * 100)}%` },
            { week: 'Tuần 3', value: w3, height: `${Math.round((w3 / max) * 100)}%` },
            { week: 'Tuần 4', value: w4, height: `${Math.round((w4 / max) * 100)}%` },
        ]
    }, [report])

    const totalDiseasePatients = useMemo(() => {
        if (!report?.diseaseDistribution) return 0
        return Object.values(report.diseaseDistribution).reduce((a: number, b: number) => a + b, 0)
    }, [report])


    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Đang tổng hợp báo cáo chiến lược...</p>
            </div>
        )
    }

    return (
        <div className="w-full animate-in fade-in duration-700 font-sans space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-end text-left">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Báo cáo hàng tháng</h2>
                    <p className="text-neutral-500">Phòng khám CDM — Phân tích dữ liệu thực tế.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600/20 transition-all">
                            <FileText className="w-4 h-4" />
                            PDF
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600/20 transition-all">
                            <TableIcon className="w-4 h-4" />
                            Excel
                        </button>
                    </div>
                    <div className="relative">
                        <select
                            value={`${selectedDate.month}/${selectedDate.year}`}
                            onChange={(e) => {
                                const [m, y] = e.target.value.split('/')
                                setSelectedDate({ month: parseInt(m), year: parseInt(y) })
                            }}
                            className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-xs font-bold focus:ring-primary-500 outline-none cursor-pointer min-w-[160px]"
                        >
                            {Array.from({ length: 12 }, (_, i) => {
                                const d = new Date()
                                d.setMonth(d.getMonth() - i)
                                const m = d.getMonth() + 1
                                const y = d.getFullYear()
                                return (
                                    <option key={`${m}/${y}`} value={`${m}/${y}`}>
                                        Tháng {String(m).padStart(2, '0')}, {y}
                                    </option>
                                )
                            })}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat: any, i: number) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:ring-2 hover:ring-emerald-500/5 transition-all"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                            <div className={`p-3 ${stat.bgColor} rounded-xl text-blue-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mb-3">{stat.value}</p>
                        <div className="flex items-center gap-1.5">
                            {stat.isCheck ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            ) : stat.isPositive ? (
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                            )}
                            <p className={`text-[10px] font-black uppercase tracking-widest ${stat.isPositive || stat.isCheck ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stat.trend}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Comparison */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ước tính lượt khám theo tuần</h3>
                        <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
                    </div>
                    <div className="flex items-end justify-between h-64 gap-6 px-4">
                        {weeklyData.map((data: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                <div className="w-full bg-emerald-600/5 rounded-2xl relative h-48 overflow-hidden">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: data.height }}
                                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                        className="absolute inset-x-0 bottom-0 bg-emerald-600 rounded-2xl transition-all group-hover:bg-emerald-700"
                                    />
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                                        {data.value}
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.week}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient Groups */}
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Nhóm bệnh mãn tính</h3>
                    <div className="flex flex-col items-center flex-1">
                        <div className="relative w-full h-56 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={diseaseChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {diseaseChartData.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{totalDiseasePatients}</p>
                                <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black mt-1">Bệnh nhân</p>
                            </div>
                        </div>
                        <div className="w-full grid grid-cols-1 gap-2 mt-auto">
                            {diseaseGroups.map((group: any, i: number) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-2 rounded-full" style={{ backgroundColor: group.color }} />
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest truncate max-w-[120px]">{group.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400">{group.percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Thống kê hiệu suất bác sĩ</h3>
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bác sĩ..."
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border-none bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-600/10 text-xs font-bold shadow-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-10 py-6">Bác sĩ</th>
                                <th className="px-10 py-6">Số ca đã khám</th>
                                <th className="px-10 py-6">Đơn thuốc đã kê</th>
                                <th className="px-10 py-6">Thời gian khám TB</th>
                                <th className="px-10 py-6 text-right">Đánh giá trung bình</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {(performance || []).map((doc: DoctorPerformanceDto, i: number) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-black text-xs transition-transform group-hover:scale-110 shadow-sm">
                                                {doc.fullName.charAt(0)}
                                            </div>
                                            <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{doc.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-sm font-bold text-slate-600 dark:text-slate-300">{doc.consultationCount}</td>
                                    <td className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{doc.prescriptionCount}</td>
                                    <td className="px-10 py-6 text-xs font-bold text-slate-500">{doc.avgConsultationTime || '—'}</td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5 bg-amber-50 dark:bg-amber-900/20 w-fit ml-auto px-4 py-1.5 rounded-full">
                                            <span className="text-amber-600 text-xs font-black">{doc.avgRating.toFixed(1)}</span>
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-8 bg-slate-50/10 dark:bg-slate-800/20 text-center">
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-700 hover:underline">
                        Xem báo cáo chi tiết
                    </button>
                </div>
            </div>

            <footer className="pt-4 text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">© 2023 Clinic Manager Systems. Bản quyền thuộc về Đội ngũ Quản lý.</p>
            </footer>
        </div>
    )
}
