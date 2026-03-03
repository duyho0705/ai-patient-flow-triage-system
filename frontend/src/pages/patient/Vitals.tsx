import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPortalDashboard, logPortalVital, getPortalVitalTrends } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
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
    X,
    Save,
    Calendar,
    Clock,
} from 'lucide-react'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

// Types
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

const TIME_FILTERS = [
    { label: 'Ngày', days: 1 },
    { label: 'Tuần', days: 7 },
    { label: 'Tháng', days: 30 },
    { label: 'Năm', days: 365 },
]

function getVitalStatus(type: string, value: number): { label: string; className: string } {
    const config = VITAL_CONFIG[type]
    if (!config) return { label: 'N/A', className: 'bg-slate-100 text-slate-500' }
    const [low, high] = config.normalRange
    if (value >= low && value <= high) return { label: 'Ổn Định', className: 'bg-emerald-100 text-emerald-600' }
    if (value < low) return { label: 'Thấp', className: 'bg-orange-100 text-orange-600' }
    return { label: 'Cần Chú Ý', className: 'bg-orange-100 text-orange-600' }
}

export default function PatientVitals() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const dateInputRef = useRef<HTMLInputElement>(null)
    const timeInputRef = useRef<HTMLInputElement>(null)
    const [selectedMetric, setSelectedMetric] = useState('BLOOD_GLUCOSE')
    const [timeFilter, setTimeFilter] = useState(1) // index of TIME_FILTERS
    const [showInputModal, setShowInputModal] = useState(false)
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false)
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)
    const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false)
    const [inputType, setInputType] = useState<VitalType | 'BLOOD_PRESSURE'>('BLOOD_GLUCOSE')
    const [inputValue, setInputValue] = useState('')
    const [inputSysValue, setInputSysValue] = useState('')
    const [inputDiaValue, setInputDiaValue] = useState('')
    const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0])
    const [inputTime, setInputTime] = useState(new Date().toTimeString().slice(0, 5))
    const [inputNotes, setInputNotes] = useState('')

    const { data: dashboard, isLoading } = useQuery({
        queryKey: ['portal-dashboard'],
        queryFn: () => getPortalDashboard(headers),
        enabled: !!headers?.tenantId
    })

    // Fetch trend data for chart
    const now = new Date()
    const filterDays = TIME_FILTERS[timeFilter].days
    const from = new Date(now.getTime() - filterDays * 24 * 60 * 60 * 1000).toISOString()
    const to = now.toISOString()

    const apiMetric = selectedMetric === 'BLOOD_PRESSURE' ? 'BLOOD_PRESSURE_SYS' : selectedMetric

    const { data: trendData } = useQuery({
        queryKey: ['portal-vital-trends', selectedMetric, timeFilter],
        queryFn: () => getPortalVitalTrends(apiMetric, headers, from, to),
        enabled: !!headers?.tenantId
    })

    const logMutation = useMutation({
        mutationFn: (data: any) => logPortalVital(data, headers),
        onSuccess: () => {
            toast.success('Đã lưu chỉ số thành công!')
            queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] })
            queryClient.invalidateQueries({ queryKey: ['portal-vital-trends'] })
            setShowInputModal(false)
            setInputValue('')
            setInputNotes('')
        },
        onError: () => toast.error('Có lỗi xảy ra.')
    })

    const handleSubmitVital = async () => {
        const recordedAt = new Date(`${inputDate}T${inputTime}`).toISOString()

        if (inputType === 'BLOOD_PRESSURE') {
            if (!inputSysValue || !inputDiaValue) {
                toast.error('Vui lòng nhập đầy đủ Huyết áp Tâm thu và Tâm trương')
                return
            }

            // Log Sys
            await logMutation.mutateAsync({
                vitalType: 'BLOOD_PRESSURE_SYS',
                valueNumeric: parseFloat(inputSysValue),
                unit: 'mmHg',
                notes: inputNotes || undefined,
                recordedAt
            })

            // Log Dia
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

    if (isLoading) return (
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#4ade80] animate-spin" />
        </div>
    )

    // Helper: get latest vital by type from dashboard
    const getVitalValue = (type: string) => {
        if (type === 'BLOOD_PRESSURE') {
            const sys = dashboard?.lastVitals?.find((v: any) => v.vitalType?.toUpperCase() === 'BLOOD_PRESSURE_SYS')?.valueNumeric
            const dia = dashboard?.lastVitals?.find((v: any) => v.vitalType?.toUpperCase() === 'BLOOD_PRESSURE_DIA')?.valueNumeric
            if (sys || dia) return `${sys || '—'}/${dia || '—'}`
            return '—'
        }
        const v = dashboard?.lastVitals?.find((v: any) => v.vitalType?.toUpperCase() === type)
        return v ? v.valueNumeric : '—'
    }

    const getVitalStatusValue = (type: string) => {
        if (type === 'BLOOD_PRESSURE') {
            const sys = dashboard?.lastVitals?.find((v: any) => v.vitalType?.toUpperCase() === 'BLOOD_PRESSURE_SYS')?.valueNumeric
            return sys ? getVitalStatus('BLOOD_PRESSURE', sys) : { label: 'Chưa có', className: 'bg-slate-100 text-slate-500' }
        }
        const v = dashboard?.lastVitals?.find((v: any) => v.vitalType?.toUpperCase() === type)
        return v ? getVitalStatus(type, v.valueNumeric) : { label: 'Chưa có', className: 'bg-slate-100 text-slate-500' }
    }

    // Build chart data from trends
    const chartData = (trendData || []).map((t: any) => ({
        label: new Date(t.recordedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        value: t.value,
    })).slice(-10)

    // Build history from vitalHistory
    const historyItems = (dashboard?.vitalHistory || [])
        .slice(0, 10)
        .map((v: any) => {
            const config = VITAL_CONFIG[v.vitalType?.toUpperCase()]
            if (!config) return null // Skip unknown metrics in history
            const status = getVitalStatus(v.vitalType?.toUpperCase(), v.valueNumeric)
            return {
                time: new Date(v.recordedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                type: config.label,
                val: `${v.valueNumeric} ${config.unit}`,
                status: status.label,
                statusClass: status.className,
                icon: config.icon,
                color: config.color,
                note: '',
            }
        }).filter(Boolean) as any[]

    const chartMax = Math.max(...chartData.map((d: any) => d.value), 1)

    return (
        <div className="space-y-8 pb-20 py-8">
            {/* 1. Header Card */}
            <header className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ade80]/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chỉ số sức khỏe</h2>
                        <p className="text-slate-500 mt-1 font-medium">Theo dõi các chỉ số sinh tồn của bạn trong thời gian thực</p>
                    </div>
                    <button
                        onClick={() => setShowInputModal(true)}
                        className="bg-[#4ade80] hover:bg-[#4ade80]/90 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-[#4ade80]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Nhập chỉ số mới
                    </button>
                </div>
            </header>

            {/* Time Filter */}
            <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 w-fit shadow-sm">
                {TIME_FILTERS.map((filter, idx) => (
                    <button
                        key={filter.label}
                        onClick={() => setTimeFilter(idx)}
                        className={`px-6 py-3 text-sm font-bold transition-all rounded-xl ${idx === timeFilter
                            ? 'bg-[#4ade80] text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(VITAL_CONFIG).map(([key, config]) => {
                    const value = getVitalValue(key)
                    const status = getVitalStatusValue(key)
                    const isSelected = selectedMetric === key

                    return (
                        <button
                            key={key}
                            onClick={() => setSelectedMetric(key)}
                            className={`bg-white dark:bg-slate-900 p-4 rounded-xl text-left transition-all border ${isSelected
                                ? 'border-[#4ade80] ring-4 ring-[#4ade80]/10 shadow-lg'
                                : 'border-slate-100 dark:border-slate-800 hover:border-[#4ade80]/50'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 ${config.bgColor} ${config.color} rounded-lg`}>
                                    <config.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${status.className}`}>
                                    {status.label}
                                </span>
                            </div>
                            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">{config.label}</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                    {typeof value === 'number' ? value.toFixed(1) : value}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{config.unit}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-[#4ade80]">
                                <span className="material-symbols-outlined text-sm">trending_down</span>
                                <span className="text-[10px] font-bold">-2% so với hôm qua</span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Chart and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">
                                Biểu đồ {VITAL_CONFIG[selectedMetric]?.label || 'Chỉ số'} chi tiết
                            </h3>
                            <p className="text-xs text-slate-500 font-bold mt-1">
                                Dữ liệu thu thập trong {TIME_FILTERS[timeFilter].label.toLowerCase()} qua
                            </p>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsChartDropdownOpen(!isChartDropdownOpen)}
                                className="flex items-center gap-3 pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-[#4ade80]/20 transition-all cursor-pointer relative"
                            >
                                {(() => {
                                    const cfg = VITAL_CONFIG[selectedMetric]
                                    return (
                                        <>
                                            <div className={`p-1 ${cfg.bgColor} ${cfg.color} rounded-md shadow-sm`}>
                                                <cfg.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span>{cfg.label} ({cfg.unit})</span>
                                        </>
                                    )
                                })()}
                                <ChevronRight className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform ${isChartDropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
                            </button>

                            <AnimatePresence>
                                {isChartDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-1"
                                    >
                                        {Object.entries(VITAL_CONFIG).map(([key, cfg]) => (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    setSelectedMetric(key)
                                                    setIsChartDropdownOpen(false)
                                                }}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <div className={`p-1.5 ${cfg.bgColor} ${cfg.color} rounded-md`}>
                                                    <cfg.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cfg.label}</span>
                                                {selectedMetric === key && (
                                                    <div className="ml-auto w-1.5 h-1.5 bg-[#4ade80] rounded-full" />
                                                )}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="h-64 mt-4 relative">
                        {chartData.length > 0 ? (
                            <div className="absolute inset-0 flex items-end justify-between px-2">
                                {chartData.map((d: any, i: number) => (
                                    <div key={i} className="flex flex-col items-center gap-2 group/bar flex-1">
                                        <div className="relative w-full flex flex-col items-center justify-end h-48">
                                            <div
                                                className="w-10 bg-[#4ade80]/20 rounded-t-xl transition-all group-hover/bar:bg-[#4ade80]/40 relative"
                                                style={{ height: `${Math.max((d.value / (chartMax * 1.2)) * 100, 5)}%` }}
                                            >
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-[#4ade80] rounded-full shadow-[0_0_10px_#4ade80]" />
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                                    {d.value}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.label}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 font-bold text-sm relative z-10">
                                Chưa có dữ liệu trong khoảng thời gian này
                            </div>
                        )}
                        {/* Background Lines */}
                        <div className="absolute inset-x-0 bottom-[calc(25%)] border-t border-slate-100 dark:border-slate-800/50"></div>
                        <div className="absolute inset-x-0 bottom-[calc(50%)] border-t border-slate-100 dark:border-slate-800/50"></div>
                        <div className="absolute inset-x-0 bottom-[calc(75%)] border-t border-slate-100 dark:border-slate-800/50"></div>
                    </div>
                </div>

                {/* AI / Doctor Analysis Section */}
                <div className="bg-[#4ade80]/5 dark:bg-[#4ade80]/10 p-7 rounded-xl border border-[#4ade80]/10 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#4ade80]/10 text-[#4ade80] rounded-xl">
                            <Zap className="w-5 h-5 fill-[#4ade80]" />
                        </div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Phân tích chuyên sâu</h3>
                    </div>

                    <div className="space-y-5 flex-1">
                        {/* Show health alerts if any */}
                        {dashboard?.healthAlerts && dashboard.healthAlerts.length > 0 ? (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-4 right-4 text-[#4ade80]/10 scale-150">
                                    <Activity className="w-16 h-16" />
                                </div>
                                <div className="space-y-3 relative z-10">
                                    {dashboard.healthAlerts.map((alert: string, i: number) => (
                                        <p key={i} className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                            ⚠️ {alert}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-4 right-4 text-[#4ade80]/10 scale-150">
                                    <Activity className="w-16 h-16" />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed relative z-10">
                                    "Các chỉ số sức khỏe của bạn đang ổn định. Tiếp tục duy trì lối sống lành mạnh nhé!"
                                </p>
                            </div>
                        )}

                        <div className="bg-[#4ade80] rounded-xl p-6 shadow-lg shadow-[#4ade80]/20 group relative overflow-hidden">
                            <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Plus className="w-24 h-24 rotate-45" />
                            </div>
                            <h4 className="text-xs font-black text-slate-900 flex items-center gap-2 mb-2 uppercase tracking-[0.2em]">
                                <Info className="w-4 h-4" /> Lời khuyên sức khỏe
                            </h4>
                            <p className="text-sm text-slate-900 font-bold leading-relaxed">
                                {dashboard?.healthAlerts?.[0] || 'Hãy duy trì thói quen theo dõi sức khỏe hàng ngày để bác sĩ có thể tư vấn chính xác nhất cho bạn.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-7 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Lịch sử nhập liệu gần đây</h3>
                        <p className="text-xs text-slate-500 font-bold mt-1">Dữ liệu ghi nhận từ bệnh nhân</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thời gian</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chỉ số</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giá trị</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {historyItems.length > 0 ? historyItems.map((row: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{row.time}</div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 ${row.color} bg-current/10 rounded-lg`}>
                                                <row.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{row.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="text-base font-black text-slate-900 dark:text-white tracking-tight">{row.val}</div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full tracking-widest ${row.statusClass}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold">
                                        Chưa có dữ liệu. Nhấn "Nhập chỉ số mới" để bắt đầu theo dõi sức khỏe.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div >

            {/* Input Vital Modal */}
            <AnimatePresence>
                {
                    showInputModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowInputModal(false)}
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
                                            onClick={() => setShowInputModal(false)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
                                    {/* Metric Type Selection - Custom Premium Dropdown */}
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
                                                Giá trị ({VITAL_CONFIG[inputType as string]?.unit})
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={inputValue}
                                                onChange={e => setInputValue(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#4ade80] focus:border-transparent text-slate-900 dark:text-slate-100 outline-none transition-all"
                                                placeholder={`VD: ${VITAL_CONFIG[inputType as string]?.normalRange[0]}`}
                                            />
                                        </div>
                                    )}

                                    {/* Date and Time Grid - Hidden for Weight */}
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
                                        onClick={() => setShowInputModal(false)}
                                        className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        onClick={handleSubmitVital}
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
                    )
                }
            </AnimatePresence>

        </div >
    )
}
