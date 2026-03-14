import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getPatientHealthThresholds, upsertPatientHealthThreshold, METRIC_TYPE_LABELS, METRIC_TYPE_UNITS } from '@/api/doctorHealth'
import { X, Save, AlertTriangle, Settings2, Activity, HeartPulse } from 'lucide-react'
import { toastService } from '@/services/toast'

interface ThresholdModalProps {
    isOpen: boolean
    onClose: () => void
    patientId?: string
}

export function ThresholdModal({ isOpen, onClose, patientId }: ThresholdModalProps) {
    const { headers, tenantId } = useTenant()
    const queryClient = useQueryClient()

    const { data: thresholds, isLoading } = useQuery({
        queryKey: ['patient-thresholds', tenantId, patientId],
        queryFn: () => getPatientHealthThresholds(patientId!, headers),
        enabled: !!patientId && !!tenantId && isOpen
    })

    const mutation = useMutation({
        mutationFn: (data: any) => upsertPatientHealthThreshold(patientId!, data, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-thresholds', tenantId, patientId] })
            toastService.success("Đã lưu ngưỡng cảnh báo thành công!")
        },
        onError: () => {
            toastService.error("Lỗi khi lưu ngưỡng. Vui lòng thử lại.")
        }
    })

    // Local state for editing form
    const [localData, setLocalData] = useState<Record<string, { min?: string, max?: string }>>({})

    useEffect(() => {
        if (thresholds) {
            const initial: Record<string, { min?: string, max?: string }> = {}
            thresholds.forEach(t => {
                initial[t.metricType] = { min: t.minValue?.toString() || '', max: t.maxValue?.toString() || '' }
            })
            setLocalData(initial)
        }
    }, [thresholds, isOpen])

    const handleSave = async () => {
        if (!patientId) return
        try {
            const promises = Object.entries(localData).map(([metricType, values]) => {
                const min = values.min ? Number(values.min) : undefined
                const max = values.max ? Number(values.max) : undefined
                return mutation.mutateAsync({ metricType, minValue: min, maxValue: max, active: true })
            })
            await Promise.all(promises)
            onClose()
        } catch (e) {
            // Error handled in mutation functions
        }
    }

    if (!isOpen) return null

    const trackingMetrics = [
        { type: 'BLOOD_GLUCOSE', icon: Activity, defaultMin: 70, defaultMax: 130 },
        { type: 'BLOOD_PRESSURE_SYS', icon: HeartPulse, defaultMin: 90, defaultMax: 140 },
        { type: 'BLOOD_PRESSURE_DIA', icon: HeartPulse, defaultMin: 60, defaultMax: 90 },
        { type: 'HEART_RATE', icon: Activity, defaultMin: 60, defaultMax: 100 },
        { type: 'SPO2', icon: Activity, defaultMin: 95, defaultMax: 100 }
    ]

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-slate-50 dark:bg-slate-950 rounded-2xl w-full max-w-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-white/20 dark:border-slate-800 relative z-10 font-display max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-primary/5 bg-white dark:bg-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center p-2">
                                <Settings2 className="w-full h-full" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Cấu hình Ngưỡng cảnh báo</h2>
                                <p className="text-xs font-bold text-slate-500 mt-0.5">Tùy chỉnh giới hạn an toàn cá nhân hóa cho từng bệnh nhân</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto min-h-[50vh] bg-slate-50 dark:bg-slate-950">
                        {/* Info banner */}
                        <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl mb-6 border border-amber-200 dark:border-amber-900/50">
                            <AlertTriangle className="size-5 shrink-0" />
                            <p className="text-sm font-semibold">Khi chỉ số bệnh nhân đo vượt qua các ngưỡng tối đa hoặc tối thiểu được thiết lập tại đây, hệ thống sẽ tự động gửi cảnh báo khẩn cấp đến bác sĩ và thiết bị bệnh nhân.</p>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {trackingMetrics.map((m) => {
                                    const val = localData[m.type] || { min: '', max: '' }
                                    const Icon = m.icon
                                    return (
                                        <div key={m.type} className="flex items-center gap-6 bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/5 shadow-sm group hover:border-primary/20 transition-all">
                                            <div className="w-48 flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                    <Icon className="size-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{METRIC_TYPE_LABELS[m.type]}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">({METRIC_TYPE_UNITS[m.type]})</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex items-center gap-3">
                                                <div className="flex-1 relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Min</span>
                                                    <input
                                                        type="number"
                                                        value={val.min}
                                                        onChange={(e) => setLocalData({ ...localData, [m.type]: { ...localData[m.type], min: e.target.value } })}
                                                        placeholder={m.defaultMin.toString()}
                                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-black text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                    />
                                                </div>
                                                <span className="text-slate-300 dark:text-slate-700 font-black">—</span>
                                                <div className="flex-1 relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Max</span>
                                                    <input
                                                        type="number"
                                                        value={val.max}
                                                        onChange={(e) => setLocalData({ ...localData, [m.type]: { ...localData[m.type], max: e.target.value } })}
                                                        placeholder={m.defaultMax.toString()}
                                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-black text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 z-10">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-800 transition-all text-sm active:scale-95"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={mutation.isPending}
                            className="px-6 py-2.5 rounded-xl bg-primary text-slate-900 font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 text-sm disabled:opacity-70 disabled:scale-100"
                        >
                            {mutation.isPending ? 'Đang lưu...' : (
                                <>
                                    <Save className="size-4" />
                                    <span>Lưu cài đặt</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}
