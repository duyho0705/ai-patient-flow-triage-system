import { useQuery } from '@tanstack/react-query'
import { getPortalDashboard, getPortalQueues, logPortalVital } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import { usePatientRealtime } from '@/hooks/usePatientRealtime'
import {
    Activity,
    Plus,
    TrendingUp,
    TrendingDown,
    Heart,
    Wind,
    AlertTriangle,
    Pill,
    Check,
    Clock,
    Calendar,
    MoreVertical,
    Send,
    User,
    X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function PatientDashboard() {
    const { headers } = useTenant()
    const [isVitalModalOpen, setIsVitalModalOpen] = useState(false)

    const { data: dashboard, isLoading: loadingDash } = useQuery({
        queryKey: ['portal-dashboard'],
        queryFn: () => getPortalDashboard(headers),
        enabled: !!headers?.tenantId
    })

    const { data: queues } = useQuery({
        queryKey: ['portal-queues'],
        queryFn: () => getPortalQueues(headers),
        enabled: !!headers?.tenantId
    })

    // Enable Real-time updates
    usePatientRealtime(dashboard?.patientId, dashboard?.branchId)

    if (loadingDash) return <div className="p-8 text-center font-bold text-slate-400">Đang tải bảng điều khiển...</div>

    return (
        <div className="py-8 space-y-8 bg-slate-50/10 dark:bg-transparent min-h-screen">
            {/* 1. Profile Summary section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 items-center"
            >
                <div className="h-24 w-24 rounded-full bg-[#4ade80]/20 flex items-center justify-center overflow-hidden border-4 border-[#4ade80]/10 shadow-inner">
                    <img
                        alt="Patient Avatar"
                        className="h-full w-full object-cover"
                        src={dashboard?.patientAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDtszSUkFV8-ySPzx5ShEcygZMGlLkCDs4d0864MNknx5EExH89OU4c8yPh8OVN1hs4lphO6fiLk2zNxiEVtKYNCEmFI8wlHiQWp_eNhWhDrDTnx0CzMMhMxEazQTGHz9vkoPO8nr1skAG0vHgWNL9WYSMCVUQCb0F38yyb4j9YXgtT9zCiHC8m8luedS4ciJqp8z63x9_AVk2Iy6aAsM3rPa-p8uNkLf-Ai8Ztas1voDuD-ytltUPtIAtEVk2Zdfo5YiyAOwuAFVk"}
                    />
                </div>
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chẩn đoán</p>
                        <p className="text-base font-bold text-[#4ade80] truncate mt-1">
                            {dashboard?.recentVisits?.[0]?.diagnosisNotes || 'Tiểu đường Tuýp 2'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhóm máu</p>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">O+</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thể trạng</p>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">170cm | 68kg</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiền sử</p>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">Tăng huyết áp</p>
                    </div>
                </div>
                <button className="px-6 py-2.5 bg-[#4ade80] text-slate-900 rounded-xl font-bold text-sm hover:bg-[#4ade80]/90 transition-all shadow-lg shadow-[#4ade80]/20 active:scale-95 whitespace-nowrap">
                    Chỉnh sửa hồ sơ
                </button>
            </motion.section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Health Metrics Input & Charts Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                            <div className="p-2 bg-[#4ade80]/10 rounded-lg">
                                <Activity className="w-5 h-5 text-[#4ade80]" />
                            </div>
                            Chỉ số sức khỏe & Xu hướng
                        </h2>
                        <button
                            onClick={() => setIsVitalModalOpen(true)}
                            className="bg-[#4ade80] text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#4ade80]/90 transition-all shadow-lg shadow-[#4ade80]/20 active:scale-95 uppercase tracking-widest"
                        >
                            <Plus className="w-4 h-4" /> Nhập chỉ số mới
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Glucose Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đường huyết (mmol/L)</p>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <p className="text-4xl font-black text-slate-900 dark:text-white">6.5</p>
                                        <div className="text-rose-500 text-xs font-bold flex items-center bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded-lg">
                                            <TrendingUp className="w-3 h-3 mr-1" /> 0.2%
                                        </div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">Cận cao</span>
                            </div>
                            <div className="h-32 w-full mt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[
                                        { d: 'T2', v: 6.0 }, { d: 'T3', v: 6.2 }, { d: 'T4', v: 5.8 },
                                        { d: 'T5', v: 6.5 }, { d: 'T6', v: 6.3 }, { d: 'T7', v: 6.4 }, { d: 'CN', v: 6.5 }
                                    ]}>
                                        <defs>
                                            <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4ade80" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="v" stroke="#4ade80" strokeWidth={3} fill="url(#glucoseGrad)" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800 pt-3">
                                <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                            </div>
                        </motion.div>

                        {/* Blood Pressure Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Huyết áp (mmHg)</p>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <p className="text-4xl font-black text-slate-900 dark:text-white">120/80</p>
                                        <div className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-lg">
                                            <TrendingDown className="w-3 h-3 mr-1" /> 1.0%
                                        </div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Ổn định</span>
                            </div>
                            <div className="h-32 w-full mt-6 flex items-end gap-2 px-1">
                                {[0.4, 0.6, 0.5, 1, 0.8, 0.7, 0.5].map((h, i) => (
                                    <div
                                        key={i}
                                        style={{ height: `${h * 100}%` }}
                                        className="flex-1 bg-[#4ade80]/20 rounded-t-lg hover:bg-[#4ade80] transition-colors cursor-pointer group relative"
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h * 100 + 40}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800 pt-3">
                                <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-500 shadow-sm shadow-rose-100">
                                <Heart className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhịp tim</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">72 bpm</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-500 shadow-sm shadow-blue-100">
                                <Wind className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SpO2</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">98%</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-500 shadow-sm shadow-amber-100">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cân nặng</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">68.5 kg</p>
                            </div>
                        </div>
                    </div>

                    {/* Live Queue component integration */}
                    {(queues && queues.length > 0) && (
                        <div className="space-y-4 pt-6">
                            <h3 className="text-lg font-black flex items-center gap-3 px-2 text-slate-800 dark:text-white">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4ade80]"></span>
                                </span>
                                Hàng chờ trực tiếp
                            </h3>
                            <div className="grid gap-4">
                                {queues.map(q => (
                                    <motion.div
                                        key={q.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-3xl p-6 flex items-center justify-between shadow-sm"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-[#4ade80] shadow-sm font-black text-xl italic border border-[#4ade80]/10">
                                                {q.queueName?.charAt(0) || 'Q'}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[#4ade80] uppercase tracking-[0.2em]">{q.queueName || 'Phòng khám'}</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                                                    {q.status === 'CALLED' ? 'Mời bạn vào khám!' : 'Đang trong hàng chờ'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-[#4ade80]">~{q.estimatedWaitMinutes}p</p>
                                            <p className="text-[10px] font-black text-[#4ade80]/60 uppercase tracking-widest">{q.peopleAhead} người phía trước</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar Area */}
                <div className="space-y-8">
                    {/* 4. Automatic Alerts Widget */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-5 rounded-[2rem] shadow-sm"
                    >
                        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3 font-black text-xs uppercase tracking-widest">
                            <AlertTriangle className="w-5 h-5" />
                            Cảnh báo quan trọng
                        </div>
                        <p className="text-sm text-rose-700 dark:text-rose-300 font-bold leading-relaxed">
                            {dashboard?.healthAlerts?.[0] || 'Đường huyết sáng nay cao hơn mức bình thường. Vui lòng kiểm tra lại chế độ ăn uống và thông báo cho bác sĩ.'}
                        </p>
                    </motion.div>

                    {/* 2. Medication Management Widget */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
                            <h3 className="font-black flex items-center gap-3 text-sm uppercase tracking-widest text-slate-800 dark:text-slate-200">
                                <Pill className="w-5 h-5 text-emerald-500" />
                                Lịch uống thuốc
                            </h3>
                            <Link to="/patient/history" className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter hover:underline">Xem tất cả</Link>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center transition-all group-hover:scale-110">
                                    <Check className="w-6 h-6 stroke-[3px]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">Metformin 500mg</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">08:00 AM • Đã uống</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-2xl border-2 border-emerald-500 text-emerald-500 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/10 transition-all group-hover:scale-110">
                                    <Clock className="w-6 h-6 stroke-[3px]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">Lisinopril 10mg</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">01:00 PM • Cần uống</p>
                                </div>
                                <button className="bg-[#4ade80] text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#4ade80]/90 transition-all shadow-md active:scale-95">
                                    Đã uống
                                </button>
                            </div>
                            <div className="flex items-center gap-4 group opacity-50">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center group-hover:scale-110">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">Atorvastatin 20mg</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">09:00 PM • Chờ</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Follow-up Appointments Widget */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="font-black mb-6 flex items-center gap-3 text-sm uppercase tracking-widest text-slate-800 dark:text-slate-200">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            Lịch khám sắp tới
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border-l-8 border-emerald-400 relative group overflow-hidden transition-all hover:shadow-lg">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">
                                        {dashboard?.nextAppointment
                                            ? new Date(dashboard.nextAppointment.appointmentDate).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' })
                                            : 'Ngày 15 Tháng 10'
                                        }
                                    </p>
                                    <p className="text-base font-black text-slate-900 dark:text-white">
                                        {dashboard?.nextAppointment?.appointmentType || 'Khám định kỳ Tiểu đường'}
                                    </p>
                                </div>
                                <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm">
                                    <MoreVertical className="w-4 h-4 text-slate-300" />
                                </button>
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                                    <User className="w-4 h-4 text-emerald-400" />
                                    {dashboard?.nextAppointment?.patientName || 'BS. Lê Minh Tâm'}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                    {dashboard?.nextAppointment?.startTime} - {dashboard?.nextAppointment?.endTime || '10:30 AM'}
                                </div>
                            </div>
                            <button className="w-full mt-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 relative z-10">
                                Đặt lại lịch
                            </button>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-400/10 transition-colors"></div>
                        </div>
                    </div>

                    {/* 6. Doctor Chat Widget */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-emerald-400 dark:bg-emerald-500 rounded-[2rem] p-5 flex items-center gap-4 shadow-xl shadow-emerald-400/20 group cursor-pointer"
                    >
                        <div className="h-14 w-14 rounded-2xl bg-slate-900 flex-shrink-0 relative overflow-hidden transition-transform group-hover:rotate-3">
                            <img
                                alt="Doctor"
                                className="object-cover h-full w-full opacity-90"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcFUhTbj4SPfWKM3951CEKYvigAczulFrCd8MjzxK28AaIMv7rvM-pUcSN0_6i5RwtX13a876QeZic-WXjKbruzJO_MU1VLhaf8sTaTC6xMBJBLlegIlBVQ7-ay4KFBKDc9Kp4d4VxiW4W55X3BgzMhYJVpEUOsX5zvapaAutwwZ5jNXGYRXvYYdfIxJ3NoXT7vE_s_WQFoBz8nq_gOTbZG2UuGnw6hWILVqM-4JvKFVl6gyFJVzgir_vEEj_UoPOP31YKYoxzHN8"
                            />
                            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">BS. Lê Minh Tâm</p>
                            <p className="text-[10px] text-slate-900/60 font-black uppercase tracking-widest">Đang trực tuyến</p>
                        </div>
                        <Link to="/patient/chat" className="bg-slate-900 p-3 rounded-2xl text-emerald-400 shadow-xl transition-all hover:scale-110 active:scale-90">
                            <Send className="w-5 h-5 fill-current" />
                        </Link>
                    </motion.div>
                </div>
            </div>

            <VitalInputModal
                isOpen={isVitalModalOpen}
                onClose={() => setIsVitalModalOpen(false)}
            />

            <footer className="h-12" />
        </div>
    )
}

function VitalInputModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { headers } = useTenant()
    const [loading, setLoading] = useState(false)
    const [vitalType, setVitalType] = useState('BLOOD_GLUCOSE')
    const [value, setValue] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!value) return

        setLoading(true)
        try {
            await logPortalVital({
                vitalType,
                valueNumeric: parseFloat(value),
                unit: getUnitForType(vitalType),
                recordedAt: new Date().toISOString(),
                notes
            }, headers)
            toast.success('Ghi nhận chỉ số thành công!')
            onClose()
            window.location.reload()
        } catch (error) {
            toast.error('Không thể ghi nhận chỉ số. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    const getUnitForType = (type: string) => {
        switch (type) {
            case 'BLOOD_GLUCOSE': return 'mg/dL'
            case 'WEIGHT': return 'kg'
            case 'HEART_RATE': return 'bpm'
            case 'SPO2': return '%'
            case 'TEMPERATURE': return '°C'
            default: return ''
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        className="bg-white rounded-[3rem] p-10 w-full max-w-md relative z-10 shadow-2xl border border-slate-100"
                    >
                        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl transition-all">
                            <X className="w-6 h-6 text-slate-300" />
                        </button>

                        <div className="mb-10 text-center">
                            <div className="size-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4">
                                <Activity className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Ghi nhận Chỉ số</h3>
                            <p className="text-slate-400 font-bold text-sm mt-2">Theo dõi sức khỏe hàng ngày của bạn</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Loại chỉ số</label>
                                <select
                                    value={vitalType}
                                    onChange={(e) => setVitalType(e.target.value)}
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none cursor-pointer transition-all"
                                >
                                    <option value="BLOOD_GLUCOSE">Đường huyết (Blood Glucose)</option>
                                    <option value="HEART_RATE">Nhịp tim (Heart Rate)</option>
                                    <option value="SPO2">Nồng độ Oxy (SpO2)</option>
                                    <option value="WEIGHT">Cân nặng (Weight)</option>
                                    <option value="TEMPERATURE">Nhiệt độ (Temperature)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Giá trị ({getUnitForType(vitalType)})</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="Nhập con số thu được..."
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Ghi chú</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ví dụ: Đo lúc vừa thức dậy..."
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none h-32 resize-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-emerald-400 text-slate-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-400/20 disabled:opacity-50 active:scale-95"
                                >
                                    {loading ? 'Đang lưu...' : 'Lưu chỉ số'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
