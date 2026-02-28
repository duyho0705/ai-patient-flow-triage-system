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
    Send,
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
import type { TriageVitalDto } from '@/types/api'

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
        return dashboard?.lastVitals?.filter(v => !primary.includes(v.vitalType?.toUpperCase())) || []
    }, [dashboard?.lastVitals])

    // Medication reminders from API
    const medicationReminders = useMemo(() => {
        return dashboard?.medicationReminders || []
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
            <ProfileSummary dashboard={dashboard} weightVital={weightVital} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <HealthMetricsHeader onAddClick={() => setIsVitalModalOpen(true)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <VitalTrendCard
                            title="Đường huyết (mmol/L)"
                            value={glucoseVital?.valueNumeric}
                            unit="mmol/L"
                            chartData={glucoseChartData}
                            gradientId="glucoseGrad"
                            statusLabel={glucoseVital && glucoseVital.valueNumeric > 6 ? "Cận cao" : "Ổn định"}
                            statusColor={glucoseVital && glucoseVital.valueNumeric > 6 ? "amber" : "emerald"}
                        />
                        <VitalTrendCard
                            title="Huyết áp (mmHg)"
                            value={bpVital?.valueNumeric}
                            unit="mmHg"
                            chartData={bpChartData}
                            isBar
                            statusLabel={bpVital && bpVital.valueNumeric > 140 ? "Cao" : "Ổn định"}
                            statusColor={bpVital && bpVital.valueNumeric > 140 ? "rose" : "emerald"}
                        />
                    </div>

                    <SecondaryVitalsGrid vitals={secondaryVitals} />
                    <MedicationWidget reminders={medicationReminders} />
                    {latestPrescription && <PrescriptionWidget prescription={latestPrescription} />}
                </div>

                <div className="space-y-8">
                    <HealthAlertsWidget alerts={healthAlerts} />
                    <AppointmentWidget appointment={dashboard?.nextAppointment} />
                    <DoctorChatWidget doctorName={dashboard?.assignedDoctorName} />
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

/** --- Sub-components --- **/

function ProfileSummary({ dashboard, weightVital }: { dashboard: any, weightVital: TriageVitalDto | undefined }) {
    return (
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
                <InfoBlock label="Chẩn đoán" value={dashboard?.recentVisits?.[0]?.diagnosisNotes} color="text-[#4ade80]" />
                <InfoBlock label="Nhóm máu" value={dashboard?.bloodType} fallback="Chưa xác định" />
                <InfoBlock label="Thể trạng" value={weightVital ? `${weightVital.valueNumeric} kg` : null} />
                <InfoBlock label="Tiền sử" value={dashboard?.chronicConditions} fallback="Không có" />
            </div>
            <button className="px-6 py-2.5 bg-[#4ade80] text-slate-900 rounded-xl font-bold text-sm hover:bg-[#4ade80]/90 transition-all shadow-lg shadow-[#4ade80]/20 active:scale-95 whitespace-nowrap">
                Chỉnh sửa hồ sơ
            </button>
        </motion.section>
    )
}

function InfoBlock({ label, value, fallback = 'Chưa có dữ liệu', color = 'text-slate-700 dark:text-slate-200' }: { label: string, value?: string | null, fallback?: string, color?: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest">{label}</p>
            <p className={`text-base font-bold truncate mt-1 ${color}`}>{value || fallback}</p>
        </div>
    )
}

function HealthMetricsHeader({ onAddClick }: { onAddClick: () => void }) {
    return (
        <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                <div className="p-2 bg-[#4ade80]/10 rounded-lg">
                    <HeartPulse className="w-5 h-5 text-[#4ade80]" />
                </div>
                Chỉ số sức khỏe & Xu hướng
            </h2>
            <button
                onClick={onAddClick}
                className="bg-[#4ade80] text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#4ade80]/90 transition-all shadow-lg shadow-[#4ade80]/20 active:scale-95 tracking-widest"
            >
                <Plus className="w-4 h-4" /> Nhập chỉ số mới
            </button>
        </div>
    )
}

function VitalTrendCard({ title, value, unit, chartData, gradientId, statusLabel, statusColor, isBar }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-bold text-slate-400 tracking-widest">{title}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-4xl font-black text-slate-900 dark:text-white">{value || '—'}</p>
                        {value && (
                            <div className={`text-${statusColor === 'emerald' ? 'emerald' : 'rose'}-500 text-xs font-bold flex items-center bg-${statusColor === 'emerald' ? 'emerald' : 'rose'}-50 dark:bg-${statusColor === 'emerald' ? 'emerald' : 'rose'}-900/20 px-1.5 py-0.5 rounded-lg`}>
                                {statusColor === 'emerald' ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />} 1.0%
                            </div>
                        )}
                    </div>
                </div>
                {statusLabel && (
                    <span className={`px-3 py-1 bg-${statusColor}-50 text-${statusColor}-600 text-[10px] font-black tracking-widest rounded-full border border-${statusColor}-100`}>
                        {statusLabel}
                    </span>
                )}
            </div>
            <div className="h-32 w-full mt-6">
                {isBar ? (
                    <div className="h-full flex items-end gap-2 px-1">
                        {chartData.map((item: any, i: number) => {
                            const h = item.v > 0 ? Math.max(0.2, Math.min(1, item.v / 160)) : 0.5
                            return (
                                <div key={i} style={{ height: `${h * 100}%` }} className="flex-1 bg-[#4ade80]/20 rounded-t-lg hover:bg-[#4ade80] transition-colors cursor-pointer group relative">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.v > 0 ? item.v : '—'}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="v" stroke="#4ade80" strokeWidth={3} fill={`url(#${gradientId})`} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-black text-slate-300 tracking-widest border-t border-slate-50 dark:border-slate-800 pt-3">
                {chartData.map((item: any, i: number) => <span key={i}>{item.d}</span>)}
            </div>
        </motion.div>
    )
}

function SecondaryVitalsGrid({ vitals }: { vitals: TriageVitalDto[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vitals.slice(0, 3).map((vital) => {
                const iconInfo = getVitalIcon(vital.vitalType)
                const IconComp = iconInfo.icon
                return (
                    <div key={vital.id || vital.vitalType} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm">
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
    )
}

function MedicationWidget({ reminders }: { reminders: any[] }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
                <h3 className="font-black flex items-center gap-3 text-sm tracking-widest text-slate-800 dark:text-slate-200">
                    <Pill className="w-5 h-5 text-emerald-500" />
                    Lịch uống thuốc & Cấp thuốc
                </h3>
            </div>
            <div className="p-6 space-y-5">
                {reminders.length > 0 ? reminders.map((med, idx) => {
                    const isDone = med.notes?.includes('Đã uống')
                    const isCurrent = !isDone && idx < 2
                    return (
                        <div key={med.id} className={`flex items-center gap-4 group ${isCurrent ? 'shadow-lg shadow-emerald-500/5 p-2 rounded-2xl border border-emerald-100' : ''}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${isDone ? 'bg-emerald-50 text-emerald-500' : isCurrent ? 'border-2 border-emerald-500 text-emerald-500 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                                {isDone ? <Check className="w-6 h-6 stroke-[3px]" /> : <Clock className="w-6 h-6 stroke-[3px]" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-black text-slate-900 dark:text-white">{med.medicineName}{med.dosage ? ` — ${med.dosage}` : ''}</p>
                                <p className="text-[10px] text-slate-400 font-black tracking-widest mt-0.5">{med.reminderTime} • {med.notes || (isDone ? 'Đã uống' : 'Chờ')}</p>
                            </div>
                            {isCurrent && <button className="bg-[#4ade80] text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-[#4ade80]/90 transition-all shadow-md active:scale-95">Xác nhận</button>}
                        </div>
                    )
                }) : <div className="text-center py-6 text-slate-400 text-xs font-bold">Không có lịch uống thuốc</div>}
            </div>
        </div>
    )
}

function PrescriptionWidget({ prescription }: { prescription: any }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-black flex items-center gap-3 text-sm tracking-widest text-slate-800 dark:text-slate-200 mb-4">
                <Pill className="w-5 h-5 text-blue-500" />
                Toa thuốc hiện tại
            </h3>
            <div className="space-y-3">
                {prescription.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{item.productName}</p>
                            <p className="text-[10px] text-slate-400">{item.dosageInstruction}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-500">x{item.quantity}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function HealthAlertsWidget({ alerts }: { alerts: string[] }) {
    if (alerts.length === 0) return (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-3 text-emerald-600 mb-3 font-black text-xs tracking-widest"><Check className="w-5 h-5" /> Sức khỏe Ổn định</div>
            <p className="text-sm text-emerald-700 font-bold">Các chỉ số của bạn ở mức bình thường!</p>
        </div>
    )
    return (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-5 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-3 text-rose-600 mb-3 font-black text-xs tracking-widest"><AlertTriangle className="w-5 h-5" /> Cảnh báo</div>
            {alerts.map((a, i) => <p key={i} className="text-sm text-rose-700 font-bold leading-relaxed">{a}</p>)}
        </div>
    )
}

function AppointmentWidget({ appointment }: { appointment: any }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-black mb-6 flex items-center gap-3 text-sm tracking-widest text-slate-800 dark:text-slate-200"><Calendar className="w-5 h-5 text-emerald-500" /> Lịch khám</h3>
            {appointment ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border-l-8 border-emerald-400">
                    <p className="text-[10px] font-black text-emerald-500 tracking-widest mb-1">{new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">{appointment.appointmentType || 'Khám định kỳ'}</p>
                    <div className="mt-2 text-xs text-slate-500 font-bold"><Clock className="w-3 h-3 inline mr-1" /> {appointment.startTime} - {appointment.endTime}</div>
                </div>
            ) : <p className="text-center py-4 text-slate-400 text-xs">Không có lịch sắp tới</p>}
        </div>
    )
}

function DoctorChatWidget({ doctorName }: { doctorName?: string }) {
    return (
        <motion.div whileHover={{ scale: 1.02 }} className="bg-emerald-400 rounded-[2rem] p-5 flex items-center gap-4 shadow-xl shadow-emerald-400/20 group cursor-pointer" onClick={() => { }}>
            <div className="h-14 w-14 rounded-2xl bg-slate-900 relative overflow-hidden"><img alt="Doctor" className="object-cover h-full w-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcFUhTbj4SPfWKM3951CEKYvigAczulFrCd8MjzxK28AaIMv7rvM-pUcSN0_6i5RwtX13a876QeZic-WXjKbruzJO_MU1VLhaf8sTaTC6xMBJBLlegIlBVQ7-ay4KFBKDc9Kp4d4VxiW4W55X3BgzMhYJVpEUOsX5zvapaAutwwZ5jNXGYRXvYYdfIxJ3NoXT7vE_s_WQFoBz8nq_gOTbZG2UuGnw6hWILVqM-4JvKFVl6gyFJVzgir_vEEj_UoPOP31YKYoxzHN8" /></div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{doctorName || 'BS. CDMS'}</p>
                <p className="text-[10px] text-slate-900/60 font-black tracking-widest">Bác sĩ phụ trách</p>
            </div>
            <Link to="/patient/chat" className="bg-slate-900 p-3 rounded-2xl text-emerald-400 shadow-xl"><Send className="w-5 h-5 fill-current" /></Link>
        </motion.div>
    )
}
