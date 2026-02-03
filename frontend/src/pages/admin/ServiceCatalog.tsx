import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listMedicalServices, createMedicalService, updateMedicalService } from '@/api/masterData'
import { useTenant } from '@/context/TenantContext'
import { toastService } from '@/services/toast'
import { Stethoscope, Plus, Pencil, Save, X, Search, DollarSign, Tag, Info, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MedicalServiceDto } from '@/types/api'

export function ServiceCatalog() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<MedicalServiceDto | null>(null)
    const [form, setForm] = useState<Partial<MedicalServiceDto>>({
        code: '',
        nameVi: '',
        description: '',
        category: 'EXAM',
        unitPrice: 0,
        isActive: true
    })

    const { data: services, isLoading } = useQuery({
        queryKey: ['medical-services'],
        queryFn: () => listMedicalServices({}, headers),
        enabled: !!headers?.tenantId,
    })

    const createMutation = useMutation({
        mutationFn: (data: Partial<MedicalServiceDto>) => createMedicalService(data, headers),
        onSuccess: () => {
            toastService.success('✅ Đã thêm dịch vụ mới thành công')
            setIsModalOpen(false)
            resetForm()
            queryClient.invalidateQueries({ queryKey: ['medical-services'] })
        },
        onError: (e: Error) => toastService.error(e.message)
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<MedicalServiceDto> }) => updateMedicalService(id, data, headers),
        onSuccess: () => {
            toastService.success('✨ Cập nhật dịch vụ thành công')
            setIsModalOpen(false)
            setEditingService(null)
            resetForm()
            queryClient.invalidateQueries({ queryKey: ['medical-services'] })
        },
        onError: (e: Error) => toastService.error(e.message)
    })

    const resetForm = () => {
        setForm({
            code: '',
            nameVi: '',
            description: '',
            category: 'EXAM',
            unitPrice: 0,
            isActive: true
        })
        setEditingService(null)
    }

    const openEdit = (s: MedicalServiceDto) => {
        setEditingService(s)
        setForm({ ...s })
        setIsModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingService) {
            updateMutation.mutate({ id: editingService.id, data: form })
        } else {
            createMutation.mutate(form)
        }
    }

    const filteredServices = services?.filter(s =>
        s.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const categories = [
        { id: 'EXAM', label: 'Khám bệnh', color: 'bg-blue-500' },
        { id: 'LAB', label: 'Xét nghiệm', color: 'bg-purple-500' },
        { id: 'IMAGING', label: 'CĐHA', color: 'bg-amber-500' },
        { id: 'PACKAGE', label: 'Gói khám', color: 'bg-emerald-500' },
    ]

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Danh mục Dịch vụ</h1>
                    <p className="text-slate-500 mt-2 font-medium">Bảng giá dịch vụ, xét nghiệm và các gói khám sức khỏe.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="group flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm tracking-tight hover:bg-[#2b8cee] hover:shadow-2xl hover:shadow-[#2b8cee]/20 transition-all active:scale-95"
                >
                    <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    Thêm Dịch vụ mới
                </button>
            </header>

            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 max-w-xl">
                <Search className="h-5 w-5 text-slate-400 ml-4" />
                <input
                    type="text"
                    placeholder="Tìm theo tên dịch vụ hoặc mã..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold placeholder:text-slate-300"
                />
            </div>

            <section className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Dịch vụ & Mã định danh</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Phân loại</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn giá niêm yết</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-8 h-24 bg-slate-50/10" />
                                    </tr>
                                ))
                            ) : filteredServices?.map((s) => (
                                <tr key={s.id} className="group hover:bg-slate-50/40 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#2b8cee] group-hover:text-white transition-all">
                                                <Stethoscope className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 tracking-tight leading-none mb-2">{s.nameVi}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{s.code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${categories.find(c => c.id === s.category)?.color.replace('bg-', 'text-').replace('-500', '-600')
                                            } ${categories.find(c => c.id === s.category)?.color.replace('bg-', 'bg-').replace('-500', '-50')} border-current`}>
                                            {categories.find(c => c.id === s.category)?.label || s.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="text-xl font-black text-slate-900">{(s.unitPrice || 0).toLocaleString('vi-VN')} đ</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {s.isActive ? (
                                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">● Đang dùng</span>
                                        ) : (
                                            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">○ Tạm dừng</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => openEdit(s)}
                                            className="inline-flex items-center gap-2 bg-white border border-slate-200 p-3 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Service Modal */}
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
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                        {editingService ? 'Cấu hình Dịch vụ' : 'Đăng ký Dịch vụ mới'}
                                    </h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-2xl transition-all">
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phân loại *</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {categories.map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, category: c.id })}
                                                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.category === c.id
                                                            ? 'bg-slate-900 text-white border-slate-900'
                                                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                                                        }`}
                                                >
                                                    {c.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mã định danh (CODE) *</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                required
                                                placeholder="VD: KHAM_TONG_QUAT"
                                                value={form.code}
                                                onChange={e => setForm({ ...form, code: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tên Dịch vụ / Gói khám *</label>
                                        <input
                                            required
                                            placeholder="Gõ tên dịch vụ đầy đủ..."
                                            value={form.nameVi}
                                            onChange={e => setForm({ ...form, nameVi: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Đơn giá niêm yết (VNĐ) *</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2b8cee]" />
                                            <input
                                                required
                                                type="number"
                                                value={form.unitPrice}
                                                onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) })}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-2xl text-[#2b8cee] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Trạng thái áp dụng</label>
                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <input
                                                type="checkbox"
                                                checked={form.isActive}
                                                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                                className="w-6 h-6 rounded-lg text-slate-900 border-slate-300 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
                                            />
                                            <span className="font-bold text-slate-600">Đang hoạt động trong danh mục</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mô tả / Ghi chú</label>
                                        <textarea
                                            placeholder="Nội dung chi tiết dịch vụ..."
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all h-24 resize-none"
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
                                            {(createMutation.isPending || updateMutation.isPending) ? 'Đang cập nhật...' : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Lưu danh mục
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
