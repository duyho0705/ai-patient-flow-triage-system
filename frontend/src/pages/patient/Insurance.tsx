import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, QrCode, Calendar, Info, CreditCard, Plus, X, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPortalInsurance, addPortalInsurance, deletePortalInsurance, getPortalProfile } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function PatientInsurance() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newInsurance, setNewInsurance] = useState({
        insuranceType: 'BHYT',
        insuranceNumber: '',
        holderName: '',
        validFrom: '',
        validTo: '',
        isPrimary: true
    })

    const { data: profile } = useQuery({
        queryKey: ['portal-profile'],
        queryFn: () => getPortalProfile(headers),
        enabled: !!headers?.tenantId
    })

    const { data: insurances = [], isLoading } = useQuery({
        queryKey: ['portal-insurance'],
        queryFn: () => getPortalInsurance(headers),
        enabled: !!headers?.tenantId
    })

    const addMutation = useMutation({
        mutationFn: (data: any) => addPortalInsurance(data, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-insurance'] })
            setIsAddModalOpen(false)
            toast.success('Đã thêm thẻ bảo hiểm')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePortalInsurance(id, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-insurance'] })
            toast.success('Đã xóa thẻ bảo hiểm')
        }
    })

    if (isLoading) return <div className="p-12 text-center text-slate-400 font-bold">Đang tải thông tin...</div>

    const primaryCard = insurances.find(i => i.isPrimary) || insurances[0]

    return (
        <div className="space-y-12 pb-20">
            <header className="space-y-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-xl shadow-orange-200">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    Thẻ Bảo hiểm Y tế
                </h1>
                <p className="text-slate-500 font-medium text-lg ml-16">Quản lý và sử dụng thẻ BHYT điện tử của bạn cho mọi dịch vụ khám chữa bệnh.</p>
            </header>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                    {primaryCard ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            className="relative"
                        >
                            <div className="aspect-[1.586/1] w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-[0_32px_64px_-12px_rgba(59,130,246,0.3)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-32 -mt-32" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-[40px] -ml-24 -mb-24" />

                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/60">Cơ quan Bảo hiểm Xã hội Việt Nam</p>
                                            <h3 className="text-lg font-black tracking-tight italic">VIETNAM SOCIAL SECURITY</h3>
                                        </div>
                                        <div className="w-16 h-16 bg-white flex items-center justify-center rounded-2xl p-2 shadow-inner">
                                            <QrCode className="w-full h-full text-slate-900" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/50">Mã số thẻ</p>
                                            <p className="text-3xl font-black tracking-[0.1em] font-mono">{primaryCard.insuranceNumber}</p>
                                        </div>
                                        <div className="flex gap-12">
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-blue-200/50">Họ và tên</p>
                                                <p className="text-sm font-black uppercase">{primaryCard.holderName || profile?.fullNameVi}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-blue-200/50">Hạn sử dụng</p>
                                                <p className="text-sm font-black uppercase">{primaryCard.validTo ? new Date(primaryCard.validTo).toLocaleDateString() : 'Không thời hạn'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-xl border border-blue-50 flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Thẻ đang hoạt động</span>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="aspect-[1.586/1] w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-4">
                            <ShieldCheck className="w-12 h-12 opacity-20" />
                            <p className="font-black text-xs uppercase tracking-widest">Chưa có thẻ bảo hiểm nào</p>
                        </div>
                    )}

                    <div className="pt-12 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 p-5 bg-white border border-slate-100 rounded-3xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <QrCode className="w-5 h-5" />
                            Hiện QR Code
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center justify-center gap-3 p-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm thẻ mới
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Info className="w-5 h-5" />
                            </div>
                            Quyền lợi Bảo hiểm
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Mức hưởng', value: '80%', desc: 'Được hỗ trợ 80% chi phí khám chữa bệnh đúng tuyến.' },
                                { title: 'Nơi ĐKKCBBĐ', value: 'Bệnh viện ĐK Tuy Hòa', desc: 'Sử dụng thẻ tại cơ sở dược chỉ định' },
                                { title: 'Thời điểm 5 năm liên tục', value: '01/01/2028', desc: 'Tận hưởng quyền lợi tối đa sau 5 năm.' }
                            ].map((item, i) => (
                                <div key={i} className="p-5 bg-slate-50/50 rounded-3xl border border-slate-50 hover:border-blue-100 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.title}</p>
                                        <span className="text-sm font-black text-blue-600">{item.value}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <section className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 px-2 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-slate-400" />
                    Danh sách thẻ bảo hiểm
                </h3>
                <div className="space-y-4">
                    {insurances.map((ins) => (
                        <div key={ins.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-500 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{ins.insuranceType} · {ins.isPrimary ? 'Mặc định' : 'Thẻ phụ'}</p>
                                    <h4 className="font-black text-slate-900 tracking-tight">{ins.insuranceNumber}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1">
                                        Hết hạn: {ins.validTo ? new Date(ins.validTo).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { if (confirm('Xóa thẻ này?')) deleteMutation.mutate(ins.id) }}
                                className="w-10 h-10 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] p-8 md:p-10 w-full max-w-xl relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6 text-slate-300" />
                            </button>

                            <div className="text-left space-y-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Thêm thẻ bảo hiểm</h3>
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Thông tin thẻ</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số thẻ BHYT</label>
                                        <input
                                            value={newInsurance.insuranceNumber}
                                            onChange={e => setNewInsurance({ ...newInsurance, insuranceNumber: e.target.value })}
                                            type="text"
                                            placeholder="Ví dụ: GD 4 79 1234567890"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ tên chủ thẻ</label>
                                        <input
                                            value={newInsurance.holderName}
                                            onChange={e => setNewInsurance({ ...newInsurance, holderName: e.target.value })}
                                            type="text"
                                            placeholder={profile?.fullNameVi || "Nguyễn Văn A"}
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày bắt đầu</label>
                                            <input
                                                value={newInsurance.validFrom}
                                                onChange={e => setNewInsurance({ ...newInsurance, validFrom: e.target.value })}
                                                type="date"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày hết hạn</label>
                                            <input
                                                value={newInsurance.validTo}
                                                onChange={e => setNewInsurance({ ...newInsurance, validTo: e.target.value })}
                                                type="date"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                                        <input
                                            type="checkbox"
                                            checked={newInsurance.isPrimary}
                                            onChange={e => setNewInsurance({ ...newInsurance, isPrimary: e.target.checked })}
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Đặt làm thẻ mặc định</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => addMutation.mutate(newInsurance)}
                                    disabled={!newInsurance.insuranceNumber || addMutation.isPending}
                                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-200 transition-all shadow-xl shadow-blue-100 mt-4"
                                >
                                    {addMutation.isPending ? 'Đang lưu...' : 'Lưu thẻ bảo hiểm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
