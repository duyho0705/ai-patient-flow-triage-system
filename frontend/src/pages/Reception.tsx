import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { listPatients, createPatient } from '@/api/patients'
import { toastService } from '@/services/toast'
import { CheckInModal } from '@/components/CheckInModal'
import {
    Search, UserPlus, Calendar, Clock,
    ArrowRight, CheckCircle2,
    User, Smartphone, CreditCard, ChevronRight,
    SearchX, Loader2, Sparkles, Filter, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PatientDto, CreatePatientRequest } from '@/types/api'

export function Reception() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
    const [checkInPatient, setCheckInPatient] = useState<PatientDto | null>(null)

    // Data Fetching
    const { data: patients, isLoading } = useQuery({
        queryKey: ['reception-patients', searchQuery],
        queryFn: () => listPatients({ page: 0, size: 20, query: searchQuery }, headers),
        enabled: !!headers?.tenantId,
        // Debounce search would be good but for now let's keep it simple
    })

    // Stats (Mock for now, can be fetched from Analytics API later)
    const stats = [
        { label: 'Tiếp đón hôm nay', value: '42', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Đang chờ khám', value: '12', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Hoàn tất', value: '28', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ]

    const handleCheckIn = (patient: PatientDto) => {
        setCheckInPatient(patient)
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header / Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Phòng Tiếp đón</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-1">Đăng ký bệnh nhân mới hoặc check-in hàng chờ khám.</p>
                </div>

                <div className="flex gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                                <p className="text-xl font-black text-slate-900">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Command Bar */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        <Search className="h-6 w-6 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <div className="h-6 w-px bg-slate-100" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm theo Tên bệnh nhân, Số điện thoại hoặc CCCD..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-100 pl-20 pr-6 py-6 rounded-[2rem] font-black text-lg focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 shadow-xl shadow-slate-200/50 transition-all outline-none placeholder:text-slate-200"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full transition-all"
                        >
                            <ArrowRight className="w-5 h-5 text-slate-400 rotate-180" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-[#2b8cee] hover:shadow-2xl hover:shadow-[#2b8cee]/20 transition-all active:scale-95 group"
                >
                    <UserPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Đăng ký BN Mới
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Results */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Kết quả tìm kiếm
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 italic">Hiển thị tối đa 20 kết quả phù hợp nhất</p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-32 bg-white rounded-[2.5rem] animate-pulse border border-slate-50" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence mode='popLayout'>
                                {patients?.content?.length ? (
                                    patients.content.map((p) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            key={p.id}
                                            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden flex flex-col justify-between"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors uppercase">{p.fullNameVi}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.dateOfBirth}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mb-6">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                                                    <Smartphone className="w-3 h-3" />
                                                    {p.phone || '—'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                                                    <CreditCard className="w-3 h-3" />
                                                    {p.cccd || 'No CCCD'}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleCheckIn(p)}
                                                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:shadow-xl hover:shadow-emerald-100 transition-all"
                                            >
                                                Tiếp đón ngay
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-10">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                                            <SearchX className="w-10 h-10" />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 mb-2">Không tìm thấy bệnh nhân</h4>
                                        <p className="text-slate-400 font-medium max-w-xs">Bạn có thể thử tìm kiếm theo số điện thoại hoặc mã CCCD để kết quả chính xác hơn.</p>
                                        <button
                                            onClick={() => setIsRegisterModalOpen(true)}
                                            className="mt-6 flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-700 underline underline-offset-8"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Đăng ký mới ngay
                                        </button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Right: Quick Tools */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl -mr-10 -mt-10" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-black tracking-tight mb-2 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                Lịch hẹn sắp tới
                            </h3>
                            <p className="text-slate-400 font-medium text-xs mb-6">Các bệnh nhân đã đặt trước qua Kiosk hoặc Portal.</p>

                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group/item">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-black text-sm uppercase group-hover/item:text-blue-400">Nguyễn Văn {i % 2 === 0 ? 'Hưng' : 'Linh'}</p>
                                            <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">14:3{i}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Khám Nội · Dr. Trọng</p>
                                    </div>
                                ))}
                                <button className="w-full text-center py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Xem tất cả lịch hẹn</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            Vừa tiếp đón
                        </h3>
                        <div className="space-y-6 relative before:absolute before:left-[1.35rem] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="relative pl-10">
                                    <div className="absolute left-0 top-0 w-7 h-7 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center z-10">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs font-black text-slate-900 uppercase leading-none mb-1">Trần Thị Búp {i}</p>
                                        <span className="text-[9px] font-bold text-slate-400">5 phút trước</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Số thứ tự: <span className="text-blue-600 font-black">A-00{i}</span> · Hàng chờ Phân loại</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Check-In Modal */}
            <AnimatePresence>
                {checkInPatient && (
                    <CheckInModal
                        patient={checkInPatient}
                        onClose={() => setCheckInPatient(null)}
                        onSuccess={() => {
                            setCheckInPatient(null)
                            // Refetch or update stats here
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Register Patient Modal */}
            <AnimatePresence>
                {isRegisterModalOpen && (
                    <RegisterPatientModal
                        onClose={() => setIsRegisterModalOpen(false)}
                        onSuccess={(p) => {
                            setIsRegisterModalOpen(false)
                            queryClient.invalidateQueries({ queryKey: ['reception-patients'] })
                            setCheckInPatient(p)
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function RegisterPatientModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (p: PatientDto) => void }) {
    const { headers } = useTenant()
    const [isPending, setIsPending] = useState(false)
    const [form, setForm] = useState<CreatePatientRequest>({
        fullNameVi: '',
        dateOfBirth: '',
        phone: '',
        gender: 'MALE',
        cccd: '',
        addressLine: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        try {
            const p = await createPatient(form, headers)
            toastService.success('✅ Đăng ký bệnh nhân mới thành công!')
            onSuccess(p)
        } catch (err) {
            toastService.error(err instanceof Error ? err.message : 'Lỗi khi đăng ký')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden"
            >
                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Đăng ký Bệnh nhân Mới</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Họ và Tên (In hoa không dấu hoặc có dấu) *</label>
                            <input
                                required
                                value={form.fullNameVi}
                                onChange={e => setForm({ ...form, fullNameVi: e.target.value.toUpperCase() })}
                                className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl font-black text-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all uppercase"
                                placeholder="VD: NGUYEN VAN A"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ngày sinh (DD/MM/YYYY) *</label>
                            <input
                                required
                                type="date"
                                value={form.dateOfBirth}
                                onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Giới tính *</label>
                            <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
                                {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setForm({ ...form, gender: g })}
                                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${form.gender === g ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : 'Khác'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Số điện thoại liên hệ *</label>
                            <input
                                required
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                placeholder="090..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Số CCCD / Passport</label>
                            <input
                                value={form.cccd ?? ''}
                                onChange={e => setForm({ ...form, cccd: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                placeholder="Nhập số CCCD..."
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Địa chỉ thường trú</label>
                            <input
                                value={form.addressLine ?? ''}
                                onChange={e => setForm({ ...form, addressLine: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                placeholder="Số nhà, tên đường, phường/xã..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black tracking-widest text-[10px] uppercase hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận Đăng ký'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-10 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
