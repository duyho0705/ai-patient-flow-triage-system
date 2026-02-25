import {
    Users,
    Star,
    Clock,
    Smile,
    Download,
    Calendar,
    ChevronDown,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function DoctorPerformance() {
    const [searchTerm, setSearchTerm] = useState('')

    const summaryCards = [
        {
            label: 'Tổng số ca khám',
            value: '1,250',
            trend: '+12%',
            trendColor: 'text-green-600 bg-green-100',
            icon: Users,
            iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
            iconColor: 'text-emerald-600'
        },
        {
            label: 'Đánh giá trung bình',
            value: '4.8/5',
            trend: '+0.2',
            trendColor: 'text-green-600 bg-green-100',
            icon: Star,
            iconBg: 'bg-yellow-50 dark:bg-yellow-900/30',
            iconColor: 'text-yellow-600'
        },
        {
            label: 'Thời gian khám TB',
            value: '15 phút',
            trend: '-2m',
            trendColor: 'text-red-600 bg-red-100',
            icon: Clock,
            iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
            iconColor: 'text-indigo-600'
        },
        {
            label: 'Tỷ lệ hài lòng',
            value: '96%',
            trend: '+5%',
            trendColor: 'text-green-600 bg-green-100',
            icon: Smile,
            iconBg: 'bg-purple-50 dark:bg-purple-900/30',
            iconColor: 'text-purple-600'
        }
    ]

    const chartData = [
        { name: 'BS. Nam', height: '85%', value: 210 },
        { name: 'BS. Lan', height: '70%', value: 185 },
        { name: 'BS. Minh', height: '45%', value: 120 },
        { name: 'BS. Tuấn', height: '95%', value: 240 },
        { name: 'BS. Linh', height: '60%', value: 160 },
        { name: 'BS. Đức', height: '80%', value: 205 }
    ]

    const feedbacks = [
        { name: 'Nguyễn Văn A', sentiment: 'positive', content: 'Bác sĩ Nam rất tận tâm, giải thích bệnh tình kỹ lưỡng...' },
        { name: 'Lê Thị B', sentiment: 'positive', content: 'Thời gian chờ đợi nhanh hơn lần trước, dịch vụ rất tốt.' },
        { name: 'Trần Văn C', sentiment: 'neutral', content: 'Bác sĩ khám nhanh nhưng cần tư vấn thêm về chế độ ăn.' }
    ]

    const doctorsDetail = [
        {
            name: 'Nguyễn Văn Nam',
            initials: 'TN',
            specialty: 'Nội tổng quát',
            cases: 210,
            completion: 98,
            rating: 4.9,
            avgTime: '12 phút',
            status: 'Thưởng',
            statusColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        },
        {
            name: 'Trần Thị Lan',
            initials: 'TL',
            specialty: 'Nhi khoa',
            cases: 185,
            completion: 94,
            rating: 4.7,
            avgTime: '15 phút',
            status: 'Thưởng',
            statusColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        },
        {
            name: 'Vũ Văn Minh',
            initials: 'VM',
            specialty: 'Tai Mũi Họng',
            cases: 120,
            completion: 82,
            rating: 4.2,
            avgTime: '22 phút',
            status: 'Cần cải thiện',
            statusColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        },
        {
            name: 'Phạm Minh Tuấn',
            initials: 'PT',
            specialty: 'Sản phụ khoa',
            cases: 240,
            completion: 99,
            rating: 5.0,
            avgTime: '10 phút',
            status: 'Thưởng',
            statusColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                        Báo cáo Hiệu suất Bác sĩ
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 text-sm italic">
                        Phân tích và theo dõi chất lượng dịch vụ của đội ngũ y tế
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-2.5 shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-xs font-bold">01/10/2023 - 31/10/2023</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                    </div>
                    <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:ring-2 hover:ring-emerald-600/5 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 ${card.iconBg} rounded-xl text-emerald-600 group-hover:scale-110 transition-transform`}>
                                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                            </div>
                            <span className={`${card.trendColor} text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter`}>
                                {card.trend}
                            </span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{card.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{card.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Chart and Feedback Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">So sánh số ca khám theo bác sĩ</h3>
                        <div className="flex items-center gap-2">
                            <select className="text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-600/10 cursor-pointer">
                                <option>7 ngày qua</option>
                                <option>30 ngày qua</option>
                            </select>
                            <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between h-64 gap-6 px-4">
                        {chartData.map((data, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                <div className="w-full bg-emerald-600/5 rounded-2xl relative h-48 overflow-hidden flex items-end justify-center">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: data.height }}
                                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                        className="w-2/3 bg-emerald-600 rounded-2xl transition-all group-hover:bg-emerald-700"
                                    />
                                    <div className="absolute -top-10 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white px-3 py-1.5 rounded-lg pointer-events-none">
                                        {data.value}
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest rotate-45 lg:rotate-0 truncate w-full text-center">
                                    {data.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient Feedback */}
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Phản hồi từ bệnh nhân</h3>
                    <div className="mb-8 p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phân tích cảm xúc</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Tích cực (88%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full" style={{ width: '88%' }}></div>
                            <div className="bg-amber-400 h-full" style={{ width: '8%' }}></div>
                            <div className="bg-rose-500 h-full" style={{ width: '4%' }}></div>
                        </div>
                    </div>
                    <div className="space-y-4 overflow-y-auto max-h-64 flex-1 pr-2 custom-scrollbar">
                        {feedbacks.map((f, i) => (
                            <div key={i} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-emerald-600/10 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`size-2 rounded-full ${f.sentiment === 'positive' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Bệnh nhân: {f.name}</p>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                                    "{f.content}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Chi tiết hiệu suất bác sĩ</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm bác sĩ..."
                                className="w-full pl-11 pr-4 py-3 rounded-2xl border-none bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-600/10 text-xs font-bold shadow-sm"
                            />
                        </div>
                        <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-800">
                            <Filter className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-10 py-6">Tên bác sĩ</th>
                                <th className="px-10 py-6">Chuyên khoa</th>
                                <th className="px-10 py-6">Số ca đã khám</th>
                                <th className="px-10 py-6">Tỷ lệ hoàn thành</th>
                                <th className="px-10 py-6">Đánh giá trung bình</th>
                                <th className="px-10 py-6">Thời gian khám TB</th>
                                <th className="px-10 py-6">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {doctorsDetail.map((doc, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs transition-transform group-hover:scale-110 shadow-sm">
                                                {doc.initials}
                                            </div>
                                            <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{doc.specialty}</td>
                                    <td className="px-10 py-6 font-black text-slate-900 dark:text-white">{doc.cases}</td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="bg-emerald-600 h-full" style={{ width: `${doc.completion}%` }}></div>
                                            </div>
                                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{doc.completion}%</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-1.5 text-yellow-500">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-sm font-black">{doc.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-xs font-bold text-slate-500">{doc.avgTime}</td>
                                    <td className="px-10 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${doc.statusColor}`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-8 bg-slate-50/10 dark:bg-slate-800/20 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Đang hiển thị 4 trong số 12 bác sĩ</span>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all">
                            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        {[1, 2, 3].map(p => (
                            <button key={p} className={`size-9 rounded-xl text-[10px] font-black transition-all border ${p === 1 ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}>
                                {p}
                            </button>
                        ))}
                        <button className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
