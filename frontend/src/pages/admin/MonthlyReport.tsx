import {
    Users,
    Activity,
    Repeat,
    Smile,
    TrendingUp,
    TrendingDown,
    Search,
    Star,
    StarHalf,
    FileText,
    Table as TableIcon,
    MoreHorizontal,
    CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function MonthlyReport() {
    const [selectedMonth, setSelectedMonth] = useState('11/2023')

    const stats = [
        {
            label: 'Bệnh nhân mới',
            value: '120',
            trend: '+12% so với tháng trước',
            isPositive: true,
            icon: Users,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30'
        },
        {
            label: 'Tổng lượt khám',
            value: '850',
            trend: '-5% mục tiêu tháng',
            isPositive: false,
            icon: Activity,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/30'
        },
        {
            label: 'Tỷ lệ tái khám',
            value: '65%',
            trend: '+2.4% so với tháng trước',
            isPositive: true,
            icon: Repeat,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/30'
        },
        {
            label: 'Chỉ số CSAT',
            value: '4.8/5',
            trend: 'Vượt 5% mức kỳ vọng',
            isPositive: true,
            icon: Smile,
            isCheck: true,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/30'
        }
    ]

    const weeklyData = [
        { week: 'Tuần 1', height: '70%', value: '180 lượt' },
        { week: 'Tuần 2', height: '85%', value: '210 lượt' },
        { week: 'Tuần 3', height: '60%', value: '150 lượt' },
        { week: 'Tuần 4', height: '95%', value: '240 lượt' }
    ]

    const diseaseGroups = [
        { name: 'Tiểu đường', percent: 35, color: 'bg-emerald-600' },
        { name: 'Huyết áp', percent: 40, color: 'bg-emerald-500' },
        { name: 'Tim mạch', percent: 15, color: 'bg-amber-500' },
        { name: 'Khác', percent: 10, color: 'bg-slate-400' }
    ]

    const doctorPerformance = [
        { name: 'TS. BS. Nguyễn Lan', initials: 'NL', visits: 185, prescriptions: 172, rating: 4.9, color: 'bg-emerald-100 text-emerald-600' },
        { name: 'BS. Phạm Văn Hùng', initials: 'PV', visits: 162, prescriptions: 158, rating: 4.8, color: 'bg-emerald-100 text-emerald-600' },
        { name: 'ThS. BS. Lê Thu Trà', initials: 'LT', visits: 205, prescriptions: 198, rating: 4.7, color: 'bg-indigo-100 text-indigo-600', halfStar: true },
        { name: 'BS. Dương Thành Đạt', initials: 'DT', visits: 145, prescriptions: 135, rating: 4.9, color: 'bg-orange-100 text-orange-600' }
    ]

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
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold px-4 py-2.5 focus:ring-2 focus:ring-emerald-600/20 outline-none cursor-pointer"
                        >
                            <option>Tháng 10, 2023</option>
                            <option value="11/2023">Tháng 11, 2023</option>
                            <option>Tháng 12, 2023</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
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
                        {weeklyData.map((data, i) => (
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
                            {diseaseGroups.map((group, i) => (
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
                                <th className="px-10 py-6">Toa thuốc đã kê</th>
                                <th className="px-10 py-6 text-right">Đánh giá trung bình</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {doctorPerformance.map((doc, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`size-10 rounded-2xl ${doc.color} flex items-center justify-center font-black text-xs transition-transform group-hover:scale-110 shadow-sm`}>
                                                {doc.initials}
                                            </div>
                                            <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-sm font-bold text-slate-600 dark:text-slate-300">{doc.visits}</td>
                                    <td className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{doc.prescriptions}</td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5 bg-amber-50 dark:bg-amber-900/20 w-fit ml-auto px-4 py-1.5 rounded-full">
                                            <span className="text-amber-600 text-xs font-black">{doc.rating}</span>
                                            {doc.halfStar ? <StarHalf className="w-3.5 h-3.5 text-amber-500 fill-current" /> : <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />}
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
