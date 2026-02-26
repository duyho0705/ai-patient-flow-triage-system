import {
    Users,
    Activity,
    Calendar,
    AlertCircle,
    Search,
    Zap,
    Filter,
    Stethoscope
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function ManagerDashboard() {
    const [searchTerm, setSearchTerm] = useState('')

    const stats = [
        {
            label: 'Tổng bệnh nhân CDM',
            value: '1,250',
            trend: '+5%',
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30'
        },
        {
            label: 'Tỷ lệ tái khám',
            value: '84%',
            trend: '-2%',
            icon: Calendar,
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-900/30'
        },
        {
            label: 'Bệnh nhân nguy cơ cao',
            value: '12',
            trend: 'Cần can thiệp',
            icon: AlertCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-100 dark:bg-rose-900/30'
        }
    ]

    const missedPatients = [
        {
            name: 'Nguyễn Văn A',
            condition: 'Tiểu đường Type 2',
            lastVisit: '10/01/2024',
            missedDays: 15,
            assignedDoctor: 'BS. Trần Thị B',
            status: 'Nguy cơ cao',
            statusColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArzUHkVaUYsqNLybKMo5y2WYFzgq08-ZZkLF7B1Lgt8xJOXwRoegO7O_niMszu_rk7ETgs4ZhPoyi-px-gJmH0KUC9QAoX06EGkvVcHUg5xy4_hcl0c6vPRDf2ugLadcl6zt_434zmKjGDtuXms4axA_t9AU4AF957QBPUgDOmBsi6BT85Q8pePtKNeOr_-6bSexBz0t1XTnTaZRJj8yYgAX9hy47z7-0eY-slr4wqhmzG2YGUbxH21FK-JC6LiOdGd8gBxPOqmnM'
        },
        {
            name: 'Lê Văn C',
            condition: 'Huyết áp cao',
            lastVisit: '05/02/2024',
            missedDays: 7,
            assignedDoctor: 'BS. Nguyễn Văn D',
            status: 'Theo dõi',
            statusColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUsRIZwauItU6naKL-TlulJndXroqZ22B3ph8FnWGcqEFGRZukVcICUyn-mPQM4kWKFmXg2bRdF1p_JDCuZZ_VmnB2UMsOz90U7tIGs-OHZDETJZgZpnfBHSJ5E1nrQ0EJmOGlbs6xLLh1-7fujAkOMsQLkNXi6zPnJEAUm8pem1XTHnGH6m7LmphXie26eSFBYscT2wejlysSXghWdnnbEdOlBZWDQFscwXGoigVnaAzumnJpIp6JG1NzQOBs3VzlMjQ-J9qieZ4'
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-600/20">
                        <Activity className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tightest uppercase text-lg">
                            Giám sát điều trị CDM
                        </h1>
                        <p className="text-slate-500 font-bold text-sm">
                            Phân tích tỷ lệ tuân thủ và can thiệp bệnh nhân trễ lịch.
                        </p>
                    </div>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        className="w-full h-11 pl-10 pr-4 rounded-xl border-none bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-emerald-600/20 text-sm font-medium"
                        placeholder="Tìm kiếm bệnh nhân..."
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${stat.trend.includes('+') || stat.trend.includes('%') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-black uppercase tracking-wider mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tightest">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Missed Follow-up Table */}
            <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Bệnh nhân trễ lịch tái khám</h2>
                        <p className="text-sm text-slate-400 font-bold mt-1">Danh sách cần can thiệp nhắc hẹn sớm</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all">
                            <Filter className="w-4 h-4" />
                            Lọc dữ liệu
                        </button>
                        <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
                            <Zap className="w-4 h-4" />
                            Nhắc hẹn hàng loạt
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-8 py-4">Bệnh nhân / Bệnh lý</th>
                                <th className="px-8 py-4 text-center">Ngày khám cuối</th>
                                <th className="px-8 py-4 text-center">Số ngày trễ</th>
                                <th className="px-8 py-4 text-center">Bác sĩ phụ trách</th>
                                <th className="px-8 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {missedPatients.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                                                <img src={p.avatar} className="w-full h-full object-cover" alt={p.name} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{p.name}</p>
                                                <p className="text-xs text-emerald-500 font-bold">{p.condition}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center text-xs font-bold text-slate-500">{p.lastVisit}</td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-black ${p.missedDays > 10 ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'}`}>
                                            {p.missedDays} ngày
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center justify-center gap-2">
                                            <Stethoscope className="w-3.5 h-3.5" />
                                            {p.assignedDoctor}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                                            Gọi điện / Nhắn tin
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer CDM Info */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50 dark:border-slate-800 opacity-60">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-600/10 text-emerald-600 p-2 rounded-lg">
                        <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CDM Clinical Manager v2.4</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">© Hệ thống quản lý điều trị bệnh mãn tính thông minh.</p>
            </div>
        </div>
    )
}
