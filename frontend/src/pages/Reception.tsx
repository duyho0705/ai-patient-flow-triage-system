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
    SearchX, Loader2, Sparkles, Filter, X, Zap,
    TrendingUp, Star, MapPin, ShieldCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PatientDto, CreatePatientRequest } from '@/types/api'

export function Reception() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
    const [checkInPatient, setCheckInPatient] = useState<PatientDto | null>(null)

    const { data: patients, isLoading } = useQuery({
        queryKey: ['reception-patients', searchQuery],
        queryFn: () => listPatients({ page: 0, size: 20, query: searchQuery }, headers),
        enabled: !!headers?.tenantId,
    })

    const stats = [
        { label: 'Tiếp đón', value: '42', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Chờ khám', value: '12', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Hoàn tất', value: '28', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ]

    const handleCheckIn = (patient: PatientDto) => {
        setCheckInPatient(patient)
    }

    return (
        <div className="pb-20 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Premium Hero Header ── */}
            <div className="bg-slate-900 -mx-4 sm:-mx-6 lg:-mx-8 p-10 lg:p-14 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent skew-x-12 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10 max-w-[1600px] mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-10">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/5 backdrop-blur-md"
                            >
                                <Sparkles className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Tiếp đón & Vận hành</span>
                            </motion.div>

                            <div className="flex items-center gap-6">
                                <div className="hidden sm:flex w-16 h-16 bg-white rounded-2xl items-center justify-center text-slate-900 shadow-2xl">
                                    <UserPlus className="w-8 h-8" />
                                </div>
                                <div>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                        className="text-4xl lg:text-5xl font-black text-white tracking-tightest leading-none uppercase"
                                    >
                                        Tiếp nhận Bệnh nhân
                                    </motion.h1>
                                    <p className="text-slate-400 font-bold mt-2 text-sm max-w-lg leading-relaxed">
                                        Tìm kiếm hồ sơ cũ hoặc tạo tài khoản mới cho bệnh nhân vừa đến phòng khám.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-[1.5rem] min-w-[140px] flex flex-col gap-3 group hover:bg-white/10 transition-all">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} ${s.color} transition-transform group-hover:scale-110 shadow-lg`}>
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                                        <p className="text-2xl font-black text-white leading-none">{s.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm theo tên đầy đủ (Không dấu), Số điện thoại hoặc CCCD..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 border border-white/10 pl-16 pr-6 py-5 rounded-2xl text-base font-bold text-white placeholder:text-slate-500 focus:bg-white/20 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all outline-none"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-6 flex items-center">
                                    <X className="h-5 w-5 text-slate-500 hover:text-white transition-colors" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setIsRegisterModalOpen(true)}
                            className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20"
                        >
                            <UserPlus className="w-5 h-5" />
                            Khai báo BN mới
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                    {/* ── Left Sidebar: Utils ── */}
                    <div className="xl:col-span-3 space-y-6">
                        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-amber-100" />
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3 relative">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Tiện ích nhanh
                            </h3>
                            <div className="space-y-2 relative">
                                {[
                                    { label: 'Tra cứu Bảo hiểm y tế', icon: ShieldCheck, color: 'blue' },
                                    { label: 'Dịch vụ in QR Bệnh nhân', icon: Star, color: 'indigo' },
                                    { label: 'Danh sách hủy lịch', icon: X, color: 'rose' },
                                    { label: 'Check-in Ưu tiên', icon: Zap, color: 'amber' }
                                ].map((item, idx) => (
                                    <button key={idx} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all group/btn rounded-2xl border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/btn:bg-white group-hover/btn:shadow-sm transition-all">
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-black text-slate-600 transition-colors uppercase tracking-tight">{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                <Star className="w-20 h-20" />
                            </div>
                            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Gói dịch vụ Hot
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { title: 'Tầm soát Ung thư Phụ khoa', price: '2.500.000', tag: 'Bán chạy' },
                                    { title: 'Khám Tổng quát Gold', price: '4.800.000', tag: 'VIP' }
                                ].map((p, i) => (
                                    <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl group/card hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-black text-white group-hover/card:text-blue-400 transition-colors uppercase leading-tight">{p.title}</p>
                                            <span className="text-[8px] font-black bg-blue-500 px-2 py-0.5 rounded-full uppercase">{p.tag}</span>
                                        </div>
                                        <p className="text-lg font-black text-blue-300">{p.price} <span className="text-[10px] text-slate-500 italic">VNĐ</span></p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* ── Middle: Search Results ── */}
                    <main className="xl:col-span-6 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <Filter className="w-4 h-4 text-blue-600" />
                                </div>
                                Hồ sơ Bệnh nhân ({patients?.content?.length ?? 0})
                            </h3>
                            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-28 bg-white rounded-[2rem] animate-pulse border border-slate-50 shadow-sm" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence mode='popLayout'>
                                    {patients?.content?.length ? (
                                        patients.content.map((p) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={p.id}
                                                className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                                            >
                                                <div className="flex items-start gap-6">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0 group-hover:rotate-3">
                                                        <User className="w-8 h-8" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{p.fullNameVi}</h4>
                                                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                {p.gender === 'MALE' ? 'Nam' : 'Nữ'}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                                                <Calendar className="w-3.5 h-3.5 text-slate-300" /> {p.dateOfBirth}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                                                <Smartphone className="w-3.5 h-3.5 text-slate-300" /> {p.phone || '—'}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                                                <CreditCard className="w-3.5 h-3.5 text-slate-300" /> {p.cccd || 'N/A'}
                                                            </div>
                                                        </div>
                                                        {p.addressLine && (
                                                            <p className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-tighter">
                                                                <MapPin className="w-3 h-3" /> {p.addressLine}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleCheckIn(p)}
                                                    className="w-full md:w-auto px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-[0.1em] hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 hover:border-emerald-600 shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    Mở Tiếp nhận
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center px-10">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-6 group-hover:animate-bounce">
                                                <SearchX className="w-12 h-12" />
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Không tìm thấy bệnh nhân</h4>
                                            <p className="text-slate-400 text-sm max-w-sm font-medium mb-8 italic">Rất tiếc, chúng tôi không tìm thấy kết quả nào trùng khớp. Bạn có thể kiểm tra lại thông tin tìm kiếm.</p>
                                            <button
                                                onClick={() => setIsRegisterModalOpen(true)}
                                                className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                                            >
                                                <UserPlus className="w-5 h-5" />
                                                Khai báo ngay
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </main>

                    {/* ── Right Sidebar: Monitoring ── */}
                    <div className="xl:col-span-3 space-y-6">
                        <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[100px] opacity-10 -mr-16 -mt-16" />
                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-white tracking-[0.2em] mb-1 flex items-center gap-3 uppercase">
                                    <Star className="w-4 h-4 text-blue-400" />
                                    Lịch hẹn Priority
                                </h3>
                                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest mb-6">Ưu tiên tiếp đón ngày hôm nay</p>

                                <div className="space-y-3">
                                    {[
                                        { name: 'Nguyễn Kiều Trang', type: 'Nội soi dạ dày', time: '15:30' },
                                        { name: 'Phạm Đức Anh', type: 'Xét nghiệm mẫu', time: '16:00' },
                                        { name: 'Lê Thu Phương', type: 'Tư vấn Chuyên gia', time: '16:15' }
                                    ].map((app, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group/row flex items-center justify-between">
                                            <div className="min-w-0">
                                                <p className="font-black text-sm text-slate-200 truncate group-hover/row:text-blue-400 transition-colors uppercase">{app.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase mt-1">
                                                    <Clock className="w-3 h-3" /> {app.time} · {app.type}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover/row:translate-x-1 transition-all" />
                                        </div>
                                    ))}
                                    <button className="w-full text-center py-2 text-[10px] font-black uppercase text-slate-600 hover:text-white tracking-[0.2em] transition-all">Toàn bộ lịch hẹn</button>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                            <h3 className="text-xs font-black text-slate-400 tracking-[0.2em] mb-6 flex items-center gap-3 uppercase">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Vừa Tiếp nhận
                            </h3>
                            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
                                {[
                                    { name: 'Hoàng Minh Quân', time: '2m', status: 'Chờ khám' },
                                    { name: 'Đỗ Thùy Linh', time: '5m', status: 'Tiền xử lý' },
                                    { name: 'Vũ Quốc Bảo', time: '8m', status: 'Cấp cứu' }
                                ].map((item, i) => (
                                    <div key={i} className="relative pl-10 group/item">
                                        <div className="absolute left-0 top-0.5 w-8 h-8 bg-white border-4 border-slate-50 rounded-2xl flex items-center justify-center z-10 shadow-sm group-hover/item:border-blue-50 group-hover/item:scale-110 transition-all">
                                            <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-rose-500 animate-pulse' : 'bg-slate-200'}`} />
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                                            <span className="text-[10px] font-black text-slate-300 uppercase shrink-0">{item.time}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{item.status}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
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
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Register Modal */}
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
            toastService.success('✨ Chào mừng bệnh nhân mới: ' + p.fullNameVi)
            onSuccess(p)
        } catch (err) {
            toastService.error(err instanceof Error ? err.message : 'Lỗi khi đăng ký')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-[#f8fafc] rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between px-10 py-8 bg-white border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Khai báo Bệnh nhân</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Hồ sơ đăng ký chính thức</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                        <X className="h-6 w-6 text-slate-400" />
                    </button>
                </div>

                <div className="overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Họ và Tên đầy đủ *
                                </label>
                                <input
                                    required
                                    value={form.fullNameVi}
                                    onChange={e => setForm({ ...form, fullNameVi: e.target.value.toUpperCase() })}
                                    className="w-full px-8 py-5 bg-white border border-slate-100 rounded-3xl font-black text-2xl text-slate-900 placeholder:text-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all uppercase"
                                    placeholder="NGUYỄN VĂN A"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Ngày sinh *</label>
                                <input
                                    required
                                    type="date"
                                    value={form.dateOfBirth}
                                    onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-lg text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Giới tính *</label>
                                <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl md:h-[60px] items-stretch gap-1.5">
                                    {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setForm({ ...form, gender: g })}
                                            className={`flex-1 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${form.gender === g ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : 'Khác'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                                    <Smartphone className="w-3 h-3 text-blue-500" /> Số điện thoại *
                                </label>
                                <input
                                    required
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    placeholder="09xxx..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                                    <CreditCard className="w-3 h-3 text-emerald-500" /> CCCD / Hộ chiếu
                                </label>
                                <input
                                    value={form.cccd ?? ''}
                                    onChange={e => setForm({ ...form, cccd: e.target.value })}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    placeholder="Số định danh..."
                                />
                            </div>

                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-rose-500" /> Địa chỉ thường trú
                                </label>
                                <textarea
                                    value={form.addressLine ?? ''}
                                    onChange={e => setForm({ ...form, addressLine: e.target.value })}
                                    rows={2}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 disabled:opacity-50"
                            >
                                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Xác nhận Lưu hồ sơ <CheckCircle2 className="w-5 h-5" /></>}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-10 py-6 bg-slate-50 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                            >
                                Hủy bỏ
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
