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
} from 'lucide-react'
import { useState } from 'react'
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
    normalRange: [number, number]
    apiType: VitalType
}> = {
    BLOOD_GLUCOSE: { label: 'Đường huyết', unit: 'mmol/L', icon: Droplets, color: 'text-emerald-500', bgColor: 'bg-emerald-50', normalRange: [4.0, 7.0], apiType: 'BLOOD_GLUCOSE' },
    BLOOD_PRESSURE_SYS: { label: 'Huyết áp (Thu)', unit: 'mmHg', icon: Activity, color: 'text-orange-500', bgColor: 'bg-orange-50', normalRange: [90, 140], apiType: 'BLOOD_PRESSURE_SYS' },
    BLOOD_PRESSURE_DIA: { label: 'Huyết áp (Trương)', unit: 'mmHg', icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50', normalRange: [60, 90], apiType: 'BLOOD_PRESSURE_DIA' },
    HEART_RATE: { label: 'Nhịp tim', unit: 'bpm', icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50', normalRange: [60, 100], apiType: 'HEART_RATE' },
    WEIGHT: { label: 'Cân nặng', unit: 'kg', icon: Scale, color: 'text-blue-500', bgColor: 'bg-blue-50', normalRange: [40, 120], apiType: 'WEIGHT' },
    SPO2: { label: 'Oxy SpO2', unit: '%', icon: Wind, color: 'text-cyan-500', bgColor: 'bg-cyan-50', normalRange: [94, 100], apiType: 'SPO2' },
    TEMPERATURE: { label: 'Nhiệt độ', unit: '°C', icon: Activity, color: 'text-amber-500', bgColor: 'bg-amber-50', normalRange: [36.0, 37.5], apiType: 'TEMPERATURE' },
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
    const [selectedMetric, setSelectedMetric] = useState('BLOOD_GLUCOSE')
    const [timeFilter, setTimeFilter] = useState(1) // index of TIME_FILTERS
    const [showInputModal, setShowInputModal] = useState(false)
    const [inputType, setInputType] = useState<VitalType>('BLOOD_GLUCOSE')
    const [inputValue, setInputValue] = useState('')
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

    const { data: trendData } = useQuery({
        queryKey: ['portal-vital-trends', selectedMetric, timeFilter],
        queryFn: () => getPortalVitalTrends(selectedMetric, headers, from, to),
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

    const handleSubmitVital = () => {
        if (!inputValue.trim()) { toast.error('Vui lòng nhập giá trị'); return }
        const config = VITAL_CONFIG[inputType]
        logMutation.mutate({
            vitalType: inputType,
            valueNumeric: parseFloat(inputValue),
            unit: config.unit,
            notes: inputNotes || undefined,
        })
    }

    if (isLoading) return (
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#4ade80] animate-spin" />
        </div>
    )

    // Helper: get latest vital by type from dashboard
    const getVital = (type: string) => {
        const v = dashboard?.lastVitals?.find((v: any) => v.vitalType?.toUpperCase() === type)
        return v ? { value: v.valueNumeric, recordedAt: v.recordedAt } : null
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
        <div className="w-full space-y-8 p-6 md:p-8">
            {/* Title and CTA */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
                    const vital = getVital(key)
                    const value = vital?.value ?? '—'
                    const status = vital ? getVitalStatus(key, vital.value) : { label: 'Chưa có', className: 'bg-slate-100 text-slate-500' }
                    const isSelected = selectedMetric === key

                    return (
                        <button
                            key={key}
                            onClick={() => setSelectedMetric(key)}
                            className={`bg-white dark:bg-slate-800 p-5 rounded-3xl text-left transition-all hover:scale-[1.02] ${isSelected
                                ? 'border-2 border-[#4ade80] shadow-xl shadow-[#4ade80]/5'
                                : 'border border-slate-100 dark:border-slate-700'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2.5 ${config.bgColor} ${config.color} rounded-2xl`}>
                                    <config.icon className="w-6 h-6" />
                                </div>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest ${status.className}`}>
                                    {status.label}
                                </span>
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{config.label}</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {typeof value === 'number' ? value.toFixed(1) : value}
                                </span>
                                <span className="text-xs font-bold text-slate-400 uppercase">{config.unit}</span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Chart and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-7 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
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
                            <select
                                value={selectedMetric}
                                onChange={(e) => setSelectedMetric(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-600 focus:ring-emerald-400/20 focus:border-emerald-400 outline-none transition-all cursor-pointer"
                            >
                                {Object.entries(VITAL_CONFIG).map(([key, cfg]) => (
                                    <option key={key} value={key}>{cfg.label} ({cfg.unit})</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
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
                            <div className="flex items-center justify-center h-full text-slate-400 font-bold text-sm">
                                Chưa có dữ liệu trong khoảng thời gian này
                            </div>
                        )}
                        {/* Background Lines */}
                        <div className="absolute inset-x-0 bottom-[calc(25%)] border-t border-slate-100 dark:border-slate-700/50"></div>
                        <div className="absolute inset-x-0 bottom-[calc(50%)] border-t border-slate-100 dark:border-slate-700/50"></div>
                        <div className="absolute inset-x-0 bottom-[calc(75%)] border-t border-slate-100 dark:border-slate-700/50"></div>
                    </div>
                </div>

                {/* AI / Doctor Analysis Section */}
                <div className="bg-[#4ade80]/5 dark:bg-[#4ade80]/10 p-7 rounded-[2rem] border border-[#4ade80]/10 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#4ade80]/10 text-[#4ade80] rounded-2xl">
                            <Zap className="w-5 h-5 fill-[#4ade80]" />
                        </div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Phân tích chuyên sâu</h3>
                    </div>

                    <div className="space-y-5 flex-1">
                        {/* Show health alerts if any */}
                        {dashboard?.healthAlerts && dashboard.healthAlerts.length > 0 ? (
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
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
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute top-4 right-4 text-[#4ade80]/10 scale-150">
                                    <Activity className="w-16 h-16" />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed relative z-10">
                                    "Các chỉ số sức khỏe của bạn đang ổn định. Tiếp tục duy trì lối sống lành mạnh nhé!"
                                </p>
                            </div>
                        )}

                        <div className="bg-[#4ade80] rounded-3xl p-6 shadow-lg shadow-[#4ade80]/20 group relative overflow-hidden">
                            <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Plus className="w-24 h-24 rotate-45" />
                            </div>
                            <h4 className="text-xs font-black text-slate-900 flex items-center gap-2 mb-2 uppercase tracking-[0.2em]">
                                <Info className="w-4 h-4" /> Lời khuyên vàng
                            </h4>
                            <p className="text-sm text-slate-900 font-bold leading-relaxed">
                                Uống đủ 2L nước mỗi ngày và hạn chế caffeine sau 14:00 để ổn định nhịp tim và giấc ngủ của bạn.
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
            </div>

            {/* Input Vital Modal */}
            <AnimatePresence>
                {showInputModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowInputModal(false)}
                            className="absolute inset-0"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-md relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <button
                                onClick={() => setShowInputModal(false)}
                                className="absolute top-8 right-8 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6 text-slate-300" />
                            </button>

                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Nhập chỉ số sức khỏe</h3>
                            <p className="text-slate-400 font-bold text-xs mb-8">Ghi nhận chỉ số sinh hiệu hàng ngày</p>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Loại chỉ số</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(VITAL_CONFIG).map(([key, cfg]) => (
                                            <button
                                                key={key}
                                                onClick={() => setInputType(key as VitalType)}
                                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${inputType === key
                                                    ? 'bg-[#4ade80] text-slate-900 shadow-md'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {cfg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Giá trị ({VITAL_CONFIG[inputType].unit})
                                    </p>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        placeholder={`VD: ${VITAL_CONFIG[inputType].normalRange[0]}`}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-black text-lg text-slate-700 dark:text-slate-200 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ghi chú (tùy chọn)</p>
                                    <textarea
                                        value={inputNotes}
                                        onChange={e => setInputNotes(e.target.value)}
                                        placeholder="VD: Đo sau khi ăn sáng 1 tiếng..."
                                        rows={2}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-medium text-sm text-slate-600 dark:text-slate-300 focus:border-emerald-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmitVital}
                                    disabled={logMutation.isPending}
                                    className="w-full py-5 bg-[#4ade80] text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-[#4ade80]/20 hover:bg-[#4ade80]/90 transition-all flex items-center justify-center gap-3"
                                >
                                    {logMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Lưu chỉ số
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
