import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { PrescriptionModal } from '@/components/modals/PrescriptionModal'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { useQuery } from '@tanstack/react-query'
import {
    User,
    Mail,
    CalendarDays,
    Calendar as CalendarIcon,
    AlertTriangle,
    CheckCircle2,
    MoreVertical,
    TrendingUp,
    FileText,
    Send,
    Loader2,
    ChevronDown,
    X,
    Video,
    MapPin,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

import {
    AreaChart,
    Area,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts'

import { getDoctorDashboard, getDoctorPatients } from '@/api/doctor'

export function DoctorDashboard() {
    const { headers, tenantId } = useTenant()
    const navigate = useNavigate()
    const [timeRange, setTimeRange] = useState('7 ngày qua')
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
    const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false)
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)

    // ─── Dummy Data for Chart ───
    const communityHealthData = [
        { name: 'Th2', 'Chỉ số': 45 },
        { name: 'Th3', 'Chỉ số': 52 },
        { name: 'Th4', 'Chỉ số': 48 },
        { name: 'Th5', 'Chỉ số': 70 },
        { name: 'Th6', 'Chỉ số': 65 },
        { name: 'Th7', 'Chỉ số': 80 },
        { name: 'CN', 'Chỉ số': 75 },
    ]


    // ─── Fetch Real Data ───
    const { data: dashboard, isLoading: loadingDash } = useQuery({
        queryKey: ['doctor-dashboard', tenantId],
        queryFn: () => getDoctorDashboard(headers),
        enabled: !!tenantId
    })

    const { data: patientList, isLoading: loadingPatients } = useQuery({
        queryKey: ['doctor-patients', tenantId],
        queryFn: () => getDoctorPatients(headers, 0, 5),
        enabled: !!tenantId
    })

    if (loadingDash || loadingPatients) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="font-bold text-sm uppercase tracking-widest">Đang tải dữ liệu thực tế...</p>
            </div>
        )
    }

    const stats = [
        {
            label: 'Tổng bệnh nhân',
            value: dashboard?.totalPatientsToday.toLocaleString() || '1,250',
            trend: '+2.4%',
            trendIcon: TrendingUp,
            icon: User,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            label: 'Nguy cơ cao',
            value: dashboard?.riskPatients.length.toString() || '12',
            trend: 'Cảnh báo',
            isWarning: true,
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-100 dark:bg-red-900/30'
        },
        {
            label: 'Lịch hẹn chờ',
            value: dashboard?.pendingConsultations.toString() || '08',
            icon: CalendarDays,
            color: 'text-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            label: 'Tin nhắn mới',
            value: '05',
            icon: Mail,
            color: 'text-amber-500',
            bg: 'bg-amber-100 dark:bg-amber-900/30'
        }
    ]

    return (
        <div className="relative min-h-[calc(100vh-80px)] isolate px-8 py-8">
            {/* Background Decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="space-y-8 pb-12 animate-in fade-in duration-700 font-display">
                {/* ─── Summary Cards ─── */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                {stat.trend && (
                                    <span className={`text-xs font-bold ${stat.isWarning ? 'bg-red-500 text-white' : 'text-green-500'} flex items-center gap-1 ${stat.isWarning ? 'px-2 py-1 rounded-full' : ''}`}>
                                        {stat.trend} {stat.trendIcon && <stat.trendIcon className="w-3 h-3" />}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                            <p className={`text-3xl font-extrabold mt-1 ${stat.isWarning ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ─── High Risk Patients Section ─── */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-extrabold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500 fill-red-500/20" />
                                Phân tích nguy cơ cao
                            </h2>
                            <button onClick={() => navigate('/patients')} className="text-primary text-sm font-bold hover:underline">Xem tất cả</button>
                        </div>

                        <div className="space-y-4">
                            {dashboard?.riskPatients && dashboard.riskPatients.length > 0 ? (
                                dashboard.riskPatients.slice(0, 3).map((risk: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border-l-4 ${risk.riskLevel === 'CRITICAL' ? 'border-l-red-500' : 'border-l-amber-500'
                                            } border-y border-r border-primary/5 flex items-center justify-between shadow-sm group hover:border-primary transition-all cursor-pointer`}
                                        onClick={() => navigate(`/patients/${risk.patientId}/ehr`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
                                                {risk.patientAvatar ? (
                                                    <img src={risk.patientAvatar} alt={risk.patientName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-black text-slate-400 bg-slate-100 dark:bg-slate-800 text-xl">
                                                        {risk.patientName?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg group-hover:text-primary transition-colors">{risk.patientName}</p>
                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                    <span>65 tuổi</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span className="truncate max-w-[150px]">{risk.reason}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center px-6 hidden sm:block">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</p>
                                            <p className={`font-extrabold text-lg ${risk.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>{risk.riskLevel}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Hệ thống AI đề xuất</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full text-center ${risk.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {risk.riskLevel === 'CRITICAL' ? 'Nguy cấp' : 'Cần theo dõi'}
                                            </span>
                                            <button className="bg-primary text-slate-900 text-xs font-bold py-2 px-4 rounded-xl hover:bg-primary/90 transition-all shadow-sm active:scale-95">Chi tiết</button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-primary/20 text-center">
                                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-20" />
                                    <p className="text-sm font-bold text-slate-500">Không có cảnh báo nguy cơ</p>
                                </div>
                            )}
                        </div>

                        {/* ─── Health Trend Chart Preview ─── */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Xu hướng sức khỏe cộng đồng</h3>
                                    <p className="text-xs text-slate-500">Thống kê dữ liệu lâm sàng theo tuần</p>
                                </div>

                                {/* timeRange selection dropdown omitted for brevity, keeping simple button for now or just the text */}
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                                    {timeRange}
                                </div>
                            </div>

                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={communityHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="doctorCommunityGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4ade80" strokeOpacity={0.05} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                            dy={10}
                                        />
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                border: 'none',
                                                borderRadius: '16px',
                                                padding: '12px',
                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                                            }}
                                            itemStyle={{ color: '#4ade80', fontSize: '11px', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
                                            cursor={{ stroke: '#4ade80', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="Chỉ số"
                                            stroke="#4ade80"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#doctorCommunityGrad)"
                                            animationDuration={2000}
                                            dot={{ fill: '#4ade80', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#4ade80' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>

                    {/* Sidebar Area */}
                    <aside className="space-y-8">
                        {/* Quick Actions */}
                        <section>
                            <h2 className="text-xl font-extrabold mb-4">Thao tác nhanh</h2>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => setIsPrescriptionModalOpen(true)}
                                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 hover:border-primary transition-all rounded-2xl border border-primary/10 shadow-sm text-left group"
                                >
                                    <div className="w-10 h-10 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Kê đơn thuốc mới</span>
                                </button>

                                <button
                                    onClick={() => setIsAdviceModalOpen(true)}
                                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 hover:border-primary transition-all rounded-2xl border border-primary/10 shadow-sm text-left group"
                                >
                                    <div className="w-10 h-10 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Gửi lời khuyên</span>
                                </button>

                                <button
                                    onClick={() => setIsAppointmentModalOpen(true)}
                                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 hover:border-primary transition-all rounded-2xl border border-primary/10 shadow-sm text-left group"
                                >
                                    <div className="w-10 h-10 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
                                        <CalendarIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Đặt lịch tái khám</span>
                                </button>
                            </div>
                        </section>

                        {/* Recent Appointments */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-extrabold">Lịch hẹn khám sắp tới</h2>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm divide-y divide-primary/5 overflow-hidden">
                                {dashboard?.upcomingAppointments && dashboard.upcomingAppointments.length > 0 ? (
                                    dashboard.upcomingAppointments.slice(0, 3).map((apt: any, i: number) => (
                                        <div key={i} className="p-4 flex items-center gap-4 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => navigate('/scheduling')}>
                                            <div className="flex-shrink-0 text-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Hôm nay</p>
                                                <p className="text-lg font-extrabold text-primary leading-none">{apt.startTime?.slice(0, 5)}</p>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-bold truncate text-sm text-slate-900 dark:text-white uppercase">{apt.patientName}</p>
                                                <p className="text-xs text-slate-500 truncate">{apt.appointmentType || 'Khám định kỳ'}</p>
                                            </div>
                                            <MoreVertical className="w-4 h-4 text-slate-300" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-xs italic">Không có lịch hẹn hôm nay</div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/scheduling')}
                                className="w-full mt-4 py-3 border border-dashed border-primary/30 text-primary font-bold text-sm rounded-xl hover:bg-primary/5 transition-colors active:scale-[0.98]"
                            >
                                Xem toàn bộ lịch trình
                            </button>
                        </section>
                    </aside>
                </div>
            </div>

            {/* ─── Modals ─── */}

            {/* Prescription Modal */}
            <PrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
            />

            {/* Advice Modal */}
            <AnimatePresence>
                {isAdviceModalOpen && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
                        <div className="fixed inset-0" onClick={() => setIsAdviceModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-auto z-10"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-primary/10 flex justify-between items-center bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                                        <span className="material-symbols-outlined text-2xl text-primary">medical_services</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gửi lời khuyên chuyên môn</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs">Bác sĩ gửi khuyến nghị sức khỏe trực tiếp cho bệnh nhân</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAdviceModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                <div className="bg-primary/5 rounded-lg p-4 flex items-center justify-between border border-primary/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                            <Send className="w-6 h-6 text-primary opacity-50" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Bệnh nhân nhận</p>
                                            <p className="text-slate-900 dark:text-slate-100 font-bold">Nguyễn Văn A</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Mã bệnh nhân</p>
                                        <p className="text-primary font-mono font-bold">BN-12345678</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Lời khuyên của bác sĩ</label>
                                        <textarea
                                            rows={6}
                                            className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-primary/10 rounded-xl focus:border-primary outline-none transition-all resize-none font-medium placeholder:text-slate-400"
                                            placeholder="Nhập khuyến nghị..."
                                            defaultValue={`Dựa trên kết quả đo huyết áp 3 ngày gần đây có dấu hiệu tăng cao đột ngột vào buổi sáng. 

Bác sĩ khuyến nghị:
1. Tiếp tục duy trì thuốc Amlodipine 5mg đúng giờ.
2. Hạn chế sử dụng muối và các chất kích thích.
3. Cần đến phòng khám sớm để làm xét nghiệm máu tổng quát.`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-primary/10 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setIsAdviceModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={() => setIsAdviceModalOpen(false)}
                                    className="px-6 py-2.5 bg-primary text-slate-900 rounded-xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    Lưu & Gửi lời khuyên
                                </button>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>

            {/* Appointment Modal */}
            <AnimatePresence>
                {isAppointmentModalOpen && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
                        <div className="fixed inset-0" onClick={() => setIsAppointmentModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
                        >
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 p-2.5 rounded-xl text-primary">
                                        <CalendarIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Đặt lịch tái khám</h2>
                                </div>
                                <button
                                    onClick={() => setIsAppointmentModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chọn ngày</label>
                                            <input type="date" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-primary outline-none transition-all font-bold" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loại lịch hẹn</label>
                                            <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-primary outline-none transition-all font-bold appearance-none">
                                                <option>Khám định kỳ</option>
                                                <option>Xét nghiệm</option>
                                                <option>Tư vấn chuyên sâu</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chọn khung giờ</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                                                <button key={time} className="p-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold hover:border-primary hover:text-primary transition-all">
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setIsAppointmentModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={() => setIsAppointmentModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-900 bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    Lưu & Gửi thông báo
                                </button>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>
        </div>
    )
}
