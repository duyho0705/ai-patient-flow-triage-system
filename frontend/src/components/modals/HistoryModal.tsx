import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { getPatientMedicalHistory } from '@/api/doctor'
import { useTenant } from '@/context/TenantContext'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

interface HistoryModalProps {
    isOpen: boolean
    onClose: () => void
    patientId?: string
    patientName?: string
}

export function HistoryModal({ isOpen, onClose, patientId, patientName = 'Bệnh nhân' }: HistoryModalProps) {
    const { headers } = useTenant()

    const { data, isLoading } = useQuery({
        queryKey: ['patient-history', patientId],
        queryFn: () => getPatientMedicalHistory(patientId!, headers),
        enabled: !!patientId && isOpen
    })

    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 overflow-hidden">
                <div className="fixed inset-0" onClick={onClose} />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden z-10"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-primary/10 flex items-center justify-between min-h-[73px]">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Lịch sử khám bệnh - {patientName}
                        </h2>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hover:text-red-500">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto w-full">
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                    Tìm kiếm
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                    <input
                                        className="w-full pl-10 pr-4 py-2 bg-primary/5 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                                        placeholder="Tìm kiếm chẩn đoán hoặc bác sĩ..."
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="flex-none w-full md:w-auto">
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                    Khoảng thời gian
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        className="bg-primary/5 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                        type="date"
                                    />
                                    <span className="text-slate-400">đến</span>
                                    <input
                                        className="bg-primary/5 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                        type="date"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="border border-primary/10 rounded-xl overflow-hidden w-full">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary/5 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Ngày khám</th>
                                        <th className="px-6 py-4">Bác sĩ</th>
                                        <th className="px-6 py-4">Chẩn đoán</th>
                                        <th className="px-6 py-4">Hình thức</th>
                                        <th className="px-6 py-4 text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5 dark:divide-slate-800 w-full">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="size-8 text-primary animate-spin" />
                                                    <p className="text-sm font-bold text-slate-400">Đang tải lịch sử khám...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : data?.content?.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                Chưa có lịch sử khám bệnh
                                            </td>
                                        </tr>
                                    ) : (
                                        data?.content?.map((item) => (
                                            <tr key={item.id} className="hover:bg-primary/5 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold">
                                                    {item.startedAt ? format(new Date(item.startedAt), 'dd/MM/yyyy') : '–'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                                            {item.doctorName?.charAt(0) || 'D'}
                                                        </div>
                                                        <span className="text-sm font-medium">{item.doctorName || 'Bác sĩ'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">{item.diagnosisNotes || 'Chưa cập nhật'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                                        item.status === 'COMPLETED' 
                                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                        {item.status === 'COMPLETED' ? 'Hoàn thành' : (item.status || 'Đang khám')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Xem chi tiết">
                                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors" title="Tải xuống PDF">
                                                            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-end gap-3 bg-primary/5 dark:bg-slate-800/50 w-full">
                        <button onClick={onClose} className="w-full sm:w-auto px-6 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            Đóng
                        </button>
                        <button className="w-full sm:w-auto px-6 py-2 rounded-xl bg-primary text-slate-900 font-bold hover:brightness-105 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">add</span>
                            Tạo lượt khám mới
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}
