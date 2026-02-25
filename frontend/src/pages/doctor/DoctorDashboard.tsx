import {
    Users,
    ClipboardList,
    Calendar,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    MoreVertical,
    BarChart3,
    TrendingUp,
    ChevronRight,
    Megaphone,
    MessageCircle,
    FileText
} from 'lucide-react'
import { motion } from 'framer-motion'

export function DoctorDashboard() {

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
        <div className="space-y-8 animate-in fade-in duration-700 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Tổng quan</h1>
                <p className="text-slate-500 text-sm">Theo dõi trạng thái sức khỏe bệnh nhân trong thời gian thực</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-[13px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-[13px] group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Critical Analysis */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[13px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <span className="p-2 bg-red-50 text-red-500 rounded-xl">
                                    <TrendingUp className="w-5 h-5" />
                                </span>
                                Phân tích & Cảnh báo thời gian thực
                            </h3>
                            <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">Xem tất cả</button>
                        </div>

                        <div className="p-8 space-y-4 flex-1">
                            {criticalInsights.map((alert, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className={`${alert.bgColor} border ${alert.borderColor} p-5 rounded-3xl flex items-center gap-5 group hover:shadow-lg hover:shadow-red-500/5 transition-all cursor-pointer`}
                                >
                                    <div className="relative">
                                        <img className="w-14 h-14 rounded-2xl object-cover shadow-md" src={alert.avatar} alt={alert.name} />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <div className={`w-3 h-3 rounded-full ${alert.type === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-black text-slate-900 text-sm tracking-tight">{alert.name} <span className="text-slate-400 font-bold ml-1 text-xs">{alert.id}</span></p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${alert.type === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                {alert.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{alert.message}</p>
                                    </div>
                                    <button className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Chart Area */}
                        <div className="px-8 pb-8">
                            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 h-56 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Xu hướng chỉ số huyết áp (Tuần này)</p>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Bình thường</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Cảnh báo</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-end gap-3 px-2">
                                    {[40, 45, 60, 55, 75, 90, 85].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: 0.5 + (i * 0.05), duration: 0.8 }}
                                            className={`flex-1 rounded-t-xl transition-all duration-500 ${i > 4 ? 'bg-gradient-to-t from-red-400 to-red-500' : 'bg-gradient-to-t from-blue-400 to-blue-500 opacity-40 hover:opacity-100'}`}
                                        ></motion.div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-[10px] font-black mt-4 text-slate-400 px-1 uppercase tracking-tighter">
                                    <span>Thứ 2</span><span>Thứ 3</span><span>Thứ 4</span><span>Thứ 5</span><span>Thứ 6</span><span>Thứ 7</span><span>Chủ nhật</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Quick Actions Card */}
                    <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="font-black text-xl mb-2 tracking-tight">Thao tác nhanh</h3>
                            <p className="text-blue-100 text-xs font-medium mb-8 leading-relaxed">Gửi thông báo sức khỏe và hướng dẫn cho nhóm bệnh nhân mục tiêu</p>
                            <div className="space-y-4">
                                <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 border border-white/10">
                                    <Megaphone className="w-5 h-5" />
                                    Gửi cảnh báo khẩn
                                </button>
                                <button className="w-full bg-white hover:bg-blue-50 text-blue-600 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-800/20">
                                    <MessageCircle className="w-5 h-5" />
                                    Khuyến nghị sức khỏe
                                </button>
                            </div>
                        </div>
                        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                        <h3 className="font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 tracking-tight">
                            <span className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                                <Calendar className="w-5 h-5" />
                            </span>
                            Lịch khám hôm nay
                        </h3>
                        <div className="space-y-5">
                            {upcomingAppointments.map((apt, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + (i * 0.1) }}
                                    className="flex items-center gap-4 group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center border border-blue-100 dark:border-blue-900/30 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">{apt.month}</span>
                                        <span className="text-sm font-black tracking-tighter">{apt.date}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{apt.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{apt.disease} <span className="mx-1">•</span> {apt.time}</p>
                                    </div>
                                    <button className="p-2 text-slate-300 hover:text-slate-600">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-3 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-200 hover:text-blue-600 transition-all">Xem toàn bộ lịch</button>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Patient Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
                <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Danh sách bệnh nhân đang quản lý</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">Tổng cộng 1,250 bệnh nhân trong danh sách</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">Lọc nâng cao</button>
                        <button className="flex-1 md:flex-none px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">Xuất báo cáo</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="px-10 py-6">Bệnh nhân</th>
                                <th className="px-10 py-6">Bệnh lý & Chỉ số</th>
                                <th className="px-10 py-6">Phát hiện nguy cơ</th>
                                <th className="px-10 py-6 text-right">Hành động nhanh</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {patients.map((patient, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-110 transition-transform ${patient.color === 'green' ? 'bg-green-50 text-green-600' :
                                                    patient.color === 'red' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {patient.initial}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${patient.color === 'green' ? 'bg-green-500' :
                                                    patient.color === 'red' ? 'bg-red-500' : 'bg-amber-500'
                                                    }`}></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{patient.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{patient.id} <span className="mx-1">•</span> {patient.age} tuổi</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex flex-wrap gap-2">
                                                {Array.isArray(patient.disease) ? patient.disease.map((d, idx) => (
                                                    <span key={idx} className="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">{d}</span>
                                                )) : (
                                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">{patient.disease}</span>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{patient.metric}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="w-40 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${patient.riskLevel}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className={`h-full rounded-full ${patient.color === 'red' ? 'bg-red-500' :
                                                        patient.color === 'amber' ? 'bg-amber-500' : 'bg-green-500'
                                                        }`}
                                                ></motion.div>
                                            </div>
                                            <div className="flex justify-between items-center w-40">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${patient.color === 'red' ? 'text-red-600' :
                                                    patient.color === 'amber' ? 'text-amber-600' : 'text-green-600'
                                                    }`}>{patient.risk}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{patient.updated}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-white rounded-2xl shadow-sm transition-all" title="Phân tích">
                                                <BarChart3 className="w-5 h-5" />
                                            </button>
                                            <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-white rounded-2xl shadow-sm transition-all" title="Nhắn tin">
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                            <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-white rounded-2xl shadow-sm transition-all" title="Xử lý hồ sơ">
                                                <FileText className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="p-10 bg-slate-50/30 dark:bg-slate-800/30 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trang 1 / 125</p>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-95">1</button>
                        <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-95">2</button>
                        <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-95">3</button>
                        <button className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20 active:scale-95 relative z-10">4</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
