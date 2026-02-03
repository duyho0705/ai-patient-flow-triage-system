import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listMedicalServices, createMedicalService, updateMedicalService } from '@/api/masterData'
import { useTenant } from '@/context/TenantContext'
import { toastService } from '@/services/toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Search, X, Loader2, Package, DollarSign, Tag, FileText, ToggleLeft, ToggleRight } from 'lucide-react'
import type { MedicalServiceDto } from '@/types/api'

export function ServiceCatalog() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [showOnlyActive, setShowOnlyActive] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<MedicalServiceDto | null>(null)

    const { data: services, isLoading } = useQuery({
        queryKey: ['medical-services', showOnlyActive],
        queryFn: () => listMedicalServices({ onlyActive: showOnlyActive }, headers),
        enabled: !!headers?.tenantId
    })

    const createMutation = useMutation({
        mutationFn: (data: Partial<MedicalServiceDto>) => createMedicalService(data, headers),
        onSuccess: () => {
            toastService.success('✅ Đã thêm dịch vụ mới!')
            queryClient.invalidateQueries({ queryKey: ['medical-services'] })
            closeModal()
        },
        onError: (err: Error) => toastService.error(err.message)
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<MedicalServiceDto> }) => updateMedicalService(id, data, headers),
        onSuccess: () => {
            toastService.success('✅ Đã cập nhật dịch vụ!')
            queryClient.invalidateQueries({ queryKey: ['medical-services'] })
            closeModal()
        },
        onError: (err: Error) => toastService.error(err.message)
    })

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingService(null)
    }

    const openCreateModal = () => {
        setEditingService(null)
        setIsModalOpen(true)
    }

    const openEditModal = (service: MedicalServiceDto) => {
        setEditingService(service)
        setIsModalOpen(true)
    }

    const filteredServices = services?.filter((s: MedicalServiceDto) =>
        s.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-violet-200">
                            <Package className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Danh mục Dịch vụ</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-1">Quản lý các dịch vụ y tế và bảng giá.</p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-600 hover:shadow-xl hover:shadow-violet-200 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Thêm dịch vụ
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc mã dịch vụ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all"
                    />
                </div>

                <button
                    onClick={() => setShowOnlyActive(!showOnlyActive)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${showOnlyActive
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                >
                    {showOnlyActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    {showOnlyActive ? 'Đang hoạt động' : 'Tất cả'}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã</th>
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên dịch vụ</th>
                                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục</th>
                                <th className="text-right px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn giá</th>
                                <th className="text-center px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                <th className="text-center px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-bold">Không tìm thấy dịch vụ nào.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((s: MedicalServiceDto) => (
                                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-black text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg">
                                                {s.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-slate-900">{s.nameVi}</p>
                                            {s.description && (
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{s.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                                                {s.category || 'Chung'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="font-black text-slate-900">{formatCurrency(s.unitPrice)}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${s.isActive
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {s.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <button
                                                onClick={() => openEditModal(s)}
                                                className="p-2 hover:bg-violet-50 text-slate-400 hover:text-violet-600 rounded-xl transition-all"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <ServiceFormModal
                        service={editingService}
                        onClose={closeModal}
                        onSubmit={(data) => {
                            if (editingService) {
                                updateMutation.mutate({ id: editingService.id, data })
                            } else {
                                createMutation.mutate(data)
                            }
                        }}
                        isPending={createMutation.isPending || updateMutation.isPending}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

interface ServiceFormModalProps {
    service: MedicalServiceDto | null
    onClose: () => void
    onSubmit: (data: Partial<MedicalServiceDto>) => void
    isPending: boolean
}

function ServiceFormModal({ service, onClose, onSubmit, isPending }: ServiceFormModalProps) {
    const [form, setForm] = useState({
        code: service?.code || '',
        nameVi: service?.nameVi || '',
        description: service?.description || '',
        category: service?.category || '',
        unitPrice: service?.unitPrice || 0,
        isActive: service?.isActive ?? true
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(form)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl"
            >
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">
                        {service ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Mã dịch vụ *
                            </label>
                            <input
                                required
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all uppercase"
                                placeholder="VD: KHAM-TQ"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> Đơn giá (VNĐ) *
                            </label>
                            <input
                                required
                                type="number"
                                min={0}
                                value={form.unitPrice}
                                onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Package className="w-3 h-3" /> Tên dịch vụ *
                        </label>
                        <input
                            required
                            value={form.nameVi}
                            onChange={(e) => setForm({ ...form, nameVi: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
                            placeholder="VD: Khám tổng quát"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục</label>
                        <input
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
                            placeholder="VD: Khám bệnh"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Mô tả
                        </label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold focus:bg-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all resize-none"
                            placeholder="Mô tả chi tiết về dịch vụ..."
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="font-bold text-slate-700">Trạng thái hoạt động</span>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, isActive: !form.isActive })}
                            className={`p-1 rounded-full transition-all ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-0'
                                }`} />
                        </button>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-600 transition-all flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : service ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
