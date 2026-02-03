import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listMedicalServices, createMedicalService, updateMedicalService } from '@/api/masterData'
import { getPharmacyProducts, createPharmacyProduct, updatePharmacyProduct } from '@/api/pharmacy'
import { useTenant } from '@/context/TenantContext'
import { toastService } from '@/services/toast'
import {
    Activity, Pill, Plus, Search, Pencil, X,
    Stethoscope, Beaker, Scissors, Tag,
    Settings2, DollarSign, Info, Package
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MedicalServiceDto, PharmacyProductDto } from '@/types/api'

type Tab = 'SERVICES' | 'PHARMACY'

export const SERVICE_CATEGORIES = [
    { id: 'EXAM', label: 'Khám bệnh', color: 'bg-blue-500', icon: Stethoscope },
    { id: 'LAB', label: 'Xét nghiệm', color: 'bg-purple-500', icon: Beaker },
    { id: 'IMAGING', label: 'CĐHA', color: 'bg-amber-500', icon: Activity },
    { id: 'PACKAGE', label: 'Gói khám', color: 'bg-emerald-500', icon: Package },
    { id: 'PROCEDURE', label: 'Thủ thuật', color: 'bg-rose-500', icon: Scissors },
    { id: 'OTHERS', label: 'Khác', color: 'bg-slate-500', icon: Tag },
]

