import { useQuery } from '@tanstack/react-query'
import { getPortalDashboard, getPortalQueues, logPortalVital } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import { usePatientRealtime } from '@/hooks/usePatientRealtime'
import {
    Calendar,
    Activity,
    X,
    Send,
    Clock,
    Pill,
    Heart,
    Wind,
    Plus,
    TrendingUp,
    TrendingDown,
    MoreVertical,
    AlertTriangle,
    Check,
    User
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'

export default function PatientDashboard() {
    const { headers } = useTenant()

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

    const [isVitalModalOpen, setIsVitalModalOpen] = useState(false)

    // Enable Real-time updates
    usePatientRealtime(dashboard?.patientId, dashboard?.branchId)

    if (loadingDash) return <div className="p-8 text-center font-bold text-slate-400">Đang tải...</div>

    return (
        <div className="py-8 space-y-8">
            {/* 1. Profile Summary Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 items-center"
            >
                <div className="h-24 w-24 rounded-full bg-emerald-500/20 flex items-center justify-center overflow-hidden border-4 border-emerald-500/10">
                    <img
                        src={dashboard?.patientAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + dashboard?.patientName}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Chẩn đoán</p>
                        <p className="text-base font-bold text-emerald-500 truncate">
                            {dashboard?.recentVisits?.[0]?.diagnosisNotes || 'Đang theo dõi'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nhóm máu</p>
                        <p className="text-base font-bold">O+</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Thể trạng</p>
                        <p className="text-base font-bold">170cm | 68kg</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tiền sử</p>
                        <p className="text-base font-bold truncate">Tăng huyết áp</p>
                    </div>
                </div>
                <button className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap">
                    Chỉnh sửa hồ sơ
                </button>
            </motion.section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Metrics & Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Activity className="w-6 h-6 text-emerald-500" />
                            Chỉ số sức khỏe & Xu hướng
                        </h2>
                        <button
                            onClick={() => setIsVitalModalOpen(true)}
                            className="text-emerald-500 font-bold text-sm flex items-center gap-1 hover:text-emerald-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Nhập chỉ số mới
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Glucose Card (Mocking HTML Style) */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between mb-4">
                                <p className="text-sm font-medium text-slate-500">Đường huyết (mmol/L)</p>
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">Cận cao</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-6">
                                <p className="text-3xl font-bold">6.5</p>
                                <p className="text-rose-500 text-sm font-bold flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-1" /> 0.2%
                                </p>
                            </div>
                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[
                                        { day: 'T2', val: 6.0 },
                                        { day: 'T3', val: 6.2 },
                                        { day: 'T4', val: 5.8 },
                                        { day: 'T5', val: 6.5 },
                                        { day: 'T6', val: 6.3 },
                                        { day: 'T7', val: 6.4 },
                                        { day: 'CN', val: 6.5 },
                                    ]}>
                                        <defs>
                                            <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGlucose)" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                                <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                            </div>
                        </div>

                        {/* Blood Pressure Card (Mocking HTML Style) */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between mb-4">
                                <p className="text-sm font-medium text-slate-500">Huyết áp (mmHg)</p>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">Ổn định</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-6">
                                <p className="text-3xl font-bold">120/80</p>
                                <p className="text-emerald-500 text-sm font-bold flex items-center">
                                    <TrendingDown className="w-4 h-4 mr-1" /> 1.0%
                                </p>
                            </div>
                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { day: 'T2', val: 110 },
                                        { day: 'T3', val: 115 },
                                        { day: 'T4', val: 112 },
                                        { day: 'T5', val: 120 },
                                        { day: 'T6', val: 118 },
                                        { day: 'T7', val: 115 },
                                        { day: 'CN', val: 120 },
                                    ]}>
                                        <Bar dataKey="val" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.6} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                                <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-500">
                                <Heart className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Nhịp tim</p>
                                <p className="text-lg font-bold">72 bpm</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-500">
                                <Wind className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">SpO2</p>
                                <p className="text-lg font-bold">98%</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-500">
                                <Activity className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Cân nặng</p>
                                <p className="text-lg font-bold">68.5 kg</p>
                            </div>
                        </div>
                    </div>

                    {/* Active Queues if any */}
                    {(queues && queues.length > 0) && (
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                Hàng chờ trực tiếp
                            </h3>
                            <div className="grid gap-4">
                                {queues.map(q => (
                                    <div key={q.id} className="bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30 rounded-xl p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm font-bold italic">
                                                {q.queueName?.charAt(0) || 'Q'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-emerald-600/50 uppercase tracking-widest">{q.queueName || 'Hàng chờ'}</p>
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">{q.status === 'CALLED' ? 'Mời vào khám!' : 'Đang chờ...'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-emerald-600">~{q.estimatedWaitMinutes}p</p>
                                            <p className="text-[10px] font-bold text-emerald-600/60 uppercase">{q.peopleAhead} người phía trước</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Widgets */}
                <div className="space-y-6">
                    {/* 4. Automatic Alerts Widget */}
                    <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2 font-bold uppercase text-[10px] tracking-widest">
                            <AlertTriangle className="w-4 h-4" />
                            Cảnh báo quan trọng
                        </div>
                        <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                            {dashboard?.healthAlerts?.[0] || 'Đường huyết sáng nay cao hơn mức bình thường. Vui lòng kiểm tra lại chế độ ăn uống và thông báo cho bác sĩ.'}
                        </p>
                    </div>

                    {/* 2. Medication Management Widget */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-tight">
                                <Pill className="w-5 h-5 text-emerald-500" />
                                Lịch uống thuốc
                            </h3>
                            <Link to="/patient/history" className="text-xs text-emerald-500 font-bold hover:underline">Xem tất cả</Link>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Mock Medication Items to match HTML */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold">Metformin 500mg</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">08:00 AM • Đã uống</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-500 animate-pulse">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold">Lisinopril 10mg</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">01:00 PM • Cần uống</p>
                                </div>
                                <button className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors">
                                    Đã uống
                                </button>
                            </div>
                            {dashboard?.latestPrescription?.items.slice(0, 1).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold truncate">{item.productName}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">09:00 PM • Chờ</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. Follow-up Appointments Widget */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-tight">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            Lịch khám sắp tới
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border-l-4 border-emerald-500">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
                                        {dashboard?.nextAppointment
                                            ? new Date(dashboard.nextAppointment.appointmentDate).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' })
                                            : 'Ngày 15 Tháng 10'
                                        }
                                    </p>
                                    <p className="text-sm font-bold truncate">
                                        {dashboard?.nextAppointment?.appointmentType || 'Khám định kỳ Tiểu đường'}
                                    </p>
                                </div>
                                <button className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <User className="w-3.5 h-3.5" />
                                {dashboard?.nextAppointment?.patientName || 'BS. Lê Minh Tâm'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {dashboard?.nextAppointment?.startTime} - {dashboard?.nextAppointment?.endTime || '10:30 AM'}
                            </div>
                            <button className="w-full mt-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white transition-all">
                                Đặt lại lịch
                            </button>
                        </div>
                    </div>

                    {/* 6. Doctor Chat Widget */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-500/20 p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex-shrink-0 relative">
                            <img
                                alt="Doctor"
                                className="object-cover h-full w-full rounded-full"
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Doctor"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">BS. Lê Minh Tâm</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Đang trực tuyến</p>
                        </div>
                        <Link to="/patient/chat" className="bg-emerald-500 p-2 rounded-full text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all">
                            <Send className="w-4 h-4" />
                        </Link>
                    </div>
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
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl">
                            <X className="w-6 h-6 text-slate-300" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Tự ghi nhận Chỉ số</h3>
                            <p className="text-slate-400 font-medium text-sm mt-1">Theo dõi sức khỏe hàng ngày của bạn</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Loại chỉ số</label>
                                <select
                                    value={vitalType}
                                    onChange={(e) => setVitalType(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none"
                                >
                                    <option value="BLOOD_GLUCOSE">Đường huyết (Blood Glucose)</option>
                                    <option value="HEART_RATE">Nhịp tim (Heart Rate)</option>
                                    <option value="SPO2">Nồng độ Oxy (SpO2)</option>
                                    <option value="WEIGHT">Cân nặng (Weight)</option>
                                    <option value="TEMPERATURE">Nhiệt độ (Temperature)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Giá trị ({getUnitForType(vitalType)})</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="Nhập con số thu được..."
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Ghi chú (Không bắt buộc)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ví dụ: Đo lúc vừa thức dậy..."
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none h-24 resize-none"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
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
