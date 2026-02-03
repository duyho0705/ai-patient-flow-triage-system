import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBranches, createBranch, updateBranch } from '@/api/tenants'
import { useTenant } from '@/context/TenantContext'
import { toastService } from '@/services/toast'
import { Building2, Plus, Pencil, Save, X, Phone, MapPin, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TenantBranchDto, CreateBranchRequest } from '@/types/api'

export function BranchManagement() {
    const { headers, tenantId } = useTenant()
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBranch, setEditingBranch] = useState<TenantBranchDto | null>(null)
    const [form, setForm] = useState<Partial<CreateBranchRequest>>({
        code: '',
        nameVi: '',
        addressLine: '',
        city: '',
        district: '',
        ward: '',
        phone: ''
    })

    const { data: branches, isLoading } = useQuery({
        queryKey: ['branches', tenantId],
        queryFn: () => listBranches(tenantId!),
        enabled: !!tenantId,
    })

    const createMutation = useMutation({
        mutationFn: (data: CreateBranchRequest) => createBranch(data),
        onSuccess: () => {
            toastService.success('Đã tạo chi nhánh mới thành công')
            setIsModalOpen(false)
            resetForm()
            queryClient.invalidateQueries({ queryKey: ['branches'] })
        },
        onError: (e: Error) => toastService.error(e.message)
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<TenantBranchDto> }) => updateBranch(id, data),
        onSuccess: () => {
            toastService.success('✨ Cập nhật chi nhánh thành công')
            setIsModalOpen(false)
            setEditingBranch(null)
            resetForm()
            queryClient.invalidateQueries({ queryKey: ['branches'] })
        },
        onError: (e: Error) => toastService.error(e.message)
    })

    const resetForm = () => {
        setForm({
            code: '',
            nameVi: '',
            addressLine: '',
            city: '',
            district: '',
            ward: '',
            phone: ''
        })
        setEditingBranch(null)
    }

    const openEdit = (b: TenantBranchDto) => {
        setEditingBranch(b)
        setForm({
            code: b.code,
            nameVi: b.nameVi,
            addressLine: b.addressLine,
            city: b.city,
            district: b.district,
            ward: b.ward,
            phone: b.phone
        })
        setIsModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingBranch) {
            updateMutation.mutate({ id: editingBranch.id, data: form })
        } else {
            createMutation.mutate({ ...form, tenantId: tenantId! } as CreateBranchRequest)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cấu hình Chi nhánh</h1>
                    <p className="text-slate-500 font-medium">Quản lý mạng lưới cơ sở y tế trong hệ thống.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-sm tracking-tight hover:bg-[#2b8cee] hover:shadow-xl hover:shadow-[#2b8cee]/20 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Thêm cơ sở mới
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-48 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse" />
                    ))
                ) : branches?.map((b) => (
                    <motion.div
                        layout
                        key={b.id}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group hover:border-[#2b8cee]/30 transition-all duration-300"
                    >
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-xl tracking-tight leading-none mb-2">{b.nameVi}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Mã: {b.code}</span>
                                            {b.isActive !== false ? (
                                                <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Hoạt động</span>
                                            ) : (
                                                <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">Ngừng nghỉ</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openEdit(b)}
                                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-[#2b8cee] transition-all"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <MapPin className="w-3 h-3" />
                                        Địa chỉ
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 truncate">{b.addressLine}, {b.district}, {b.city}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Phone className="w-3 h-3" />
                                        Liên hệ
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">{b.phone || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Branch Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                        {editingBranch ? 'Cập nhật Chi nhánh' : 'Thiết lập Chi nhánh mới'}
                                    </h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-2xl transition-all">
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mã chi nhánh *</label>
                                        <input
                                            required
                                            disabled={!!editingBranch}
                                            placeholder="Gõ mã định danh..."
                                            value={form.code}
                                            onChange={e => setForm({ ...form, code: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tên hiển thị *</label>
                                        <input
                                            required
                                            placeholder="Tên chi nhánh/phòng khám..."
                                            value={form.nameVi}
                                            onChange={e => setForm({ ...form, nameVi: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Địa chỉ (Số nhà, Đường) *</label>
                                        <input
                                            required
                                            placeholder="Nhập địa chỉ chi tiết..."
                                            value={form.addressLine}
                                            onChange={e => setForm({ ...form, addressLine: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Thành phố / Tỉnh *</label>
                                        <input
                                            required
                                            value={form.city}
                                            onChange={e => setForm({ ...form, city: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Số điện thoại</label>
                                        <input
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-50 pt-8">
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="flex-1 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black tracking-tight hover:bg-[#2b8cee] shadow-xl hover:shadow-[#2b8cee]/20 transition-all disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {(createMutation.isPending || updateMutation.isPending) ? 'Đang lưu...' : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Lưu thông tin chi nhánh
                                                </>
                                            )}
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-10 py-5 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
