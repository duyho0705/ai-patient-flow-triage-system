import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPortalMedicationReminders, logMedicationTaken, createPortalMedicationReminder, togglePortalMedicationReminder, getPortalDashboard } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import {
    Pill,
    Clock,
    Plus,
    Loader2,
    X,
    Bell,
    BellOff,
    CalendarDays,
    Info,
    CheckCircle2,
    BriefcaseMedical,
    Search
} from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function PatientMedications() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [showAddModal, setShowAddModal] = useState(false)
    const [newReminder, setNewReminder] = useState({
        medicineName: '',
        reminderTime: '08:00',
        dosage: '',
        notes: ''
    })

    const { data: reminders, isLoading } = useQuery({
        queryKey: ['portal-medication-reminders'],
        queryFn: () => getPortalMedicationReminders(headers),
        enabled: !!headers?.tenantId
    })

    const { data: dashboard } = useQuery({
        queryKey: ['portal-dashboard'],
        queryFn: () => getPortalDashboard(headers),
        enabled: !!headers?.tenantId
    })

    const logMutation = useMutation({
        mutationFn: (data: any) => logMedicationTaken(data, headers),
        onSuccess: () => {
            toast.success('Ghi nhận uống thuốc thành công!')
            queryClient.invalidateQueries({ queryKey: ['portal-medication-reminders'] })
            queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] })
        },
        onError: () => toast.error('Có lỗi xảy ra khi ghi nhận.')
    })

    const createMutation = useMutation({
        mutationFn: (data: any) => createPortalMedicationReminder(data, headers),
        onSuccess: () => {
            toast.success('Đã thêm lịch nhắc mới!')
            queryClient.invalidateQueries({ queryKey: ['portal-medication-reminders'] })
            setShowAddModal(false)
            setNewReminder({ medicineName: '', reminderTime: '08:00', dosage: '', notes: '' })
        },
        onError: () => toast.error('Có lỗi xảy ra khi thêm lịch nhắc.')
    })

    const toggleMutation = useMutation({
        mutationFn: ({ id, active }: { id: string, active: boolean }) => togglePortalMedicationReminder(id, active, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-medication-reminders'] })
        }
    })

    if (isLoading) return (
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#10b981] animate-spin" />
        </div>
    )

    const latestPrescription = dashboard?.latestPrescription

    return (
        <div className="space-y-8 py-8 pb-20">
            {/* Header Card */}
            <header className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full -mr-40 -mt-40 blur-3xl transition-transform duration-1000 group-hover:scale-110" />

                <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-emerald-500/10 rounded-2xl">
                                <Pill className="w-6 h-6 text-emerald-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Health Management</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý thuốc</h2>
                        <p className="text-slate-500 mt-2 font-medium max-w-xl">Theo dõi đơn thuốc điện tử và thiết lập các lịch nhắc nhở uống thuốc tự động hàng ngày.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Thêm lịch nhắc mới
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Schedule */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-xl">
                                    <Clock className="w-5 h-5 text-emerald-500" />
                                </div>
                                <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Lịch uống thuốc hôm nay</h3>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <CalendarDays className="w-4 h-4" />
                                {format(new Date(), 'EEEE, dd/MM/yyyy', { locale: vi })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {(reminders || []).length > 0 ? (
                                (reminders || []).map((med: any, idx: number) => {
                                    const isDone = med.notes?.includes('Đã uống')
                                    const isActive = med.isActive !== false
                                    return (
                                        <motion.div
                                            key={med.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${
                                                !isActive ? 'opacity-60 border-slate-100 dark:border-slate-800' : 
                                                isDone ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/10' : 
                                                'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5'
                                            }`}
                                        >
                                            <div className="flex items-center gap-6 relative z-10">
                                                <div className={`size-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 ${
                                                    !isActive ? 'bg-slate-100 text-slate-400' :
                                                    isDone ? 'bg-emerald-50 text-emerald-500' : 
                                                    'bg-emerald-500/10 text-emerald-500 shadow-sm'
                                                }`}>
                                                    {isDone ? <CheckCircle2 className="w-8 h-8 stroke-[2.5px]" /> : <Clock className="w-8 h-8 stroke-[2.5px]" />}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className={`text-lg font-black truncate transition-colors ${
                                                            isDone ? 'text-emerald-600 line-through opacity-70' : 'text-slate-900 dark:text-white group-hover:text-emerald-600'
                                                        }`}>
                                                            {med.medicineName}
                                                        </h4>
                                                        {!isActive && (
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full">Đang tắt</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                            {med.reminderTime}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                                            <Pill className="w-3.5 h-3.5 text-emerald-500" />
                                                            {med.dosage}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => toggleMutation.mutate({ id: med.id, active: !isActive })}
                                                        className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}`}
                                                    >
                                                        {isActive ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                                    </button>
                                                    
                                                    {isActive && !isDone && (
                                                        <button
                                                            onClick={() => logMutation.mutate({ medicationReminderId: med.id, medicineName: med.medicineName })}
                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                                        >
                                                            Đã uống
                                                        </button>
                                                    )}
                                                    
                                                    {isDone && (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Hoàn thành</span>
                                                            <span className="text-[8px] font-bold text-slate-400 mt-0.5 tracking-tighter italic">Lúc {format(new Date(), 'HH:mm')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center group transition-all hover:border-emerald-500/50">
                                    <div className="size-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-all">
                                        <Pill className="w-10 h-10 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Chưa có lịch nhắc uống thuốc</h4>
                                    <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">Hãy thêm lịch nhắc để không bỏ lỡ lần uống thuốc nào nhé!</p>
                                    <button 
                                        onClick={() => setShowAddModal(true)}
                                        className="mt-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl text-sm font-black text-slate-600 hover:text-emerald-600 hover:border-emerald-500/50 transition-all shadow-sm"
                                    >
                                        Thêm ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Prescription & Info */}
                <div className="space-y-8">
                    {/* Prescription Widget */}
                    <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-blue-500/10 rounded-2xl">
                                <BriefcaseMedical className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">Đơn thuốc hiện tại</h3>
                        </div>

                        {latestPrescription ? (
                            <div className="space-y-6">
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Mã đơn thuốc</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{latestPrescription.id.slice(0, 8).toUpperCase()}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2">Bác sĩ: {latestPrescription.doctorName || 'Đang cập nhật'}</p>
                                </div>

                                <div className="space-y-4">
                                    {latestPrescription.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-start justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0 group">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{item.productName}</p>
                                                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed italic">"{item.dosageInstruction}"</p>
                                            </div>
                                            <div className="ml-4 flex flex-col items-end shrink-0">
                                                <span className="text-xs font-black text-slate-400 tracking-tighter bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">x{item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={async () => {
                                        const { downloadPrescriptionPdf } = await import('@/api/portal')
                                        toast.promise(downloadPrescriptionPdf(latestPrescription.id, headers), {
                                            loading: 'Đang chuẩn bị bản in PDF...',
                                            success: 'Đã tải xuống đơn thuốc!',
                                            error: 'Lỗi khi tải PDF.'
                                        })
                                    }}
                                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                >
                                    Tải bản in đơn thuốc (PDF)
                                </button>
                            </div>
                        ) : (
                            <div className="py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                                <div className="size-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h4 className="text-slate-900 dark:text-white font-black mb-1 text-sm tracking-tight">Chưa có đơn thuốc điện tử</h4>
                                <p className="text-slate-400 font-medium text-xs max-w-[200px] mx-auto">Vui lòng liên hệ bác sĩ để nhận đơn thuốc mới nhất.</p>
                            </div>
                        )}
                    </section>

                    {/* AI Insights / Health Alert */}
                    <section className="bg-emerald-500 rounded-[2.5rem] p-8 shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute -bottom-4 -right-4 size-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Info className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-black text-lg text-white tracking-tight">Lưu ý quan trọng</h3>
                            </div>
                            
                            <p className="text-sm text-emerald-50 font-bold leading-relaxed mb-6">
                                Luôn uống thuốc đúng giờ và đủ liều lượng bác sĩ kê đơn. Nếu gặp phản ứng phụ, hãy liên hệ bác sĩ ngay qua chat hoặc đặt lịch tái khám.
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
                                    <div className="size-2 rounded-full bg-white animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Hỗ trợ 24/7 từ AI trợ lý</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Add Reminder Modal */}
            {createPortal(
                <AnimatePresence>
                    {showAddModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAddModal(false)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm shadow-2xl"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10"
                            >
                                <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Thêm lịch uống thuốc</h2>
                                            <p className="text-slate-500 font-bold text-xs mt-1">Cài đặt chuông báo tự động cho bạn</p>
                                        </div>
                                        <button
                                            onClick={() => setShowAddModal(false)}
                                            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Tên thuốc</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Pill className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <input
                                                type="text"
                                                value={newReminder.medicineName}
                                                onChange={e => setNewReminder({ ...newReminder, medicineName: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold text-sm outline-none transition-all"
                                                placeholder="VD: Paracetamol, Vitamin C..."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Giờ nhắc</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Clock className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <input
                                                    type="time"
                                                    value={newReminder.reminderTime}
                                                    onChange={e => setNewReminder({ ...newReminder, reminderTime: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold text-sm outline-none transition-all cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Liều lượng</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Info className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={newReminder.dosage}
                                                    onChange={e => setNewReminder({ ...newReminder, dosage: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold text-sm outline-none transition-all"
                                                    placeholder="VD: 1 viên, 5ml..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Ghi chú (Tùy chọn)</label>
                                        <textarea
                                            value={newReminder.notes}
                                            onChange={e => setNewReminder({ ...newReminder, notes: e.target.value })}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white font-bold text-sm min-h-[100px] outline-none transition-all resize-none"
                                            placeholder="Uống sau khi ăn, không uống với sữa..."
                                        />
                                    </div>
                                </div>

                                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 px-6 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!newReminder.medicineName) { toast.error('Vui lòng nhập tên thuốc'); return }
                                            createMutation.mutate(newReminder)
                                        }}
                                        disabled={createMutation.isPending}
                                        className="flex-[2] py-4 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Thiết lập lịch nhắc
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}
