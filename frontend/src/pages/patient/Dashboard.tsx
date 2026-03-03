import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPortalDashboard, logPortalVital, logMedicationTaken } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import { usePatientRealtime } from '@/hooks/usePatientRealtime'
import {
    Activity,
    Plus,
    Heart,
    Wind,
    Scale,
    Droplets,
    Zap,
    Info,
    ChevronRight,
    Loader2,
    Save,
    HeartPulse,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Pill,
    Check,
    Clock,
    Calendar,
    Send,
    X,
    Dumbbell,
    Thermometer,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useRef } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import type { TriageVitalDto } from '@/types/api'

// --- Types & Constants ---
type VitalType = 'BLOOD_GLUCOSE' | 'BLOOD_PRESSURE_SYS' | 'BLOOD_PRESSURE_DIA' | 'HEART_RATE' | 'WEIGHT' | 'SPO2' | 'TEMPERATURE'

const VITAL_CONFIG: Record<string, {
    label: string
    unit: string
    icon: any
    color: string
    bgColor: string
    ringColor: string
    normalRange: [number, number]
    apiType: string
}> = {
    BLOOD_GLUCOSE: { label: 'Đường huyết', unit: 'mmol/L', icon: Droplets, color: 'text-emerald-500', bgColor: 'bg-emerald-50', ringColor: 'ring-emerald-500/10', normalRange: [4.0, 7.0], apiType: 'BLOOD_GLUCOSE' },
    BLOOD_PRESSURE: { label: 'Huyết áp', unit: 'mmHg', icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50', ringColor: 'ring-orange-500/10', normalRange: [90, 140], apiType: 'BLOOD_PRESSURE_SYS' },
    HEART_RATE: { label: 'Nhịp tim', unit: 'bpm', icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50', ringColor: 'ring-red-500/10', normalRange: [60, 100], apiType: 'HEART_RATE' },
    WEIGHT: { label: 'Cân nặng', unit: 'kg', icon: Scale, color: 'text-blue-500', bgColor: 'bg-blue-50', ringColor: 'ring-blue-500/10', normalRange: [40, 120], apiType: 'WEIGHT' },
    SPO2: { label: 'Oxy SpO2', unit: '%', icon: Wind, color: 'text-cyan-500', bgColor: 'bg-cyan-50', ringColor: 'ring-cyan-500/10', normalRange: [94, 100], apiType: 'SPO2' },
}

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
    const navigate = useNavigate()
    const queryClient = useQueryClient()
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
    const sysVital = useMemo(() => getVitalByType(dashboard?.lastVitals, 'BLOOD_PRESSURE_SYS'), [dashboard?.lastVitals])
    const diaVital = useMemo(() => getVitalByType(dashboard?.lastVitals, 'BLOOD_PRESSURE_DIA'), [dashboard?.lastVitals])
    const weightVital = useMemo(() => getVitalByType(dashboard?.lastVitals, 'WEIGHT'), [dashboard?.lastVitals])

    const glucoseChartData = useMemo(() => buildChartData(dashboard?.vitalHistory, 'BLOOD_GLUCOSE'), [dashboard?.vitalHistory])
    const bpChartData = useMemo(() => buildChartData(dashboard?.vitalHistory, 'BLOOD_PRESSURE_SYS'), [dashboard?.vitalHistory])

    const bpCombinedValue = useMemo(() => {
        if (!sysVital && !diaVital) return null
        return `${sysVital?.valueNumeric || '—'}/${diaVital?.valueNumeric || '—'}`
    }, [sysVital, diaVital])

    // Secondary metrics (heart rate, SpO2, weight + any others from lastVitals)
    const secondaryVitals = useMemo(() => {
        const primary = ['BLOOD_GLUCOSE', 'BLOOD_PRESSURE_SYS', 'BLOOD_PRESSURE_DIA', 'TEMPERATURE']
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

    const { mutate: confirmMedication } = useMutation({
        mutationFn: (med: any) => logMedicationTaken({
            medicationReminderId: med.id,
            medicineName: med.medicineName,
            takenAt: new Date().toISOString()
        }, headers),
        onSuccess: () => {
            toast.success('Ghi nhận đã uống thuốc!')
            queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] })
        },
        onError: () => toast.error('Không thể ghi nhận. Vui lòng thử lại.')
    })

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
                            value={bpCombinedValue}
                            unit="mmHg"
                            chartData={bpChartData}
                            isBar
                            statusLabel={sysVital && sysVital.valueNumeric > 140 ? "Cao" : "Ổn định"}
                            statusColor={sysVital && sysVital.valueNumeric > 140 ? "rose" : "emerald"}
                        />
                    </div>

                    <SecondaryVitalsGrid vitals={secondaryVitals} />
                    <MedicationWidget reminders={medicationReminders} onConfirm={confirmMedication} />
                    {latestPrescription && <PrescriptionWidget prescription={latestPrescription} />}
                </div>

                <div className="space-y-8">
                    <HealthAlertsWidget alerts={healthAlerts} />
                    <AppointmentWidget appointment={dashboard?.nextAppointment} navigate={navigate} />
                    <DoctorChatWidget
                        doctorName={dashboard?.assignedDoctorName}
                        doctorAvatar={dashboard?.assignedDoctorAvatar}
                        navigate={navigate}
                    />
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
    const dateInputRef = useRef<HTMLInputElement>(null)
    const timeInputRef = useRef<HTMLInputElement>(null)
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false)
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)

    const [inputType, setInputType] = useState<VitalType | 'BLOOD_PRESSURE'>('BLOOD_GLUCOSE')
    const [inputValue, setInputValue] = useState('')
    const [inputSysValue, setInputSysValue] = useState('')
    const [inputDiaValue, setInputDiaValue] = useState('')
    const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0])
    const [inputTime, setInputTime] = useState(new Date().toTimeString().slice(0, 5))
    const [inputNotes, setInputNotes] = useState('')

    const logMutation = useMutation({
        mutationFn: (data: any) => logPortalVital(data, headers),
        onSuccess: () => {
            toast.success('Đã lưu chỉ số thành công!')
            queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] })
            onClose()
            setInputValue('')
            setInputSysValue('')
            setInputDiaValue('')
            setInputNotes('')
        },
        onError: () => toast.error('Có lỗi xảy ra.')
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const recordedAt = new Date(`${inputDate}T${inputTime}`).toISOString()

        if (inputType === 'BLOOD_PRESSURE') {
            if (!inputSysValue || !inputDiaValue) {
                toast.error('Vui lòng nhập đầy đủ Huyết áp Tâm thu và Tâm trương')
                return
            }

            await logMutation.mutateAsync({
                vitalType: 'BLOOD_PRESSURE_SYS',
                valueNumeric: parseFloat(inputSysValue),
                unit: 'mmHg',
                notes: inputNotes || undefined,
                recordedAt
            })

            await logMutation.mutateAsync({
                vitalType: 'BLOOD_PRESSURE_DIA',
                valueNumeric: parseFloat(inputDiaValue),
                unit: 'mmHg',
                notes: inputNotes || undefined,
                recordedAt
            })
        } else {
            if (!inputValue.trim()) {
                toast.error('Vui lòng nhập giá trị')
                return
            }

            const config = VITAL_CONFIG[inputType]
            await logMutation.mutateAsync({
                vitalType: inputType as VitalType,
                valueNumeric: parseFloat(inputValue),
                unit: config?.unit || '',
                notes: inputNotes || undefined,
                recordedAt
            })
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Nhập chỉ số sức khỏe</h2>
                                <button
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
                            {/* Metric Type Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Loại chỉ số</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 flex items-center justify-between focus:ring-2 focus:ring-[#4ade80] transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            {(() => {
                                                const config = VITAL_CONFIG[inputType === 'BLOOD_PRESSURE' ? 'BLOOD_PRESSURE' : inputType]
                                                if (!config) return <Activity className="w-5 h-5 text-slate-400" />
                                                return (
                                                    <div className={`p-1.5 ${config.bgColor} ${config.color} rounded-md`}>
                                                        <config.icon className="w-4 h-4" />
                                                    </div>
                                                )
                                            })()}
                                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                {(inputType === 'BLOOD_PRESSURE' ? 'Huyết áp' : VITAL_CONFIG[inputType]?.label) || 'Chọn chỉ số'}
                                            </span>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isTypeDropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isTypeDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-1"
                                            >
                                                {[
                                                    { key: 'BLOOD_PRESSURE', label: 'Huyết áp (Blood Pressure)', icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50' },
                                                    { key: 'BLOOD_GLUCOSE', label: 'Đường huyết (Blood Glucose)', icon: Droplets, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
                                                    { key: 'HEART_RATE', label: 'Nhịp tim (Heart Rate)', icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50' },
                                                    { key: 'WEIGHT', label: 'Cân nặng (Weight)', icon: Scale, color: 'text-blue-500', bgColor: 'bg-blue-50' },
                                                    { key: 'SPO2', label: 'Nồng độ Oxy (SpO2)', icon: Wind, color: 'text-cyan-500', bgColor: 'bg-cyan-50' }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.key}
                                                        onClick={() => {
                                                            setInputType(opt.key as any)
                                                            setIsTypeDropdownOpen(false)
                                                        }}
                                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        <div className={`p-1.5 ${opt.bgColor} ${opt.color} rounded-md`}>
                                                            <opt.icon className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{opt.label}</span>
                                                        {inputType === opt.key && (
                                                            <div className="ml-auto w-2 h-2 bg-[#4ade80] rounded-full" />
                                                        )}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Values Grid */}
                            {inputType === 'BLOOD_PRESSURE' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tâm thu (mmHg)</label>
                                        <input
                                            type="number"
                                            value={inputSysValue}
                                            onChange={e => setInputSysValue(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#4ade80] focus:border-transparent text-slate-900 dark:text-slate-100 outline-none transition-all"
                                            placeholder="120"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tâm trương (mmHg)</label>
                                        <input
                                            type="number"
                                            value={inputDiaValue}
                                            onChange={e => setInputDiaValue(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#4ade80] focus:border-transparent text-slate-900 dark:text-slate-100 outline-none transition-all"
                                            placeholder="80"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Giá trị ({VITAL_CONFIG[inputType as string]?.unit || ''})
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#4ade80] focus:border-transparent text-slate-900 dark:text-slate-100 outline-none transition-all"
                                        placeholder={`VD: ${VITAL_CONFIG[inputType as string]?.normalRange[0] || '1.0'}`}
                                    />
                                </div>
                            )}

                            {/* Date and Time Grid */}
                            {inputType !== 'WEIGHT' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Custom Date Dropdown */}
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ngày đo</label>
                                        <button
                                            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 flex items-center justify-between focus:ring-2 focus:ring-[#4ade80] transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                    {inputDate === new Date().toISOString().split('T')[0]
                                                        ? `Hôm nay, ${new Date(inputDate).toLocaleDateString('vi-VN')}`
                                                        : new Date(inputDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isDateDropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isDateDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-[60] overflow-hidden py-1"
                                                >
                                                    {[
                                                        { label: 'Hôm nay', value: new Date().toISOString().split('T')[0] },
                                                        { label: 'Hôm qua', value: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => {
                                                                setInputDate(opt.value)
                                                                setIsDateDropdownOpen(false)
                                                            }}
                                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                        >
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{opt.label}</span>
                                                            {inputDate === opt.value && (
                                                                <div className="w-2 h-2 bg-[#4ade80] rounded-full" />
                                                            )}
                                                        </button>
                                                    ))}
                                                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                                    <button
                                                        onClick={() => dateInputRef.current?.showPicker()}
                                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Chọn ngày khác...</span>
                                                        <input
                                                            ref={dateInputRef}
                                                            type="date"
                                                            className="sr-only"
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    setInputDate(e.target.value)
                                                                    setIsDateDropdownOpen(false)
                                                                }
                                                            }}
                                                        />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Custom Time Dropdown */}
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Giờ đo</label>
                                        <button
                                            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 flex items-center justify-between focus:ring-2 focus:ring-[#4ade80] transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                    {inputTime}
                                                </span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isTimeDropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isTimeDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-[60] overflow-hidden py-1"
                                                >
                                                    {[
                                                        { label: 'Bây giờ', getValue: () => new Date().toTimeString().slice(0, 5) },
                                                        { label: '30 phút trước', getValue: () => new Date(Date.now() - 30 * 60000).toTimeString().slice(0, 5) },
                                                        { label: '1 giờ trước', getValue: () => new Date(Date.now() - 60 * 60000).toTimeString().slice(0, 5) },
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.label}
                                                            onClick={() => {
                                                                setInputTime(opt.getValue())
                                                                setIsTimeDropdownOpen(false)
                                                            }}
                                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                        >
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{opt.label}</span>
                                                            {inputTime === opt.getValue() && (
                                                                <div className="w-2 h-2 bg-[#4ade80] rounded-full" />
                                                            )}
                                                        </button>
                                                    ))}
                                                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                                    <button
                                                        onClick={() => timeInputRef.current?.showPicker()}
                                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Chọn giờ khác...</span>
                                                        <input
                                                            ref={timeInputRef}
                                                            type="time"
                                                            className="sr-only"
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    setInputTime(e.target.value)
                                                                    setIsTimeDropdownOpen(false)
                                                                }
                                                            }}
                                                        />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ghi chú / Triệu chứng</label>
                                <textarea
                                    value={inputNotes}
                                    onChange={e => setInputNotes(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 focus:ring-2 focus:ring-[#4ade80] focus:border-transparent text-slate-900 dark:text-slate-100 outline-none transition-all resize-none"
                                    placeholder="Nhập tình trạng sức khỏe hiện tại của bạn hoặc cảm giác lúc này..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={logMutation.isPending}
                                className="flex-[2] px-4 py-3 rounded-lg bg-[#4ade80] text-slate-900 font-bold shadow-lg shadow-[#4ade80]/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                {logMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Lưu chỉ số
                                    </>
                                )}
                            </button>
                        </div>
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
                {dashboard?.patientAvatar ? (
                    <img
                        alt="Patient Avatar"
                        className="h-full w-full object-cover"
                        src={dashboard.patientAvatar}
                    />
                ) : (
                    <div className="w-full h-full bg-[#4ade80] text-slate-900 flex items-center justify-center text-3xl font-black">
                        {dashboard?.patientName?.charAt(0) || 'P'}
                    </div>
                )}
            </div>
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                <InfoBlock label="Chẩn đoán" value={dashboard?.recentVisits?.[0]?.diagnosisNotes} color="text-[#4ade80]" />
                <InfoBlock label="Nhóm máu" value={dashboard?.bloodType} fallback="Chưa xác định" />
                <InfoBlock label="Thể trạng" value={weightVital ? `${weightVital.valueNumeric} kg` : null} />
                <InfoBlock label="Tiền sử" value={dashboard?.chronicConditions} fallback="Không có" />
            </div>
            <Link to="/patient/profile">
                <button className="px-6 py-2.5 bg-[#4ade80] text-slate-900 rounded-xl font-bold text-sm hover:bg-[#4ade80]/90 transition-all shadow-lg shadow-[#4ade80]/20 active:scale-95 whitespace-nowrap">
                    Chỉnh sửa hồ sơ
                </button>
            </Link>
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
                        {value && <span className="text-xs font-bold text-slate-400">{unit}</span>}
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
                    <ResponsiveContainer width="99%" height={128}>
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

function MedicationWidget({ reminders, onConfirm }: { reminders: any[], onConfirm: (med: any) => void }) {
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
                            {isCurrent && (
                                <button
                                    onClick={() => onConfirm(med)}
                                    className="bg-[#4ade80] text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-[#4ade80]/90 transition-all shadow-md active:scale-95"
                                >
                                    Xác nhận
                                </button>
                            )}
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

function AppointmentWidget({ appointment, navigate }: { appointment: any, navigate: any }) {
    return (
        <div
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/patient/appointments')}
        >
            <h3 className="font-black mb-6 flex items-center gap-3 text-sm tracking-widest text-slate-800 dark:text-slate-200"><Calendar className="w-5 h-5 text-emerald-500" /> Lịch khám</h3>
            {appointment ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border-l-8 border-emerald-400">
                    <p className="text-[10px] font-black text-emerald-500 tracking-widest mb-1">{new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">{appointment.appointmentType}</p>
                    <div className="mt-2 text-xs text-slate-500 font-bold"><Clock className="w-3 h-3 inline mr-1" /> {appointment.startTime} - {appointment.endTime} {appointment.branchName ? `• ${appointment.branchName}` : ''}</div>
                </div>
            ) : <p className="text-center py-4 text-slate-400 text-xs font-bold">Không có lịch sắp tới</p>}
        </div>
    )
}

function DoctorChatWidget({ doctorName, doctorAvatar, navigate }: { doctorName?: string, doctorAvatar?: string, navigate: any }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-emerald-400 rounded-[2rem] p-5 flex items-center gap-4 shadow-xl shadow-emerald-400/20 group cursor-pointer"
            onClick={() => navigate('/patient/chat')}
        >
            <div className="h-14 w-14 rounded-2xl bg-slate-900 relative overflow-hidden flex items-center justify-center text-emerald-400 text-xl font-black">
                {doctorAvatar ? (
                    <img alt="Doctor" className="object-cover h-full w-full" src={doctorAvatar} />
                ) : (
                    doctorName?.charAt(0) || 'D'
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{doctorName || 'Chưa phân công'}</p>
                <p className="text-[10px] text-slate-900/60 font-black tracking-widest">Bác sĩ phụ trách</p>
            </div>
            <Link to="/patient/chat" className="bg-slate-900 p-3 rounded-2xl text-emerald-400 shadow-xl"><Send className="w-5 h-5 fill-current" /></Link>
        </motion.div>
    )
}
