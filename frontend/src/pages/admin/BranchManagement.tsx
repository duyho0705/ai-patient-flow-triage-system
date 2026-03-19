import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listBranches, createBranch, updateBranch } from '@/api/tenants'
import { useTenant } from '@/context/TenantContext'
import { toastService } from '@/services/toast'
import {
    Plus, Search, Pencil, Save, X, Phone, MapPin, Loader2,
    CheckCircle2, Lock, ChevronDown,
    Hospital, ShieldCheck, LockKeyholeOpen, LockKeyhole,
    Stethoscope
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TenantBranchDto, CreateBranchRequest } from '@/api-client'
import { createPortal } from 'react-dom'

export function BranchManagement() {
    const { tenantId } = useTenant()
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBranch, setEditingBranch] = useState<TenantBranchDto | null>(null)
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
            phone: '',
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
        <div className="w-full animate-in fade-in duration-700 font-sans space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-end text-left">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Quản lý Phòng khám</h2>
                    <p className="text-neutral-500">Danh sách và thông tin chi tiết các cơ sở y tế trong hệ thống Sống Khỏe.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Thêm phòng khám mới
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center relative">
                        <Hospital className="w-6 h-6 fill-current opacity-20 absolute" />
                        <Hospital className="w-6 h-6 relative" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Tổng phòng khám</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center relative">
                        <CheckCircle2 className="w-6 h-6 fill-current opacity-20 absolute" />
                        <CheckCircle2 className="w-6 h-6 relative" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Đang hoạt động</p>
                        <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center relative">
                        <Lock className="w-6 h-6 fill-current opacity-20 absolute" />
                        <Lock className="w-6 h-6 relative" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Đã tạm khóa</p>
                        <p className="text-2xl font-bold">{stats.locked}</p>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm phòng khám..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-slate-50 border-slate-200 rounded-lg pl-4 pr-10 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none cursor-pointer"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="LOCKED">Đã khóa</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="text-sm text-slate-500">
                        Hiển thị {filteredBranches?.length || 0} của {stats.total} phòng khám
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">Tên Phòng Khám</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">Địa Chỉ</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider">Liên Hệ</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider text-center">Trạng Thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredBranches?.map((b) => (
                                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{b.nameVi}</p>
                                                <p className="text-xs text-slate-500">Mã: {b.code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm text-slate-600 max-w-xs">{b.addressLine}, {b.district}, {b.city}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm">
                                            <p className="text-slate-700 font-medium">{b.phone || '—'}</p>
                                            <p className="text-slate-400 text-xs">contact@{b.code.toLowerCase()}.vn</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {b.isActive !== false ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                                                Hoạt động
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-1.5"></span>
                                                Đã khóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(b)}
                                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title={b.isActive !== false ? "Khóa" : "Mở khóa"}>
                                                {b.isActive !== false ? <LockKeyholeOpen className="w-5 h-5" /> : <LockKeyhole className="w-5 h-5 text-rose-500" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-400">
                        Tổng cộng: <span className="text-slate-900">{filteredBranches?.length || 0}</span> cơ sở
                    </div>
                </div>
            </div>

            {/* Dashboard Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Bản đồ mạng lưới</h3>
                        <button className="text-primary-600 text-sm font-medium hover:underline">Xem toàn bản đồ</button>
                    </div>
                    <div className="h-64 bg-slate-100 rounded-xl overflow-hidden relative">
                        <img
                            alt="Clinic Network Map"
                            className="w-full h-full object-cover grayscale opacity-60"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuABy0KABcWXOYS6DOgTNpI351-iJWuWm3h3Q9HgjXyaJviA1SWaHOghvfqRXSbaIbyrRIfW8PhaqbXlSHyhG0mzHSDuhdbJbTTCM12j-kisMUSlTyXRs0cU_uLMW0hixrqX_Q5549ywLxixXMr3WHt1bflECJ-gT-ruAoA0u6gOo5t6-9EzmCQbmK46qsG70_Vhq79xfPzEx3rzDvwunO4Lo3Us3825lvrCSy17KJ7jrxJ5gNCoqoXKDHGO7o5NnRsIpECoEUpIjlw"
                        />
                        <div className="absolute top-[40%] left-[30%] w-3 h-3 bg-primary-500 rounded-full ring-4 ring-primary-100 animate-pulse"></div>
                        <div className="absolute top-[30%] left-[35%] w-3 h-3 bg-primary-500 rounded-full ring-4 ring-primary-100"></div>
                        <div className="absolute bottom-[25%] left-[50%] w-3 h-3 bg-primary-500 rounded-full ring-4 ring-primary-100"></div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary-600 to-teal-700 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">Mẹo Quản Trị</span>
                            <h3 className="text-2xl font-bold mb-2">Tối ưu quy trình vận hành</h3>
                            <p className="text-primary-50/80 text-sm leading-relaxed">Sử dụng hệ thống báo cáo tự động để theo dõi hiệu suất của từng phòng khám theo thời gian thực. Đảm bảo chất lượng dịch vụ đồng nhất trên toàn hệ thống Sống Khỏe.</p>
                        </div>
                        <button className="mt-8 bg-white text-primary-700 px-6 py-3 rounded-xl font-bold text-sm w-fit shadow-sm hover:bg-primary-50 transition-all">
                            Xem báo cáo chi tiết
                        </button>
                    </div>
                    <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                        <Stethoscope className="w-48 h-48" />
                    </div>
                </div>
            </div>

            {/* Branch Modal */}
            <AnimatePresence>
                {isModalOpen && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-3xl shadow-2xl overflow-hidden z-10 border border-white/10"
                        >
                            <div className="flex items-center justify-between px-10 py-8 border-b border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-900 dark:bg-primary/20 rounded-2xl flex items-center justify-center text-white dark:text-primary shadow-xl">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                            {editingBranch ? 'Cập nhật Chi nhánh' : 'Thiết lập cơ sở mới'}
                                        </h2>
                                        <p className="text-[10px] font-black text-slate-400 mt-1 tracking-widest">Hệ thống Sống Khỏe CDM</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-2xl transition-all shadow-sm">
                                    <X className="h-6 w-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto max-h-[75vh] scrollbar-hide">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 tracking-tight pl-1">Mã định danh (CODE) *</label>
                                        <input
                                            required
                                            disabled={!!editingBranch}
                                            placeholder="VD: CN-01..."
                                            value={form.code}
                                            onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300 disabled:opacity-50 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 tracking-tight pl-1">Tên hiển thị *</label>
                                        <input
                                            required
                                            placeholder="Tên chi nhánh/phòng khám..."
                                            value={form.nameVi}
                                            onChange={e => setForm({ ...form, nameVi: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 tracking-tight pl-1">Địa chỉ chi tiết (Số nhà, Tên đường) *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                required
                                                placeholder="Nhập địa chỉ chi tiết để bệnh nhân dễ tìm..."
                                                value={form.addressLine}
                                                onChange={e => setForm({ ...form, addressLine: e.target.value })}
                                                className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 tracking-tight pl-1">Thành phố / Tỉnh *</label>
                                        <input
                                            required
                                            placeholder="VD: TP. Hồ Chí Minh"
                                            value={form.city}
                                            onChange={e => setForm({ ...form, city: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 tracking-tight pl-1">Số hotline liên hệ</label>
                                        <div className="relative">
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                placeholder="0123 456 789"
                                                value={form.phone}
                                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                                className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-xl text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 pt-4">
                                        <label className="flex items-center gap-6 p-6 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 hover:border-primary/20 transition-all group cursor-pointer">
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={form.isActive}
                                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                                />
                                                <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[24px] after:w-[36px] after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Trạng thái vận hành</p>
                                                <p className="text-xs font-bold text-slate-400 mt-1 tracking-tighter">
                                                    Cơ sở này đang {form.isActive ? 'HOẠT ĐỘNG BÌNH THƯỜNG' : 'TẠM THỜI NGỪNG TRUY CẬP'}
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="flex-1 bg-slate-900 dark:bg-primary text-white dark:text-slate-900 py-6 rounded-[2rem] font-black tracking-widest hover:bg-primary hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-50 group flex items-center justify-center gap-3"
                                    >
                                        {(createMutation.isPending || updateMutation.isPending) ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                Lưu thông tin cơ sở
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>
        </div>
    )
}
