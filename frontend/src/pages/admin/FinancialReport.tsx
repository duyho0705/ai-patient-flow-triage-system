import {
    TrendingUp,
    FileText,
    ChevronRight,
    PieChart,
    Activity,
    CreditCard,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Table as TableIcon
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function FinancialReport() {
    const [reportType, setReportType] = useState('monthly')

    const metrics = [
        {
            label: 'Tổng doanh thu',
            value: '2.540.000.000đ',
            trend: '+12.5%',
            isPositive: true,
            icon: DollarSign,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30'
        },
        {
            label: 'Doanh thu khám bệnh',
            value: '1.200.000.000đ',
            trend: '-5.2%',
            isPositive: false,
            icon: Activity,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/30'
        },
        {
            label: 'Chi phí thuốc & vật tư',
            value: '840.000.000đ',
            trend: '+2.1%',
            isPositive: true,
            icon: CreditCard,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/30'
        },
        {
            label: 'Lợi nhuận ròng',
            value: '1.700.000.000đ',
            trend: '+15.8%',
            isPositive: true,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30'
        }
    ]

    const monthlyData = [
        { month: 'T1', height: '40%' },
        { month: 'T2', height: '55%' },
        { month: 'T3', height: '45%' },
        { month: 'T4', height: '70%' },
        { month: 'T5', height: '85%' },
        { month: 'T6', height: '95%', active: true }
    ]

    const departments = [
        { name: 'Tim mạch', percent: 45, color: 'bg-emerald-600', stroke: 'stroke-emerald-600' },
        { name: 'Nội khoa', percent: 25, color: 'bg-indigo-400', stroke: 'stroke-indigo-400' },
        { name: 'Nội tiết', percent: 15, color: 'bg-amber-400', stroke: 'stroke-amber-400' },
        { name: 'Khác', percent: 15, color: 'bg-emerald-400', stroke: 'stroke-emerald-400' }
    ]

    const tableData = [
        { period: 'Tháng 6, 2024', income: '2.540.000.000đ', expense: '840.000.000đ', profit: '1.700.000.000đ', status: 'Tăng trưởng tốt' },
        { period: 'Tháng 5, 2024', income: '2.257.000.000đ', expense: '790.000.000đ', profit: '1.467.000.000đ', status: 'Ổn định' },
        { period: 'Tháng 4, 2024', income: '1.890.000.000đ', expense: '820.000.000đ', profit: '1.070.000.000đ', status: 'Đạt mục tiêu' },
        { period: 'Tháng 3, 2024', income: '1.520.000.000đ', expense: '750.000.000đ', profit: '770.000.000đ', status: 'Dưới kì vọng' }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header with Export Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                        Báo cáo tài chính
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 text-sm italic">
                        Theo dõi và phân tích hiệu quả kinh doanh của phòng khám
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm transition-all">
                        <FileText className="w-4 h-4 text-rose-500" />
                        Xuất PDF
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm transition-all">
                        <TableIcon className="w-4 h-4 text-emerald-500" />
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* Time Filter Settings */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-fit">
                <button
                    onClick={() => setReportType('monthly')}
                    className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${reportType === 'monthly' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Theo tháng
                </button>
                <button
                    onClick={() => setReportType('quarterly')}
                    className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${reportType === 'quarterly' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Theo quý
                </button>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:ring-2 hover:ring-emerald-600/5 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 ${metric.bgColor} rounded-2xl text-emerald-600 transition-transform group-hover:scale-110`}>
                                <metric.icon className={`w-6 h-6 ${metric.color}`} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full ${metric.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {metric.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {metric.trend}
                            </span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{metric.label}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{metric.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            Xu hướng doanh thu (6 tháng qua)
                        </h3>
                        <div className="flex gap-2">
                            <div className="size-2 rounded-full bg-emerald-600" />
                            <div className="size-2 rounded-full bg-slate-200" />
                        </div>
                    </div>
                    <div className="h-72 flex items-end justify-between gap-4 px-4 relative">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-5">
                            {[1, 2, 3, 4, 5].map(j => <div key={j} className="border-t border-slate-900 w-full" />)}
                        </div>

                        {monthlyData.map((data, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: data.height }}
                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                    className={`w-full max-w-[40px] rounded-2xl transition-all cursor-pointer relative ${data.active ? 'bg-emerald-600 shadow-xl shadow-emerald-600/20' : 'bg-emerald-600/10 hover:bg-emerald-600/20'}`}
                                >
                                    {data.active && (
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                                            +15.8% Tháng này
                                        </div>
                                    )}
                                </motion.div>
                                <span className={`text-[10px] font-black ${data.active ? 'text-emerald-600' : 'text-slate-400'}`}>{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department Distribution */}
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10 flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-emerald-600" />
                        Cơ cấu doanh thu
                    </h3>
                    <div className="relative size-48 mx-auto flex items-center justify-center mb-10">
                        <svg className="w-full h-full transform -rotate-90 group" viewBox="0 0 36 36">
                            {/* Department segments - simplified SVG implementation */}
                            <motion.circle
                                initial={{ strokeDasharray: "0, 100" }}
                                animate={{ strokeDasharray: "45, 100" }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="stroke-emerald-600" cx="18" cy="18" fill="none" r="16" strokeWidth="4"
                            />
                            <motion.circle
                                initial={{ strokeDasharray: "0, 100", strokeDashoffset: 0 }}
                                animate={{ strokeDasharray: "25, 100", strokeDashoffset: -45 }}
                                transition={{ duration: 1.5, delay: 0.7 }}
                                className="stroke-indigo-400" cx="18" cy="18" fill="none" r="16" strokeWidth="4"
                            />
                            <motion.circle
                                initial={{ strokeDasharray: "0, 100", strokeDashoffset: 0 }}
                                animate={{ strokeDasharray: "15, 100", strokeDashoffset: -70 }}
                                transition={{ duration: 1.5, delay: 0.9 }}
                                className="stroke-amber-400" cx="18" cy="18" fill="none" r="16" strokeWidth="4"
                            />
                            <motion.circle
                                initial={{ strokeDasharray: "0, 100", strokeDashoffset: 0 }}
                                animate={{ strokeDasharray: "15, 100", strokeDashoffset: -85 }}
                                transition={{ duration: 1.5, delay: 1.1 }}
                                className="stroke-emerald-400" cx="18" cy="18" fill="none" r="16" strokeWidth="4"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">100%</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Tỉ trọng</span>
                        </div>
                    </div>
                    <div className="space-y-4 flex-1">
                        {departments.map((dept, idx) => (
                            <div key={idx} className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className={`size-3 rounded-full ${dept.color} transition-transform group-hover:scale-125`} />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{dept.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white">{dept.percent}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/20">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        Bảng tổng kết tài chính chi tiết
                    </h3>
                    <button className="text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                        Xem chi tiết <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-10 py-6">Thời gian</th>
                                <th className="px-10 py-6">Tổng thu nhập</th>
                                <th className="px-10 py-6">Tổng chi phí</th>
                                <th className="px-10 py-6">Lợi nhuận</th>
                                <th className="px-10 py-6">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {tableData.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                    <td className="px-10 py-6 text-sm font-black text-slate-800 dark:text-white tracking-tight">{row.period}</td>
                                    <td className="px-10 py-6 text-sm font-bold text-slate-600 dark:text-slate-300">{row.income}</td>
                                    <td className="px-10 py-6 text-sm font-bold text-slate-600 dark:text-slate-300">{row.expense}</td>
                                    <td className="px-10 py-6 text-sm font-black text-emerald-600">{row.profit}</td>
                                    <td className="px-10 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${row.status === 'Tăng trưởng tốt' ? 'bg-emerald-50 text-emerald-700' : row.status === 'Dưới kì vọng' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-8 bg-slate-50/10 dark:bg-slate-800/20 text-center">
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-700 hover:underline">
                        Xem lịch sử đầy đủ
                    </button>
                </div>
            </div>
        </div>
    )
}
