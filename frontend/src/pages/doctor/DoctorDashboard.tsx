import {
    Users,
    Bell,
    Settings,
    Search,
    Filter,
    ClipboardList,
    Calendar,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Send,
    Megaphone,
    MessageCircle,
    MoreVertical,
    BarChart3,
    FileText,
    TrendingUp,
    ChevronRight,
    Clock,
    LayoutDashboard,
    Activity,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function DoctorDashboard() {
    const [searchTerm, setSearchTerm] = useState('')

    // Patient Type
    type PatientData = {
        id: string;
        name: string;
        initial: string;
        age: number;
        disease: string | string[];
        metric: string;
        updated: string;
        risk: string;
        riskLevel: number;
        color: 'green' | 'red' | 'amber';
    }

    const stats = [
        { label: 'Tổng bệnh nhân', value: '1,250', trend: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Nguy cơ cao', value: '42', trend: '+5%', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Lịch khám', value: '15', trend: 'Hôm nay', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Tỷ lệ tuân thủ', value: '88.5%', trend: '+3%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' }
    ]

    const criticalInsights = [
        {
            id: '#BN0042',
            name: 'Lê Thị B',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
            status: 'Nguy cấp',
            message: 'Chỉ số Glucose tăng vọt: 185 mg/dL (Tăng 25% trong 24h)',
            type: 'critical',
            bgColor: 'bg-[#FFF5F5]',
            borderColor: 'border-[#FFE3E3]'
        },
        {
            id: '#BN0891',
            name: 'Trần Văn C',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            status: 'Theo dõi',
            message: 'Huyết áp dao động bất thường: 145/95 mmHg (3 lần đo gần nhất)',
            type: 'watch',
            bgColor: 'bg-[#FFFAF0]',
            borderColor: 'border-[#FFF0D0]'
        }
    ]

    const upcomingAppointments = [
        { name: 'Phạm Minh Đăng', disease: 'Tiểu đường Type 2', time: '09:15', date: '24', month: 'MAY' },
        { name: 'Nguyễn Hoàng Nam', disease: 'Huyết áp cao', time: '10:30', date: '24', month: 'MAY' }
    ]

    const patients: PatientData[] = [
        { id: 'BN-5521', name: 'Nguyễn Linh', initial: 'NL', age: 45, disease: 'Tiểu đường Type 2', metric: 'Glucose: 120 mg/dL', updated: '2 giờ trước', risk: 'Ổn định', riskLevel: 30, color: 'green' },
        { id: 'BN-0042', name: 'Lê Thị B', initial: 'LB', age: 62, disease: 'Cao huyết áp', metric: 'Glucose: 185 mg/dL', updated: '15 phút trước', risk: 'Nguy hiểm', riskLevel: 85, color: 'red' },
        { id: 'BN-0891', name: 'Trần Văn C', initial: 'TV', age: 55, disease: ['Béo phì', 'Mỡ máu'], metric: 'BP: 145/95 mmHg', updated: '1 giờ trước', risk: 'Trung bình', riskLevel: 60, color: 'amber' }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700 bg-[#f8fafc] dark:bg-[#0f172a] -m-8 p-8 min-h-screen font-sans">
            {/* Standard Header */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Tổng quan</h1>
                    <p className="text-slate-500 text-sm">Theo dõi trạng thái sức khỏe bệnh nhân trong thời gian thực</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bệnh nhân..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 shadow-sm outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg relative border border-transparent hover:border-slate-200">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>
                        <div className="text-right hidden md:block px-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Thứ 3, 24 Tháng 5</p>
                            <p className="text-xs text-slate-500 font-medium">08:30 AM</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 ${s.bg} ${s.color} rounded-xl`}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${s.trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                {s.trend}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{s.label}</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {s.value}
                        </h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Critical Insights Box (Image 3 style) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-3">
                            <div className="p-1.5 bg-red-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-red-500" />
                            </div>
                            Phân tích nguy cơ & Cảnh báo (Real-time)
                        </h3>
                        <button className="text-sm text-blue-600 font-semibold hover:underline">Xem tất cả</button>
                    </div>
                    <div className="p-6 space-y-4">
                        {criticalInsights.map((insight, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-4 p-4 rounded-2xl border ${insight.bgColor} ${insight.borderColor} transition-all`}
                            >
                                <img
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    src={insight.avatar}
                                    alt={insight.name}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                                        {insight.name} <span className="text-xs font-medium text-slate-500 ml-1">(ID: {insight.id})</span>
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                                        {insight.message}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${insight.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {insight.status}
                                    </span>
                                    <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart (Image 3 style) */}
                    <div className="p-6 pt-0 mt-auto">
                        <div className="bg-[#f8fafc] dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col border border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-6">
                                XU HƯỚNG CHỈ SỐ HUYẾT ÁP - BỆNH NHÂN TRẦN VĂN C
                            </p>
                            <div className="flex-1 flex items-end gap-3 px-2 h-40">
                                <div className="flex-1 bg-blue-200 rounded-t-md h-[40%]" title="T2"></div>
                                <div className="flex-1 bg-blue-200 rounded-t-md h-[45%]" title="T3"></div>
                                <div className="flex-1 bg-blue-300 rounded-t-md h-[60%]" title="T4"></div>
                                <div className="flex-1 bg-blue-400 rounded-t-md h-[55%]" title="T5"></div>
                                <div className="flex-1 bg-blue-500 rounded-t-md h-[75%]" title="T6"></div>
                                <div className="flex-1 bg-[#ff6b6b] rounded-t-md h-[95%]" title="T7"></div>
                                <div className="flex-1 bg-[#ff4d4d] rounded-t-md h-[85%]" title="CN"></div>
                            </div>
                            <div className="flex justify-between text-[10px] mt-4 text-slate-400 font-bold px-2">
                                <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel (Image 1 style) */}
                <div className="space-y-6">
                    {/* Thao tác nhanh card */}
                    <div className="bg-[#1D70D6] rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                        <h3 className="font-bold text-xl mb-2">Thao tác nhanh</h3>
                        <p className="text-blue-100 text-xs mb-8">Gửi thông báo sức khỏe cho nhóm bệnh nhân mục tiêu</p>
                        <div className="space-y-3 relative z-10">
                            <button className="w-full bg-white/20 hover:bg-white/30 text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all">
                                <Megaphone className="w-5 h-5" />
                                Gửi cảnh báo khẩn cấp
                            </button>
                            <button className="w-full bg-white text-blue-600 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all hover:bg-slate-50 shadow-lg">
                                <MessageCircle className="w-5 h-5" />
                                Khuyến nghị sức khỏe
                            </button>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Lịch khám sắp tới */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-3 mb-6">
                            <div className="p-1.5 bg-blue-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            Lịch khám sắp tới (3)
                        </h3>
                        <div className="space-y-6">
                            {upcomingAppointments.map((app, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex flex-col items-center justify-center border border-blue-50">
                                        <span className="text-[9px] font-bold text-blue-600 uppercase leading-none mb-1">{app.month}</span>
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-none">{app.date}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{app.name}</p>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{app.disease} • {app.time}</p>
                                    </div>
                                    <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Patient Table (Image 2 style) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display">Danh sách bệnh nhân đang quản lý</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Tổng cộng 1,250 bệnh nhân trong danh sách của bạn</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-2">
                            Lọc theo bệnh lý
                        </button>
                        <button className="px-4 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200">
                            Xuất báo cáo
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f8fafc] dark:bg-slate-800/30 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4">Bệnh nhân</th>
                                <th className="px-6 py-4">Bệnh lý chính</th>
                                <th className="px-6 py-4">Chỉ số mới nhất</th>
                                <th className="px-6 py-4 text-center">Mức độ nguy cơ</th>
                                <th className="px-6 py-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {patients.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${p.color === 'red' ? 'bg-red-50 text-red-600' : p.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {p.initial}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-none mb-1">{p.name}</p>
                                                <p className="text-[10px] font-medium text-slate-500">{p.id} • {p.age} tuổi</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {Array.isArray(p.disease) ? p.disease.map((d, di) => (
                                                <span key={di} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-700">
                                                    {d}
                                                </span>
                                            )) : (
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${p.disease.includes('Tiểu đường') ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {p.disease}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className={`text-sm font-bold ${p.color === 'red' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{p.metric}</p>
                                        <p className="text-[10px] text-slate-400 font-medium italic">Cập nhật: {p.updated}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2 items-center">
                                            <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${p.color === 'red' ? 'bg-red-500' : p.color === 'amber' ? 'bg-amber-500' : 'bg-green-500'}`}
                                                    style={{ width: `${p.riskLevel}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase ${p.color === 'red' ? 'text-red-600' : p.color === 'amber' ? 'text-amber-600' : 'text-green-600'}`}>
                                                {p.risk}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-all">
                                            <button className="text-slate-600 hover:text-blue-600" title="Analytics">
                                                <BarChart3 className="w-5 h-5" />
                                            </button>
                                            <button className="text-slate-600 hover:text-blue-600" title="Message">
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                            <button className="text-slate-600 hover:text-blue-600" title="Notes">
                                                <FileText className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-[#f8fafc] border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-500">
                    <p>Hiển thị 10 trong 1,250 kết quả</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white text-slate-400 disabled:opacity-50" disabled>Trước</button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                        <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white">2</button>
                        <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white">Sau</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
