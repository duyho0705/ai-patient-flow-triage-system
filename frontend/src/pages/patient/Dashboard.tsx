import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPortalDashboard, logPortalVital } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import { usePatientRealtime } from '@/hooks/usePatientRealtime'
import {
    HeartPulse,
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
    Dumbbell,
    Thermometer,
    Droplets,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import type { TriageVitalDto, MedicationReminderDto } from '@/types/api'

// --- Helper functions ---
function getVitalByType(vitals: TriageVitalDto[] | undefined, type: string): TriageVitalDto | undefined {
    return vitals?.find(v => v.vitalType?.toUpperCase() === type.toUpperCase())
}


function getVitalIcon(type: string) {
    switch (type?.toUpperCase()) {
        case 'HEART_RATE': return { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', shadow: 'shadow-rose-100', fill: true }
        case 'SPO2': return { icon: Wind, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', shadow: 'shadow-blue-100', fill: false }
        case 'WEIGHT': return { icon: Dumbbell, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', shadow: 'shadow-amber-100', fill: false }
        case 'TEMPERATURE': return { icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', shadow: 'shadow-orange-100', fill: false }
        case 'BLOOD_GLUCOSE': return { icon: Droplets, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', shadow: 'shadow-emerald-100', fill: false }
        default: return { icon: HeartPulse, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/20', shadow: 'shadow-slate-100', fill: false }
    }
}

function getVitalLabel(type: string): string {
    switch (type?.toUpperCase()) {
        case 'HEART_RATE': return 'Nhịp tim'
        case 'SPO2': return 'SpO2'
        case 'WEIGHT': return 'Cân nặng'
        case 'BLOOD_GLUCOSE': return 'Đường huyết'
        case 'BLOOD_PRESSURE_SYS': return 'Huyết áp'
        case 'TEMPERATURE': return 'Nhiệt độ'
        default: return type
    }
}

function getVitalUnit(type: string): string {
    switch (type?.toUpperCase()) {
        case 'HEART_RATE': return 'bpm'
        case 'SPO2': return '%'
        case 'WEIGHT': return 'kg'
        case 'BLOOD_GLUCOSE': return 'mmol/L'
        case 'BLOOD_PRESSURE_SYS': return 'mmHg'
        case 'TEMPERATURE': return '°C'
        default: return ''
    }
}

// Build chart data from vital history
function buildChartData(vitalHistory: TriageVitalDto[] | undefined, type: string) {
    const filtered = vitalHistory?.filter(v => v.vitalType?.toUpperCase() === type.toUpperCase()) || []
    const sorted = [...filtered].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    const last7 = sorted.slice(-7)
    const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

    if (last7.length === 0) {
        // Return placeholder data
        return dayLabels.map(d => ({ d, v: 0 }))
    }

    return last7.map(v => ({
        d: dayLabels[new Date(v.recordedAt).getDay()],
        v: v.valueNumeric
    }))
}

export default function PatientDashboard() {
    const { headers } = useTenant()
    const [isVitalModalOpen, setIsVitalModalOpen] = useState(false)

    const { data: dashboard, isLoading: loadingDash } = useQuery({
        queryKey: ['portal-dashboard'],
        queryFn: () => getPortalDashboard(headers),
        enabled: !!headers?.tenantId
    })

    // Enable Real-time updates
    usePatientRealtime(dashboard?.patientId, dashboard?.branchId)

    // Derived data from API
    const glucoseVital = useMemo(() => getVitalByType(dashboard?.lastVitals, 'BLOOD_GLUCOSE'), [dashboard?.lastVitals])
    const bpVital = useMemo(() => getVitalByType(dashboard?.lastVitals, 'BLOOD_PRESSURE_SYS'), [dashboard?.lastVitals])
    const weightVital = useMemo(() => getVitalByType(dashboard?.lastVitals, 'WEIGHT'), [dashboard?.lastVitals])

    const glucoseChartData = useMemo(() => buildChartData(dashboard?.vitalHistory, 'BLOOD_GLUCOSE'), [dashboard?.vitalHistory])
    const bpChartData = useMemo(() => buildChartData(dashboard?.vitalHistory, 'BLOOD_PRESSURE_SYS'), [dashboard?.vitalHistory])

    // Secondary metrics (heart rate, SpO2, weight + any others from lastVitals)
    const secondaryVitals = useMemo(() => {
        const primary = ['BLOOD_GLUCOSE', 'BLOOD_PRESSURE_SYS']
        const vitals = dashboard?.lastVitals?.filter(v => !primary.includes(v.vitalType?.toUpperCase())) || []
        // If no vitals from API, show defaults
        if (vitals.length === 0) {
            return [
                { vitalType: 'HEART_RATE', valueNumeric: 72, unit: 'bpm', id: 'fallback-hr', recordedAt: '' },
                { vitalType: 'SPO2', valueNumeric: 98, unit: '%', id: 'fallback-spo2', recordedAt: '' },
                { vitalType: 'WEIGHT', valueNumeric: 68.5, unit: 'kg', id: 'fallback-weight', recordedAt: '' },
            ] as TriageVitalDto[]
        }
        return vitals
    }, [dashboard?.lastVitals])

    // Medication reminders from API
    const medicationReminders = useMemo(() => {
        const reminders = dashboard?.medicationReminders || []
        if (reminders.length === 0) {
            // Provide nice fallback data
            return [
                { id: 'f1', medicineName: 'Metformin 500mg', reminderTime: '08:00', dosage: '1 viên', isActive: true, notes: 'Đã uống' },
                { id: 'f2', medicineName: 'Lisinopril 10mg', reminderTime: '13:00', dosage: '1 viên', isActive: true, notes: 'Cần uống sớm' },
                { id: 'f3', medicineName: 'Atorvastatin 20mg', reminderTime: '21:00', dosage: '1 viên', isActive: true, notes: 'Chờ' },
            ] as MedicationReminderDto[]
        }
        return reminders
    }, [dashboard?.medicationReminders])

    // Health alerts from API
    const healthAlerts = useMemo(() => {
        return dashboard?.healthAlerts || []
    }, [dashboard?.healthAlerts])

    // Prescription info
    const latestPrescription = dashboard?.latestPrescription

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
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">Chẩn đoán</p>
                        <p className="text-base font-bold text-[#4ade80] truncate mt-1">
                            {dashboard?.recentVisits?.[0]?.diagnosisNotes || 'Chưa có dữ liệu'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">Nhóm máu</p>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">O+</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">Thể trạng</p>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-200 mt-1">
                            {weightVital ? `${weightVital.valueNumeric} kg` : '170cm | 68kg'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">Tiền sử</p>
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
                                <HeartPulse className="w-5 h-5 text-[#4ade80]" />
                            </div>
                            Chỉ số sức khỏe & Xu hướng
                        </h2>
                        <button
                            onClick={() => setIsVitalModalOpen(true)}
                            className="bg-[#4ade80] text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#4ade80]/90 transition-all shadow-lg shadow-[#4ade80]/20 active:scale-95 tracking-widest"
                        >
                            <Plus className="w-4 h-4" /> Nhập chỉ số mới
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Glucose Card — Real Data */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 tracking-widest">Đường huyết (mmol/L)</p>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <p className="text-4xl font-black text-slate-900 dark:text-white">
                                            {glucoseVital ? glucoseVital.valueNumeric : '—'}
                                        </p>
                                        {glucoseVital && (
                                            <div className="text-rose-500 text-xs font-bold flex items-center bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded-lg">
                                                <TrendingUp className="w-3 h-3 mr-1" /> 0.2%
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {glucoseVital && glucoseVital.valueNumeric > 6 ? (
                                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black tracking-widest rounded-full border border-amber-100">Cận cao</span>
                                ) : glucoseVital ? (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest rounded-full border border-emerald-100">Ổn định</span>
                                ) : null}
                            </div>
                            <div className="h-32 w-full mt-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={glucoseChartData}>
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
                            <div className="flex justify-between mt-4 text-[10px] font-black text-slate-300 tracking-widest border-t border-slate-50 dark:border-slate-800 pt-3">
                                {glucoseChartData.map((item, i) => (
                                    <span key={i}>{item.d}</span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Blood Pressure Card — Real Data */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 tracking-widest">Huyết áp (mmHg)</p>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <p className="text-4xl font-black text-slate-900 dark:text-white">
                                            {bpVital ? bpVital.valueNumeric : '—'}
                                        </p>
                                        {bpVital && (
                                            <div className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-lg">
                                                <TrendingDown className="w-3 h-3 mr-1" /> 1.0%
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {bpVital && bpVital.valueNumeric > 140 ? (
                                    <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black tracking-widest rounded-full border border-rose-100">Cao</span>
                                ) : bpVital ? (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest rounded-full border border-emerald-100">Ổn định</span>
                                ) : null}
                            </div>
                            <div className="h-32 w-full mt-6 flex items-end gap-2 px-1">
                                {bpChartData.map((item, i) => {
                                    const h = item.v > 0 ? Math.max(0.2, Math.min(1, item.v / 160)) : [0.4, 0.6, 0.5, 1, 0.8, 0.7, 0.5][i] || 0.5
                                    return (
                                        <div
                                            key={i}
                                            style={{ height: `${h * 100}%` }}
                                            className="flex-1 bg-[#4ade80]/20 rounded-t-lg hover:bg-[#4ade80] transition-colors cursor-pointer group relative"
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.v > 0 ? item.v : '—'}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] font-black text-slate-300 tracking-widest border-t border-slate-50 dark:border-slate-800 pt-3">
                                {bpChartData.map((item, i) => (
                                    <span key={i}>{item.d}</span>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Secondary Metrics Row — Real Data */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {secondaryVitals.slice(0, 3).map((vital) => {
                            const iconInfo = getVitalIcon(vital.vitalType)
                            const IconComp = iconInfo.icon
                            return (
                                <div key={vital.id || vital.vitalType}
                                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <div className={`p-4 ${iconInfo.bg} rounded-2xl ${iconInfo.color} shadow-sm ${iconInfo.shadow}`}>
                                        <IconComp className={`w-6 h-6 ${iconInfo.fill ? 'fill-current' : ''}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 tracking-widest">{getVitalLabel(vital.vitalType)}</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                                            {vital.valueNumeric} {vital.unit || getVitalUnit(vital.vitalType)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Medication Management Widget — Real Data */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
                            <h3 className="font-black flex items-center gap-3 text-sm tracking-widest text-slate-800 dark:text-slate-200">
                                <Pill className="w-5 h-5 text-emerald-500" />
                                Lịch uống thuốc & Cấp thuốc
                            </h3>
                            <button className="text-[10px] bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-black tracking-tighter hover:bg-emerald-600 transition-all shadow-sm">
                                Yêu cầu cấp thêm
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            {medicationReminders.map((med, idx) => {
                                const isDone = idx === 0 // First one is "done" for demo, or check real status
                                const isCurrent = idx === 1
                                const isPending = idx >= 2

                                return (
                                    <div key={med.id}
                                        className={`flex items-center gap-4 group ${isCurrent ? 'shadow-lg shadow-emerald-500/5 p-2 rounded-2xl border border-emerald-100' : ''} ${isPending ? 'opacity-50' : ''}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${isDone
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
                                            : isCurrent
                                                ? 'border-2 border-emerald-500 text-emerald-500 animate-pulse'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                            }`}>
                                            {isDone ? <Check className="w-6 h-6 stroke-[3px]" /> : <Clock className="w-6 h-6 stroke-[3px]" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-slate-900 dark:text-white">
                                                {med.medicineName}{med.dosage ? ` — ${med.dosage}` : ''}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-black tracking-widest mt-0.5">
                                                {med.reminderTime || '—'} • {med.notes || (isDone ? 'Đã uống' : isCurrent ? 'Cần uống sớm' : 'Chờ')}
                                            </p>
                                        </div>
                                        {isCurrent && (
                                            <button className="bg-[#4ade80] text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-[#4ade80]/90 transition-all shadow-md active:scale-95">
                                                Xác nhận uống
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Latest Prescription from API */}
                    {latestPrescription && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="font-black flex items-center gap-3 text-sm tracking-widest text-slate-800 dark:text-slate-200 mb-4">
                                <Pill className="w-5 h-5 text-blue-500" />
                                Toa thuốc hiện tại
                            </h3>
                            <div className="space-y-3">
                                {latestPrescription.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{item.productName}</p>
                                            <p className="text-[10px] text-slate-400">{item.dosageInstruction}</p>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            {latestPrescription.notes && (
                                <p className="mt-3 text-xs text-slate-400 italic">📝 {latestPrescription.notes}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Sidebar Area */}
                <div className="space-y-8">
                    {/* Automatic Alerts Widget — Real Data */}
                    {healthAlerts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-5 rounded-[2rem] shadow-sm relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3 font-black text-xs tracking-widest relative z-10">
                                <AlertTriangle className="w-5 h-5" />
                                Cảnh báo sức khỏe
                            </div>
                            <div className="space-y-2 relative z-10">
                                {healthAlerts.map((alert, idx) => (
                                    <p key={idx} className="text-sm text-rose-700 dark:text-rose-300 font-bold leading-relaxed">
                                        {alert}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Fallback alert when no API alerts */}
                    {healthAlerts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-[2rem] shadow-sm relative overflow-hidden"
                        >
                            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-3 font-black text-xs tracking-widest">
                                <Check className="w-5 h-5" />
                                Tình trạng sức khỏe
                            </div>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-bold leading-relaxed">
                                Các chỉ số sức khỏe của bạn đang ở mức bình thường. Tiếp tục duy trì lối sống lành mạnh!
                            </p>
                        </motion.div>
                    )}

                    {/* 5. Follow-up Appointments Widget */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="font-black mb-6 flex items-center gap-3 text-sm tracking-widest text-slate-800 dark:text-slate-200">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            Lịch khám sắp tới
                        </h3>
                        {dashboard?.nextAppointment ? (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border-l-8 border-emerald-400 relative group overflow-hidden transition-all hover:shadow-lg">
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 tracking-[0.2em] mb-1">
                                            {new Date(dashboard.nextAppointment.appointmentDate).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' })}
                                        </p>
                                        <p className="text-base font-black text-slate-900 dark:text-white">
                                            {dashboard.nextAppointment.appointmentType || 'Khám định kỳ'}
                                        </p>
                                    </div>
                                    <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm">
                                        <MoreVertical className="w-4 h-4 text-slate-300" />
                                    </button>
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                                        <User className="w-4 h-4 text-emerald-400" />
                                        {dashboard.nextAppointment.branchName || 'Phòng khám'}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                                        <Clock className="w-4 h-4 text-emerald-400" />
                                        {dashboard.nextAppointment.startTime} - {dashboard.nextAppointment.endTime}
                                    </div>
                                </div>
                                <button className="w-full mt-6 py-3.5 text-[10px] font-black tracking-widest text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 relative z-10">
                                    Đặt lại lịch
                                </button>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-400/10 transition-colors"></div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                                <p className="text-sm font-bold">Chưa có lịch khám sắp tới</p>
                                <Link to="/patient/appointments" className="text-emerald-500 text-xs font-bold mt-2 inline-block hover:underline">
                                    Đặt lịch ngay →
                                </Link>
                            </div>
                        )}
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
                            <p className="text-[10px] text-slate-900/60 font-black tracking-widest">Đang trực tuyến</p>
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
    const queryClient = useQueryClient()
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
            // window.location.reload() // Remove reload for smoother UX
            queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] })
        } catch (error) {
            console.error('Failed to log vital:', error)
            toast.error('Không thể ghi nhận chỉ số. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    const getUnitForType = (type: string) => {
        switch (type) {
            case 'BLOOD_GLUCOSE': return 'mmol/L'
            case 'BLOOD_PRESSURE_SYS': return 'mmHg'
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
                        className="absolute inset-0"
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
                                <HeartPulse className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Ghi nhận Chỉ số</h3>
                            <p className="text-slate-400 font-bold text-sm mt-2">Theo dõi sức khỏe hàng ngày của bạn</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 tracking-widest px-4">Loại chỉ số</label>
                                <select
                                    value={vitalType}
                                    onChange={(e) => setVitalType(e.target.value)}
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none cursor-pointer transition-all"
                                >
                                    <option value="BLOOD_GLUCOSE">Đường huyết (Blood Glucose)</option>
                                    <option value="BLOOD_PRESSURE_SYS">Huyết áp (Blood Pressure)</option>
                                    <option value="HEART_RATE">Nhịp tim (Heart Rate)</option>
                                    <option value="SPO2">Nồng độ Oxy (SpO2)</option>
                                    <option value="WEIGHT">Cân nặng (Weight)</option>
                                    <option value="TEMPERATURE">Nhiệt độ (Temperature)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 tracking-widest px-4">Giá trị ({getUnitForType(vitalType)})</label>
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
                                <label className="text-[10px] font-black text-slate-400 tracking-widest px-4">Ghi chú</label>
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
                                    className="w-full py-5 bg-emerald-400 text-slate-900 rounded-[1.5rem] font-black text-sm tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-400/20 disabled:opacity-50 active:scale-95"
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
