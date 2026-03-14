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
    CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMonthlyReport, getDoctorPerformance, type DoctorPerformanceDto } from '@/api/management'
import { useTenant } from '@/context/TenantContext'
import { Loader2 } from 'lucide-react'

const weeklyData = [
    { week: 'Tuần 1', value: 45, height: '45%' },
    { week: 'Tuần 2', value: 82, height: '82%' },
    { week: 'Tuần 3', value: 64, height: '64%' },
    { week: 'Tuần 4', value: 95, height: '95%' }
]

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
            trend: '+10% so với tháng trước',
            isPositive: true,
            icon: Users,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30'
        },
        {
            label: 'Tổng lượt khám',
            value: report?.totalConsultations?.toString() || '0',
            trend: 'Đang theo dõi',
            isPositive: true,
            icon: Activity,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/30'
        },
        {
            label: 'Tỷ lệ tái khám',
            value: (report?.retentionRate || 0) + '%',
            trend: 'Phát triển',
            isPositive: true,
            icon: Repeat,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30'
        },
        {
            label: 'Chỉ số CSAT',
            value: (report?.avgSatisfaction || 0).toFixed(1) + '/5',
            trend: 'Vượt kỳ vọng',
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

    const diseaseGroups = useMemo(() => {
        if (!report?.diseaseDistribution) return []
        const total = Object.values(report.diseaseDistribution).reduce((a, b) => a + b, 0)
        return Object.entries(report.diseaseDistribution).map(([name, count]) => ({
            name,
            percent: Math.round((count / total) * 100),
            color: name.includes('Tiểu đường') ? 'bg-emerald-600' : name.includes('Huyết áp') ? 'bg-emerald-500' : 'bg-amber-500'
        }))
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
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                        Báo cáo hàng tháng
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 text-sm italic">
                        Theo dõi và phân tích hiệu suất phòng khám trong tháng này
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end gap-4 w-full lg:w-auto">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600/10 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600/20 transition-all">
                            <FileText className="w-4 h-4" />
                            PDF
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600/10 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600/20 transition-all">
                            <TableIcon className="w-4 h-4" />
                            Excel
                        </button>
                    </div>
                    <div className="flex flex-col min-w-[200px] w-full sm:w-auto">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Chọn Tháng/Năm</p>
                        <select
                            value={`${selectedDate.month}/${selectedDate.year}`}
                            onChange={(e) => {
                                const [m, y] = e.target.value.split('/')
                                setSelectedDate({ month: parseInt(m), year: parseInt(y) })
                            }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold px-4 py-2.5 focus:ring-2 focus:ring-emerald-600/20 outline-none cursor-pointer"
                        >
                            <option value="10/2023">Tháng 10, 2023</option>
                            <option value="11/2023">Tháng 11, 2023</option>
                            <option value="12/2023">Tháng 12, 2023</option>
                            <option value="3/2026">Tháng 03, 2026</option>
                        </select>
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
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Thống kê lượt khám theo tuần</h3>
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
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">Nhóm bệnh mãn tính</h3>
                    <div className="flex flex-col items-center">
                        <div className="relative size-48 rounded-full border-[16px] border-slate-50 dark:border-slate-800/50 flex items-center justify-center mb-10 shadow-inner">
                            {/* Simple CSS-based visualization mock */}
                            <div className="absolute inset-[-16px] rounded-full border-[16px] border-emerald-600 border-t-transparent border-r-transparent rotate-45" />
                            <div className="absolute inset-[-16px] rounded-full border-[16px] border-emerald-500 border-l-transparent border-b-transparent -rotate-12" />
                            <div className="text-center">
                                <p className="text-3xl font-black text-slate-900 dark:text-white">420</p>
                                <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black mt-1">Bệnh nhân</p>
                            </div>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-4">
                            {diseaseGroups.map((group: any, i: number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`size-2.5 rounded-full ${group.color}`} />
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{group.name} ({group.percent}%)</span>
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
                    <table className="w-full text-left order-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-10 py-6">Bác sĩ</th>
                                <th className="px-10 py-6">Số ca đã khám</th>
                                <th className="px-10 py-6">Đơn thuốc điện tử đã kê</th>
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
