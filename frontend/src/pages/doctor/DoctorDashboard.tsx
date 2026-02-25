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
        color: string;
    }

    // Mock Data to match Dashboard.html exactly
    const stats = [
        { label: 'Tổng bệnh nhân', value: '1,250', trend: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
        { label: 'Nguy cơ cao', value: '42', trend: '+5%', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-l-4 border-l-red-500' },
        { label: 'Lịch khám', value: '15', trend: 'Hôm nay', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
        { label: 'Tỷ lệ tuân thủ', value: '88.5%', trend: '+3%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' }
    ]

    const criticalInsights = [
        {
            id: '#BN0042',
            name: 'Lê Thị B',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABsmgDCIftEUxlChjXh4knmVlplDSUWQUr6AtxTrzRKkSkUcwNTvaC8wX4bzmoZ8sYq_78RzSJlEcHza3v9KboPSldDmpZtm6yTwMimwvcd41nnJ-pN7jD5eAm1PVFXeu5b3L40qmMjmhO5RPqBb5q3shFB6CRgOTvg3oVtJ8-fWXd8WrYDuLb0QZNyduWrjGBtFYMRKnFZ5L8od-M2DbMomIyMbe59KKabagR87DhtAFci98eFAFcP59EODWpeR5mWyKyLePWVcI',
            status: 'Nguy cấp',
            message: 'Chỉ số Glucose tăng vọt: 185 mg/dL (Tăng 25% trong 24h)',
            type: 'critical'
        },
        {
            id: '#BN0891',
            name: 'Trần Văn C',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-SnB2x4cztkQhgnbedBxDvMr_jjfA_nCXXUKnMdmu1OqTkdQIPRi9Tn93XVyrekNq9ItG-JFBhIVhphD2bPPndbouWg9tXrvwGbeXPjaX-dn3NxVXp_3dYm9IOfxuijM1c_a61lBmc4M0ayxZGSzU0M9J7zOVeOhuovurjMEa9wTdecMKhRCpbg23tXyeD60yiY0j2_3ouXdjnn3VHP0u9Kb3AMvE-f8Tr5Yds-9kyHlLA-ZBXVSy7G0Gl4LwnHgz-R2_aDddx_8',
            status: 'Theo dõi',
            message: 'Huyết áp dao động bất thường: 145/95 mmHg (3 lần đo gần nhất)',
            type: 'watch'
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
        <div className="space-y-8 animate-in fade-in duration-700 bg-background-light-blue dark:bg-background-dark-blue -m-8 p-8 min-h-screen">
            {/* Custom Header matching Dashboard.html */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Tổng quan</h1>
                    <p className="text-slate-500">Theo dõi trạng thái sức khỏe bệnh nhân trong thời gian thực</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bệnh nhân bằng tên, ID hoặc số điện thoại..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 shadow-sm outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg">
                            <Filter className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Thứ 3, 24 Tháng 5</p>
                            <p className="text-xs text-slate-500">08:30 AM</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md ${s.border || ''}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 ${s.bg} ${s.color} rounded-xl shadow-inner`}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${s.trend.startsWith('+') ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                                {s.trend}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</p>
                        <h3 className={`text-3xl font-black tracking-tightest ${s.color === 'text-red-600' ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                            {s.value}
                        </h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Critical Insights */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20 rounded-t-[2rem]">
                        <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-red-500" />
                            Cảnh báo nguy cơ Real-time
                        </h3>
                        <button className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline transition-all">Tất cả insight</button>
                    </div>
                    <div className="p-8 space-y-5">
                        {criticalInsights.map((insight, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx}
                                className={`flex items-center gap-6 p-6 rounded-[1.5rem] border transition-all hover:shadow-md ${insight.type === 'critical'
                                    ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                                    : 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                                    }`}
                            >
                                <div className="relative">
                                    <img
                                        className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-slate-800"
                                        src={insight.avatar}
                                        alt={insight.name}
                                    />
                                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${insight.type === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-black text-slate-900 dark:text-white uppercase truncate tracking-tight">{insight.name} <span className="text-[10px] font-bold text-slate-400 ml-2">ID: {insight.id}</span></p>
                                        <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-[0.1em] ${insight.type === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 border border-red-200/50' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 border border-amber-200/50'}`}>
                                            {insight.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                        {insight.message}
                                    </p>
                                </div>
                                <button className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                                    <Send className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chart Mockup */}
                    <div className="p-8 pt-0 mt-auto">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 h-64 flex flex-col border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
                                XU HƯỚNG HUYẾT ÁP - BỆNH NHÂN TRẦN VĂN C
                            </p>
                            <div className="flex-1 flex items-end gap-3 px-2">
                                <div className="flex-1 bg-blue-600/10 rounded-t-xl h-[40%] transition-all hover:bg-blue-600/20"></div>
                                <div className="flex-1 bg-blue-600/10 rounded-t-xl h-[45%] transition-all hover:bg-blue-600/20"></div>
                                <div className="flex-1 bg-blue-600/15 rounded-t-xl h-[60%] transition-all hover:bg-blue-600/25"></div>
                                <div className="flex-1 bg-blue-600/20 rounded-t-xl h-[55%] transition-all hover:bg-blue-600/30"></div>
                                <div className="flex-1 bg-blue-600/40 rounded-t-xl h-[75%] transition-all hover:bg-blue-600/50"></div>
                                <div className="flex-1 bg-red-400/80 rounded-t-xl h-[90%] transition-all hover:bg-red-500 shadow-lg shadow-red-500/10"></div>
                                <div className="flex-1 bg-red-500 rounded-t-xl h-[85%] transition-all hover:bg-red-600 shadow-lg shadow-red-600/10"></div>
                            </div>
                            <div className="flex justify-between text-[10px] mt-6 text-slate-400 font-black uppercase tracking-[0.25em] px-2">
                                <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-8">
                    {/* Action Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h3 className="font-black text-xl mb-3 tracking-tight">Thao tác nhanh</h3>
                            <p className="text-blue-100 text-xs font-bold leading-relaxed mb-10 opacity-80 uppercase tracking-widest">Gửi cảnh báo & Khuyến nghị sức khỏe tập trung</p>
                            <div className="space-y-4">
                                <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all border border-white/10">
                                    <Megaphone className="w-5 h-5" />
                                    Gửi cảnh báo khẩn cấp
                                </button>
                                <button className="w-full bg-white text-blue-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-95">
                                    <MessageCircle className="w-5 h-5" />
                                    Khuyến nghị sức khỏe
                                </button>
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                    </motion.div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3 italic">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Lịch hẹn sắp tới
                        </h3>
                        <div className="space-y-8">
                            {upcomingAppointments.map((app, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i}
                                    className="flex items-center gap-5 group cursor-default"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700 transition-all group-hover:border-blue-500/30 group-hover:bg-blue-50/10">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter opacity-70">{app.month}</span>
                                        <span className="text-xl font-black text-slate-800 dark:text-slate-200 leading-none">{app.date}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate text-slate-900 dark:text-white group-hover:text-blue-600 transition-all uppercase tracking-tight">{app.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{app.disease} • {app.time}</p>
                                    </div>
                                    <button className="p-2 text-slate-200 hover:text-blue-600 transition-all">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-4 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-[0.3em] border-t border-slate-50 dark:border-slate-800">
                            Quản lý lịch trình
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Management Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-12 pb-4">
                <div className="p-10 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/20">
                    <div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tightest">Danh sách bệnh nhân quản lý</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest text-[10px]">Tổng số 1,250 hồ sơ đang được giám sát</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition-all border border-slate-100 dark:border-slate-700 shadow-sm">Lọc bệnh lý</button>
                        <button className="px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 dark:hover:bg-blue-700 shadow-xl shadow-slate-900/10 transition-all">Xuất báo cáo</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] border-b border-slate-100 dark:border-slate-800">
                                <th className="px-10 py-6">Bệnh nhân</th>
                                <th className="px-10 py-6">Chẩn đoán</th>
                                <th className="px-10 py-6">Chỉ số mới</th>
                                <th className="px-10 py-6 text-center">Mức độ rủi ro</th>
                                <th className="px-10 py-6 text-right">Tương tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {patients.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-xs shadow-inner shadow-slate-900/5 ${p.color === 'red' ? 'bg-red-50 text-red-600' : p.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {p.initial}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-all">{p.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">{p.id} • {p.age} tuổi</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center sm:text-left">
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(p.disease) ? p.disease.map((d, di) => (
                                                <span key={di} className="px-2.5 py-1.5 bg-slate-100/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-tighter rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                                                    {d}
                                                </span>
                                            )) : (
                                                <span className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-tighter rounded-xl border ${p.disease.includes('Tiểu đường') ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30' : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30'}`}>
                                                    {p.disease}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className={`text-sm font-black tracking-tight ${p.color === 'red' ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{p.metric}</p>
                                        <p className="text-[10px] text-slate-300 font-bold italic uppercase tracking-widest mt-1 opacity-50">{p.updated}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-3 items-center">
                                            <div className="w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${p.riskLevel}%` }}
                                                    className={`h-full shadow-lg ${p.color === 'red' ? 'bg-red-500 shadow-red-500/20' : p.color === 'amber' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-green-500 shadow-green-500/20'}`}
                                                ></motion.div>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${p.color === 'red' ? 'text-red-600' : p.color === 'amber' ? 'text-amber-600' : 'text-green-600'}`}>
                                                {p.risk}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-all">
                                            <button className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 rounded-2xl transition-all" title="View Analytics">
                                                <BarChart3 className="w-5 h-5" />
                                            </button>
                                            <button className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 rounded-2xl transition-all" title="Secure Chat">
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                            <button className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-300 hover:text-blue-600 rounded-2xl transition-all" title="Prescribe">
                                                <FileText className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-10 bg-slate-50/30 dark:bg-slate-800/20 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-t border-slate-100 dark:border-slate-800">
                    <p className="opacity-70">Showing 10 of 1,250 Patients</p>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">Prev</button>
                        <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-xl shadow-blue-600/20 transition-all text-blue-50">1</button>
                        <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">2</button>
                        <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
