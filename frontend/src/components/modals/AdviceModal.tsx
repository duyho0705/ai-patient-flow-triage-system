import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { sendPatientAdvice, sendPatientAlert } from '@/api/doctor'
import { useTenant } from '@/context/TenantContext'
import { toastService } from '@/services/toast'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getDoctorPatientList } from '@/api/doctor'

interface AdviceModalProps {
    isOpen: boolean
    onClose: () => void
    patientName?: string
    patientId?: string
    patientAvatar?: string
}

const QUICK_TEMPLATES = [
    { icon: 'box', label: 'Hạn chế muối' },
    { icon: 'directions_walk', label: 'Đi bộ 30p mỗi ngày' },
    { icon: 'monitor_heart', label: 'Theo dõi huyết áp định kỳ' },
    { icon: 'water_drop', label: 'Uống đủ 2L nước' },
]

export function AdviceModal({
    isOpen,
    onClose,
    patientName,
    patientId,
    patientAvatar,
}: AdviceModalProps) {
    const { headers, tenantId } = useTenant()
    const [content, setContent] = useState('')
    const [patientSearch, setPatientSearch] = useState('')
    const [debouncedPatientSearch, setDebouncedPatientSearch] = useState('')

    const { data: patientSearchResults } = useQuery({
        queryKey: ['doctor-patient-search-advice', tenantId, debouncedPatientSearch],
        queryFn: () => getDoctorPatientList(headers, 0, 10, debouncedPatientSearch),
        enabled: !!debouncedPatientSearch && !patientId
    })

    const [selectedPatient, setSelectedPatient] = useState<{ id: string, name: string, avatar?: string } | null>(
        patientId ? { id: patientId, name: patientName!, avatar: patientAvatar } : null
    )

    const handlePatientSearchChange = (e: any) => {
        setPatientSearch(e.target.value)
        setTimeout(() => setDebouncedPatientSearch(e.target.value), 300)
    }

    const selectPatient = (p: any) => {
        setSelectedPatient({ id: p.id, name: p.fullNameVi, avatar: p.avatarUrl })
        setPatientSearch(p.fullNameVi)
        setDebouncedPatientSearch('')
    }
    const [type, setType] = useState<'ADVICE' | 'ALERT'>('ADVICE')
    const [title, setTitle] = useState('Lời khuyên chuyên môn')
    const [severity, setSeverity] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('INFO')
    const [sendAsMessage, setSendAsMessage] = useState(true)
    const [sendPush, setSendPush] = useState(true)

    const mutation = useMutation({
        mutationFn: (data: { patientId: string, payload: any, isAlert: boolean }) => 
            data.isAlert 
                ? sendPatientAlert(data.patientId, data.payload, headers)
                : sendPatientAdvice(data.patientId, data.payload, headers),
        onSuccess: () => {
            toastService.success("Đã gửi khuyến nghị thành công!")
            setContent('')
            onClose()
        },
        onError: (err: any) => {
            toastService.error(err?.message || "Lỗi khi gửi khuyến nghị")
        }
    })

    const handleSubmit = () => {
        const targetPatientId = selectedPatient?.id
        if (!targetPatientId) {
            toastService.error("Vui lòng chọn bệnh nhân")
            return
        }
        if (!content.trim()) {
            toastService.error("Vui lòng nhập nội dung")
            return
        }

        mutation.mutate({
            patientId: targetPatientId,
            isAlert: type === 'ALERT',
            payload: {
                title,
                content,
                type: type,
                severity
            }
        })
    }

    if (!isOpen) return null

    const handleTemplateClick = (text: string) => {
        setContent(prev => prev ? `${prev}\n• ${text}` : `• ${text}`)
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
            {/* Backdrop */}
            <div className="fixed inset-0" onClick={onClose} />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative bg-background-light dark:bg-background-dark w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-primary/10 flex justify-between items-center bg-white dark:bg-background-dark">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-lg text-primary">
                            <span className="material-symbols-outlined text-2xl">medical_services</span>
                        </div>
                        <div>
                            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold font-display">Gửi lời khuyên chuyên môn</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">Bác sĩ gửi khuyến nghị sức khỏe trực tiếp cho bệnh nhân</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b98140 transparent' }}>
                    {/* Patient Info Section */}
                    {/* Patient Search Section */}
                    <div className="bg-primary/5 rounded-lg p-4 space-y-3 border border-primary/10">
                        <div className="flex flex-col gap-1.5 relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bệnh nhân nhận</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-primary transition-colors">person</span>
                                <input
                                    type="text"
                                    value={patientId ? patientName : patientSearch}
                                    onChange={handlePatientSearchChange}
                                    disabled={!!patientId}
                                    placeholder="Tìm kiếm bệnh nhân..."
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-2 border-primary/5 rounded-lg text-sm focus:border-primary outline-none transition-all font-bold disabled:opacity-70"
                                />
                                {debouncedPatientSearch && patientSearchResults?.content && patientSearchResults.content.length > 0 && (
                                    <div className="absolute top-[48px] left-0 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto z-50">
                                        {patientSearchResults.content.map((p: any) => (
                                            <div
                                                key={p.id}
                                                onClick={() => selectPatient(p)}
                                                className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                                            >
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">{p.fullNameVi}</p>
                                                <p className="text-xs text-slate-500">{p.phone || '–'}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {selectedPatient && (
                            <div className="flex items-center justify-between pt-2 mt-2 border-t border-primary/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                        {selectedPatient.avatar ? (
                                            <img src={selectedPatient.avatar} alt={selectedPatient.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400">{selectedPatient.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedPatient.name}</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-primary">{selectedPatient.id}</span>
                            </div>
                        )}
                    </div>

                    {/* Selection Category */}
                    <div className="space-y-2">
                        <label className="text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">category</span>
                            Danh mục lời khuyên
                        </label>
                        <select 
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary"
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                        >
                            <option value="ADVICE">Chế độ ăn uống / Tập luyện (Lời khuyên)</option>
                            <option value="ALERT">Cảnh báo sức khỏe (Khẩn cấp)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">priority_high</span>
                            Mức độ nghiêm trọng
                        </label>
                        <select 
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary"
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value as any)}
                        >
                            <option value="INFO">Thông tin (Info)</option>
                            <option value="WARNING">Cảnh báo (Warning)</option>
                            <option value="CRITICAL">Nghiêm trọng (Critical)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">title</span>
                            Tiêu đề
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Tiêu đề thông báo..."
                        />
                    </div>

                    {/* Content Area */}
                    <div className="space-y-2">
                        <label className="text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">edit_note</span>
                            Nội dung chi tiết
                        </label>
                        <textarea
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary placeholder:text-slate-400"
                            placeholder="Nhập nội dung khuyến nghị cụ thể cho bệnh nhân..."
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Quick Templates */}
                    <div className="space-y-3">
                        <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                            Thư viện lời khuyên mẫu
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_TEMPLATES.map((tpl) => (
                                <button
                                    key={tpl.label}
                                    type="button"
                                    onClick={() => handleTemplateClick(tpl.label)}
                                    className="px-3 py-1.5 rounded-full border border-primary/30 text-xs font-medium bg-primary/5 text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white transition-all flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">{tpl.icon}</span>
                                    {tpl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 pt-2">
                        <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold">Tùy chọn gửi kèm theo</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-primary/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={sendAsMessage}
                                    onChange={(e) => setSendAsMessage(e.target.checked)}
                                    className="rounded text-primary focus:ring-primary h-5 w-5"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Tin nhắn hệ thống</span>
                                    <span className="text-[10px] text-slate-500">Lưu vào hồ sơ bệnh án điện tử</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-primary/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={sendPush}
                                    onChange={(e) => setSendPush(e.target.checked)}
                                    className="rounded text-primary focus:ring-primary h-5 w-5"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Thông báo Push</span>
                                    <span className="text-[10px] text-slate-500">Gửi trực tiếp đến ứng dụng di động</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={mutation.isPending}
                        className="px-8 py-2.5 rounded-lg bg-primary text-slate-900 font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <span className="material-symbols-outlined text-lg">send</span>
                        )}
                        {mutation.isPending ? 'Đang gửi...' : 'Gửi ngay'}
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    )
}