export function MasterData() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<Tab>('SERVICES')
    const [searchQuery, setSearchQuery] = useState('')

    // Modals
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<MedicalServiceDto | null>(null)
    const [editingProduct, setEditingProduct] = useState<PharmacyProductDto | null>(null)

    // Data Fetching
    const { data: services, isLoading: isLoadingServices } = useQuery({
        queryKey: ['admin-medical-services'],
        queryFn: () => listMedicalServices({ onlyActive: false }, headers),
        enabled: !!headers?.tenantId
    })

    const { data: products, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['admin-pharmacy-products'],
        queryFn: () => getPharmacyProducts(headers),
        enabled: !!headers?.tenantId
    })

    // Mutations
    const serviceMutation = useMutation({
        mutationFn: (data: Partial<MedicalServiceDto>) =>
            editingService ? updateMedicalService(editingService.id, data, headers) : createMedicalService(data, headers),
        onSuccess: () => {
            toastService.success(editingService ? '✨ Cập nhật dịch vụ thành công' : '✅ Đã thêm dịch vụ mới')
            setIsServiceModalOpen(false)
            setEditingService(null)
            queryClient.invalidateQueries({ queryKey: ['admin-medical-services'] })
        },
        onError: (e: Error) => toastService.error(e.message)
    })

    const productMutation = useMutation({
        mutationFn: (data: Partial<PharmacyProductDto>) =>
            editingProduct ? updatePharmacyProduct(editingProduct.id!, data, headers) : createPharmacyProduct(data, headers),
        onSuccess: () => {
            toastService.success(editingProduct ? '✨ Cập nhật thuốc thành công' : '✅ Đã thêm thuốc mới')
            setIsProductModalOpen(false)
            setEditingProduct(null)
            queryClient.invalidateQueries({ queryKey: ['admin-pharmacy-products'] })
        },
        onError: (e: Error) => toastService.error(e.message)
    })

    const filteredServices = services?.filter(s =>
        s.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const filteredProducts = products?.filter(p =>
        p.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.genericName?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <Settings2 className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Quản lý Danh mục</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-1">Thiết lập đơn giá dịch vụ và danh mục thuốc toàn hệ thống.</p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] gap-1 shadow-inner">
                    <button
                        onClick={() => setActiveTab('SERVICES')}
                        className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'SERVICES' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Dịch vụ Y tế
                    </button>
                    <button
                        onClick={() => setActiveTab('PHARMACY')}
                        className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'PHARMACY' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Danh mục Thuốc
                    </button>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={activeTab === 'SERVICES' ? "Tìm mã dịch vụ, tên, nhóm..." : "Tìm tên thuốc, biệt dược, mã..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-100 pl-14 pr-6 py-4 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 shadow-sm transition-all outline-none placeholder:text-slate-200"
                    />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={() => {
                            if (activeTab === 'SERVICES') { setEditingService(null); setIsServiceModalOpen(true); }
                            else { setEditingProduct(null); setIsProductModalOpen(true); }
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#2b8cee] hover:shadow-2xl hover:shadow-[#2b8cee]/20 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        {activeTab === 'SERVICES' ? 'Thêm dịch vụ' : 'Khai báo thuốc'}
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="grid grid-cols-1 gap-4">
                {activeTab === 'SERVICES' ? (
                    isLoadingServices ? (
                        Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-50" />)
                    ) : (
                        <div className="space-y-4">
                            {filteredServices?.map((s) => {
                                const category = SERVICE_CATEGORIES.find(c => c.id === s.category) || SERVICE_CATEGORIES[SERVICE_CATEGORIES.length - 1];
                                const CategoryIcon = category.icon;
                                return (
                                    <motion.div
                                        layout
                                        key={s.id}
                                        className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${category.color.replace('bg-', 'bg-').replace('500', '50')} ${category.color.replace('bg-', 'text-').replace('500', '600')}`}>
                                                <CategoryIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{s.code}</span>
                                                    {!s.isActive && (
                                                        <span className="text-[9px] font-black text-red-400 bg-red-50 px-2 py-0.5 rounded-full uppercase">Ngừng hoạt động</span>
                                                    )}
                                                </div>
                                                <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2 group-hover:text-blue-600 transition-colors uppercase">{s.nameVi}</h4>
                                                <p className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-tighter">
                                                    <Tag className="w-3 h-3" />
                                                    Nhóm: {category.label} {s.description && ` · ${s.description}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-10">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Giá chuẩn</p>
                                                <p className="text-2xl font-black text-slate-900">{s.unitPrice.toLocaleString('vi-VN')} <span className="text-sm text-slate-400">đ</span></p>
                                            </div>
                                            <button
                                                onClick={() => { setEditingService(s); setIsServiceModalOpen(true); }}
                                                className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    isLoadingProducts ? (
                        Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-50" />)
                    ) : (
                        <div className="space-y-4">
                            {filteredProducts?.map((p) => (
                                <motion.div
                                    layout
                                    key={p.id}
                                    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <Pill className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{p.code}</span>
                                                <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{p.unit}</span>
                                                {!p.active && (
                                                    <span className="text-[9px] font-black text-red-400 bg-red-50 px-2 py-0.5 rounded-full uppercase">Hết cung cấp</span>
                                                )}
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2 group-hover:text-blue-600 transition-colors uppercase">{p.nameVi}</h4>
                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-tighter italic">
                                                ({p.genericName})
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Giá bán lẻ</p>
                                            <p className="text-2xl font-black text-[#2b8cee]">{p.standardPrice.toLocaleString('vi-VN')} <span className="text-sm text-slate-400">đ</span></p>
                                        </div>
                                        <button
                                            onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                                            className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Service edit modal */}
            <AnimatePresence>
                {isServiceModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsServiceModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-[#f8fafc] rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between px-10 py-8 bg-white border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingService ? 'Chỉnh sửa Dịch vụ' : 'Thêm Dịch vụ mới'}</h2>
                                </div>
                                <button onClick={() => setIsServiceModalOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="overflow-y-auto">
                                <ServiceForm
                                    initialData={editingService}
                                    isPending={serviceMutation.isPending}
                                    onSubmit={(data) => serviceMutation.mutate(data)}
                                    onCancel={() => setIsServiceModalOpen(false)}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Product edit modal */}
            <AnimatePresence>
                {isProductModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsProductModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-[#f8fafc] rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between px-10 py-8 bg-white border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                        <Pill className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingProduct ? 'Cập nhật Thuốc' : 'Khai báo Thuốc mới'}</h2>
                                </div>
                                <button onClick={() => setIsProductModalOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="overflow-y-auto">
                                <ProductForm
                                    initialData={editingProduct}
                                    isPending={productMutation.isPending}
                                    onSubmit={(data) => productMutation.mutate(data)}
                                    onCancel={() => setIsProductModalOpen(false)}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function ServiceForm({ initialData, onSubmit, onCancel, isPending }: {
    initialData: MedicalServiceDto | null,
    onSubmit: (data: Partial<MedicalServiceDto>) => void,
    onCancel: () => void,
    isPending: boolean
}) {
    const [form, setForm] = useState<Partial<MedicalServiceDto>>(initialData || {
        code: '',
        nameVi: '',
        description: '',
        category: 'EXAM',
        unitPrice: 0,
        isActive: true
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phân loại *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {SERVICE_CATEGORIES.map(c => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setForm({ ...form, category: c.id })}
                                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.category === c.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
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
                            placeholder="VD: KHAM_THUONG..."
                            value={form.code}
                            onChange={e => setForm({ ...form, code: e.target.value })}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-[#2b8cee]" />
                        Đơn giá chuẩn (VNĐ) *
                    </label>
                    <input
                        type="number"
                        required
                        value={form.unitPrice}
                        onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) })}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-2xl text-[#2b8cee] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tên dịch vụ hiển thị *</label>
                    <input
                        required
                        placeholder="Tên dịch vụ y tế..."
                        value={form.nameVi}
                        onChange={e => setForm({ ...form, nameVi: e.target.value })}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mô tả / Ghi chú</label>
                    <textarea
                        rows={3}
                        placeholder="Mô tả nội dung thực hiện (nếu có)..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                    />
                </div>

                {initialData && (
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Trạng thái hoạt động</label>
                        <div
                            onClick={() => setForm({ ...form, isActive: !form.isActive })}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${form.isActive ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <p className={`font-black uppercase tracking-widest text-[10px] ${form.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {form.isActive ? 'Đang hoạt động' : 'Tạm ngừng cung cấp'}
                                </p>
                                <p className="text-xs font-bold text-slate-500">Người dùng sẽ {form.isActive ? 'lựa chọn được' : 'không thấy'} dịch vụ này.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-50">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black tracking-tight hover:bg-[#2b8cee] shadow-xl hover:shadow-[#2b8cee]/20 transition-all disabled:opacity-50"
                >
                    {isPending ? 'Đang lưu...' : 'Lưu Danh mục'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-10 py-5 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                    Hủy
                </button>
            </div>
        </form>
    )
}

function ProductForm({ initialData, onSubmit, onCancel, isPending }: {
    initialData: PharmacyProductDto | null,
    onSubmit: (data: Partial<PharmacyProductDto>) => void,
    onCancel: () => void,
    isPending: boolean
}) {
    const [form, setForm] = useState<Partial<PharmacyProductDto>>(initialData || {
        code: '',
        nameVi: '',
        genericName: '',
        unit: 'Viên',
        standardPrice: 0,
        active: true
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mã SKU (CODE) *</label>
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            required
                            placeholder="Mã vạch / Mã hệ thống..."
                            value={form.code}
                            onChange={e => setForm({ ...form, code: e.target.value })}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Đơn vị tính</label>
                    <select
                        value={form.unit}
                        onChange={e => setForm({ ...form, unit: e.target.value })}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    >
                        {['Viên', 'Vỉ', 'Chai', 'Ống', 'Hộp', 'Túi', 'Gói'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tên thuốc (Biệt dược) *</label>
                    <input
                        required
                        placeholder="VD: Panadol Extra..."
                        value={form.nameVi}
                        onChange={e => setForm({ ...form, nameVi: e.target.value })}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all uppercase placeholder:normal-case"
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 italic">Hoạt chất (Generic Name)</label>
                    <input
                        placeholder="VD: Paracetamol 500mg..."
                        value={form.genericName}
                        onChange={e => setForm({ ...form, genericName: e.target.value })}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all italic"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-[#2b8cee]" />
                        Giá bán lẻ tiêu chuẩn
                    </label>
                    <input
                        type="number"
                        required
                        value={form.standardPrice}
                        onChange={e => setForm({ ...form, standardPrice: Number(e.target.value) })}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-2xl text-[#2b8cee] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                {initialData && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tình trạng kinh doanh</label>
                        <div
                            onClick={() => setForm({ ...form, active: !form.active })}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${form.active ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.active ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                                <Pill className="w-5 h-5" />
                            </div>
                            <div>
                                <p className={`font-black uppercase tracking-widest text-[10px] ${form.active ? 'text-blue-600' : 'text-red-600'}`}>
                                    {form.active ? 'Đang kinh doanh' : 'Ngừng cấp phát'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-50">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black tracking-tight hover:bg-[#2b8cee] shadow-xl hover:shadow-[#2b8cee]/20 transition-all disabled:opacity-50"
                >
                    {isPending ? 'Đang lưu...' : 'Lưu Danh mục'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-10 py-5 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                    Hủy
                </button>
            </div>
        </form>
    )
}
