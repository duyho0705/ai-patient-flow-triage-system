import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBranches, createBranch, updateBranch, deleteBranch } from '@/api/tenants'
import { useTenant } from '@/context/TenantContext'
import { toastService } from '@/services/toast'
import {
    Plus, Search, Pencil, Save, X, Phone, MapPin, Loader2,
    CheckCircle2, Lock, ChevronDown, Trash2, Mail,
    Hospital, ShieldCheck, LockKeyholeOpen, LockKeyhole,
    Stethoscope, Building2, MapPinned,
    Building
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TenantBranchDto, CreateBranchRequest } from '@/api-client'
import { createPortal } from 'react-dom'

export function BranchManagement() {
    const { tenantId } = useTenant()
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBranch, setEditingBranch] = useState<TenantBranchDto | null>(null)
    const [deletingBranch, setDeletingBranch] = useState<TenantBranchDto | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [form, setForm] = useState<any>({
        code: '',
        nameVi: '',
        addressLine: '',
        city: '',
        district: '',
        ward: '',
        phone: '',
        email: '',
        isActive: true
    })

    const { data: branches, isLoading } = useQuery({
        queryKey: ['branches', tenantId],
        queryFn: () => listBranches(tenantId!),
        enabled: !!tenantId,
    })

    const createMutation = useMutation({
        mutationFn: (data: CreateBranchRequest) => createBranch(data),
        onSuccess: () => {
            toastService.success('✨ Tạo chi nhánh mới thành công!')
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

    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteBranch(id),
        onSuccess: () => {
            toastService.success('🗑️ Đã xóa chi nhánh thành công')
            setDeletingBranch(null)
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
            phone: '',
            email: '',
            isActive: true
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
            phone: b.phone,
            email: b.email,
            isActive: b.isActive !== false
        })
        setIsModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingBranch) {
            updateMutation.mutate({ id: editingBranch.id || '', data: form })
        } else {
            createMutation.mutate({ ...form, tenantId: tenantId! } as CreateBranchRequest)
        }
    }

    const filteredBranches = branches?.filter(b => {
        const matchesSearch = b.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && b.isActive !== false) ||
            (statusFilter === 'LOCKED' && b.isActive === false);
        return matchesSearch && matchesStatus;
    })

    const stats = {
        total: branches?.length || 0,
        active: branches?.filter(b => b.isActive !== false).length || 0,
        locked: branches?.filter(b => b.isActive === false).length || 0
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10 pb-20 bg-md-background">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">Quản lý Phòng khám</h2>
                    <p className="text-md-on-surface-variant font-medium opacity-70">
                        Danh sách và chi tiết mạng lưới cơ sở y tế Sống Khỏe.
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-8 py-3.5 bg-md-primary text-white rounded-full font-bold text-sm shadow-elevation-2 hover:shadow-elevation-4 transition-all active:scale-95 group"
                >
                    <Plus className="size-5 group-hover:rotate-90 transition-transform" />
                    <span>Thêm phòng khám mới</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BranchStatCard 
                    label="Tổng phòng khám" 
                    value={stats.total} 
                    icon={Hospital} 
                    color="primary" 
                />
                <BranchStatCard 
                    label="Đang hoạt động" 
                    value={stats.active} 
                    icon={CheckCircle2} 
                    color="primary" 
                    isSecondary
                />
                <BranchStatCard 
                    label="Đã tạm khóa" 
                    value={stats.locked} 
                    icon={Lock} 
                    color="error" 
                />
            </div>

            {/* Filter & Table Area */}
            <div className="bg-md-surface-container rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-4 border border-md-outline/5">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-md-on-surface-variant opacity-40 group-focus-within:opacity-100 group-focus-within:text-md-primary transition-all" size={20} />
                    <input 
                        type="text"
                        placeholder="Tìm kiếm theo tên phòng khám hoặc mã..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 bg-md-surface-container-low border border-md-outline/10 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-md-primary/10 focus:border-md-primary outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-14 px-6 bg-md-surface-container-low border border-md-outline/10 rounded-2xl text-sm font-bold text-md-on-surface outline-none focus:ring-4 focus:ring-md-primary/10 transition-all appearance-none cursor-pointer pr-12 min-w-[200px]"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="LOCKED">Đã khóa</option>
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-md-surface-container-lowest rounded-[2.5rem] border border-md-outline/10 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="size-12 animate-spin text-md-primary" />
                        <p className="font-bold text-md-on-surface-variant animate-pulse italic opacity-60">Đang tải danh sách mạng lưới...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-md-surface-container-low/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Phòng khám</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Địa chỉ</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Liên hệ</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60 text-center">Trạng thái</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-md-outline/5 font-sans">
                                {filteredBranches?.map((b, idx) => (
                                    <motion.tr 
                                        key={b.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-md-surface-container-low/30 transition-colors group cursor-default"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-md-primary/10 flex items-center justify-center border border-md-primary/10 overflow-hidden group-hover:scale-105 transition-transform">
                                                    <Building2 className="text-md-primary" size={24} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-md-on-surface group-hover:text-md-primary transition-colors">
                                                        {b.nameVi}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-md-on-surface-variant uppercase tracking-tighter opacity-40 italic">Mã: {b.code}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 max-w-xs">
                                            <p className="text-xs font-medium text-md-on-surface-variant leading-relaxed">
                                                {[b.addressLine, b.district, b.city].filter(v => v && v.trim() !== '' && v !== 'null').join(', ')}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs space-y-0.5">
                                                <p className="text-md-on-surface font-bold">{b.phone || '—'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${b.isActive !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                <div className={`size-1.5 rounded-full ${b.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                {b.isActive !== false ? 'Hoạt động' : 'Tạm khóa'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEdit(b)}
                                                    className="p-3 text-md-on-surface-variant hover:text-md-primary hover:bg-md-primary/10 rounded-2xl transition-all active:scale-90"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => updateMutation.mutate({ id: b.id || '', data: { ...b, isActive: b.isActive === false } })}
                                                    className="p-3 text-md-on-surface-variant hover:text-amber-500 hover:bg-amber-500/10 rounded-2xl transition-all active:scale-90"
                                                >
                                                    {b.isActive !== false ? <LockKeyholeOpen size={18} /> : <LockKeyhole size={18} className="text-amber-500" />}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setDeletingBranch(b)
                                                    }}
                                                    className="p-3 text-md-on-surface-variant hover:text-md-error hover:bg-md-error/10 rounded-2xl transition-all active:scale-90"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Dashboard Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                <div className="bg-md-surface-container-lowest p-8 rounded-[2.5rem] border border-md-outline/10 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-md-primary/10 text-md-primary rounded-xl">
                                <MapPinned size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-md-on-surface">Mạng lưới Vận hành</h3>
                        </div>
                        <button className="text-xs font-black text-md-primary hover:underline uppercase tracking-tight">Toàn màn hình</button>
                    </div>
                    <div className="h-64 bg-md-surface-container-low rounded-[2rem] overflow-hidden relative border border-md-outline/5">
                        <img
                            alt="Map visualization"
                            className="w-full h-full object-cover opacity-20 grayscale brightness-75"
                            src="https://api.dicebear.com/7.x/shapes/svg?seed=map&backgroundColor=f1f5f9"
                        />
                        <div className="absolute top-[40%] left-[30%] size-4 bg-md-primary rounded-full ring-8 ring-md-primary/10 animate-pulse shadow-lg" />
                        <div className="absolute top-[30%] left-[55%] size-4 bg-md-primary rounded-full ring-8 ring-md-primary/10 animate-pulse shadow-lg delay-75" />
                        <div className="absolute bottom-[25%] left-[45%] size-4 bg-md-primary rounded-full ring-8 ring-md-primary/10 animate-pulse shadow-lg delay-150" />
                    </div>
                </div>

                <div className="bg-md-on-surface text-white p-10 rounded-[3rem] shadow-elevation-3 flex flex-col justify-between relative overflow-hidden group">
                     <div className="absolute -top-10 -right-10 size-48 bg-md-primary/20 blur-3xl group-hover:scale-150 transition-transform duration-1000 rounded-full" />
                     <div className="relative z-10 space-y-6">
                        <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-sm group-hover:rotate-12 transition-transform">
                            <Building size={28} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold tracking-tight">Kinh nghiệm Quản trị</h3>
                            <p className="text-white/60 text-sm font-medium leading-relaxed max-w-sm">
                                Sử dụng hệ thống báo cáo tự động để theo dõi hiệu suất của từng phòng khám theo thời gian thực. Đảm bảo chất lượng dịch vụ đồng nhất trên toàn hệ thống.
                            </p>
                        </div>
                    </div>
                    <button className="mt-10 relative z-10 py-5 px-10 bg-white text-md-on-surface rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-md-primary hover:text-white transition-all shadow-xl active:scale-95">
                        Khám phá Báo cáo Chuyên sâu
                    </button>
                </div>
            </div>

            {/* Modal */}
            {createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-md-on-surface/40 backdrop-blur-sm"
                            />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl shadow-elevation-5 h-auto max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-md-outline/5 flex items-center justify-between bg-white/80 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-md-primary/10 text-md-primary flex items-center justify-center">
                                        {editingBranch ? <Pencil size={24} /> : <Plus size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-md-on-surface tracking-tight">
                                            {editingBranch ? 'Cập nhật Chi nhánh' : 'Thiết lập cơ sở mới'}
                                        </h3>
                                        <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-60 italic">Hệ thống Sống Khỏe CMD</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-md-surface-container border border-md-outline/10 text-md-on-surface-variant hover:text-md-primary rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <form id="branch-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 CustomScrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     <MD3Input label="Mã định danh (CODE) *" icon={Hospital} required value={form.code} onChange={(v: string) => setForm({...form, code: v.toUpperCase()})} placeholder="VD: CN-01..." disabled={!!editingBranch} />
                                     <MD3Input label="Tên hiển thị chi nhánh *" icon={Building2} required value={form.nameVi} onChange={(v: string) => setForm({...form, nameVi: v})} placeholder="Phòng khám Sống Khỏe A..." />
                                     <div className="md:col-span-2">
                                        <MD3Input label="Địa chỉ chi tiết *" icon={MapPin} value={form.addressLine} onChange={(v: string) => setForm({...form, addressLine: v})} placeholder="Số nhà, Tên đường..." />
                                     </div>
                                     <MD3Input label="Thành phố / Tỉnh" icon={MapPinned} value={form.city} onChange={(v: string) => setForm({...form, city: v})} placeholder="TP. Hồ Chí Minh..." />
                                     <MD3Input label="Số hotline liên hệ" icon={Phone} value={form.phone} onChange={(v: string) => setForm({...form, phone: v})} placeholder="0123 456 789..." />
                                     <MD3Input label="Địa chỉ Email" icon={Mail} value={form.email} onChange={(v: string) => setForm({...form, email: v})} placeholder="contact@cdm.vn..." />
                                </div>

                                <div className="pt-6 border-t border-md-outline/5">
                                    <label className="flex items-center gap-5 p-6 rounded-[2.5rem] bg-md-surface-container-low border border-md-outline/5 hover:border-md-primary/20 transition-all cursor-pointer">
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
                                            <div className="w-14 h-8 bg-md-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-md-primary shadow-sm" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-md-on-surface">Trạng thái vận hành</p>
                                            <p className="text-[10px] text-md-on-surface-variant font-medium opacity-60">
                                                 {form.isActive ? 'Cho phép truy cập và hoạt động công khai' : 'Tạm thời đóng cửa trên hệ thống'}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </form>

                            <div className="p-8 border-t border-md-outline/5 bg-white/50 backdrop-blur-md">
                                <button
                                    form="branch-form"
                                    type="submit" 
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="w-full h-16 bg-md-primary text-white rounded-[1.5rem] font-bold tracking-tight shadow-elevation-2 hover:shadow-elevation-4 hover:shadow-md-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    Xác nhận và Lưu thông tin
                                </button>
                            </div>
                        </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Delete Confirmation Modal */}
            {createPortal(
                <AnimatePresence>
                    {deletingBranch && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setDeletingBranch(null)}
                                className="absolute inset-0 bg-md-on-surface/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-sm shadow-elevation-5 overflow-hidden flex flex-col p-8 items-center text-center"
                            >
                                <div className="size-20 bg-md-error/10 text-md-error rounded-full flex items-center justify-center mb-6">
                                    <Trash2 size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-md-on-surface mb-2">Xóa nhánh phòng khám?</h3>
                                <p className="text-sm font-medium text-md-on-surface-variant mb-8 px-4 opacity-80 leading-relaxed">
                                    Bạn có chắc chắn muốn xóa phòng khám <span className="font-bold text-md-error">{deletingBranch.nameVi}</span> không? Hành động này sẽ thay đổi trạng thái hệ thống và có thể ảnh hưởng đến kết quả dữ liệu hiện tại.
                                </p>
                                
                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={() => setDeletingBranch(null)}
                                        className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors active:scale-95"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        onClick={() => {
                                            removeMutation.mutate(deletingBranch.id || '')
                                        }}
                                        disabled={removeMutation.isPending}
                                        className="flex-1 h-14 bg-red-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {removeMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                        Xác nhận Xóa
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

function BranchStatCard({ label, value, icon: Icon, color, isSecondary }: any) {
    const styles: any = {
        primary: 'bg-md-primary/10 text-md-primary border-md-primary/10',
        error: 'bg-md-error/10 text-md-error border-md-error/10'
    }
    return (
        <div className="bg-md-surface-container-lowest p-6 rounded-[2.5rem] border border-md-outline/10 shadow-sm flex items-center gap-6 group hover:shadow-elevation-2 transition-all">
            <div className={`size-16 rounded-[1.25rem] flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform ${isSecondary ? 'bg-md-secondary-container text-md-on-secondary-container border-md-secondary/10' : styles[color]}`}>
                <Icon size={32} strokeWidth={1.5} />
            </div>
            <div>
                 <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-40 italic">{label}</p>
                 <h4 className="text-3xl font-black text-md-on-surface tracking-tighter mt-1">{value}</h4>
            </div>
        </div>
    )
}

function MD3Input({ label, icon: Icon, value, onChange, placeholder, disabled, required }: any) {
    return (
        <div className="space-y-2 group">
             <label className="text-xs font-bold text-md-on-surface-variant ml-2 block group-focus-within:text-md-primary transition-colors">
                {label}
            </label>
            <div className="relative">
                {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-md-on-surface-variant opacity-40 group-focus-within:opacity-100 group-focus-within:text-md-primary transition-all" size={18} />}
                <input 
                    type="text" 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`w-full h-14 ${Icon ? 'pl-14' : 'px-6'} pr-6 bg-md-surface-container-low border border-md-outline/10 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-md-primary/10 focus:border-md-primary outline-none transition-all placeholder:font-normal placeholder:opacity-40 text-slate-900 disabled:opacity-50`}
                />
            </div>
        </div>
    )
}
