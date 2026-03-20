import {
    createUser,
    deleteUser,
    getAdminUsers,
    getRoles,
    setPassword,
    updateUser,
} from '@/api/admin'
import { listBranches, listTenants } from '@/api/tenants'
import { CustomSelect } from '@/components/CustomSelect'
import { toastService } from '@/services/toast'
import type {
    AdminUserDto,
    CreateUserRequest,
    UpdateUserRequest,
} from '@/types/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    KeyRound, Loader2, Pencil, Plus, 
    Save, Shield, UserPlus, X, Search, 
    ChevronLeft, ChevronRight, Trash2,
    AtSign, User, Phone, Check, ShieldCheck, AlertTriangle
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'

const PAGE_SIZE = 10

export function UserManagement() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(0)
    const [tenantFilter, setTenantFilter] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
    const [editUser, setEditUser] = useState<AdminUserDto | null>(null)
    const [passwordUser, setPasswordUser] = useState<AdminUserDto | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<AdminUserDto | null>(null)

    const { data: tenants = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: listTenants,
    })

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', tenantFilter || null, page],
        queryFn: () =>
            getAdminUsers({
                tenantId: tenantFilter || undefined,
                page,
                size: PAGE_SIZE,
            }),
    })

    // Client-side search filter (no API call per keystroke)
    const filteredUsers = useMemo(() => {
        if (!data?.content) return []
        if (!searchQuery.trim()) return data.content
        const q = searchQuery.trim().toLowerCase()
        return data.content.filter(u => 
            u.fullNameVi?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        )
    }, [data?.content, searchQuery])

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">Quản lý Tài khoản</h2>
                    <p className="text-md-on-surface-variant font-medium opacity-70">Điều chỉnh quyền hạn và thông tin người dùng toàn hệ thống.</p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-8 py-3 bg-md-primary text-white rounded-full font-bold text-sm shadow-elevation-2 hover:shadow-elevation-3 transition-all active:scale-95 group"
                >
                    <UserPlus className="size-5 group-hover:rotate-12 transition-transform" />
                    <span>Tạo tài khoản mới</span>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-md-surface-container rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-4 border border-md-outline/5">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-md-on-surface-variant opacity-40 group-focus-within:opacity-100 group-focus-within:text-md-primary transition-all" size={20} />
                    <input 
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 bg-md-surface-container-low border border-md-outline/10 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-md-primary/10 focus:border-md-primary outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <CustomSelect
                            options={[{ id: '', name: 'Tất cả cơ sở' }, ...tenants.map(t => ({ id: t.id, name: t.nameVi }))]}
                            value={tenantFilter}
                            onChange={(val) => {
                                setTenantFilter(val)
                                setPage(0)
                            }}
                            labelKey="name"
                            valueKey="id"
                            placeholder="Lọc theo cơ sở..."
                            className="w-full h-14 bg-md-surface-container-low border border-md-outline/10 rounded-2xl font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="bg-md-surface-container-lowest rounded-[2.5rem] border border-md-outline/10 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="size-12 animate-spin text-md-primary" />
                        <p className="font-bold text-md-on-surface-variant animate-pulse lowercase tracking-tighter italic opacity-60">Đang đồng bộ dữ liệu người dùng...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-md-surface-container-low/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Người dùng</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Trạng thái</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Phân quyền đặc tính</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-md-outline/5">
                                    {filteredUsers.map((u, idx) => (
                                        <motion.tr 
                                            key={u.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-md-surface-container-low/30 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="size-12 rounded-full bg-md-primary/10 flex items-center justify-center border border-md-primary/10 overflow-hidden group-hover:scale-105 transition-transform">
                                                            <img 
                                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                                                                alt="avatar" 
                                                                className="w-full h-full object-cover"
                                                              />
                                                        </div>
                                                        <div className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-white ${u.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-md-on-surface group-hover:text-md-primary transition-colors underline decoration-transparent decoration-2 underline-offset-4 group-hover:decoration-md-primary/30">
                                                            {u.fullNameVi}
                                                        </span>
                                                        <span className="text-[11px] text-md-on-surface-variant font-medium opacity-60 flex items-center gap-1.5">
                                                            <AtSign size={10} />
                                                            {u.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                    <div className={`size-1.5 rounded-full ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                    {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-wrap gap-2 max-w-sm">
                                                    {(u.roleAssignments || []).map((ra, rai) => (
                                                        <div key={rai} className="flex items-center gap-1.5 bg-md-primary-container/30 border border-md-primary/5 px-2.5 py-1 rounded-lg group/role hover:bg-md-primary-container transition-all cursor-default">
                                                            <Shield size={10} className="text-md-primary/60" />
                                                            <span className="text-[10px] font-black text-md-on-primary-container uppercase tracking-tighter italic">
                                                                {ra.roleCode}
                                                            </span>
                                                            <span className="text-[9px] text-md-on-surface-variant font-bold opacity-40 px-1 border-l border-md-outline/20">
                                                                {ra.tenantName || 'Hệ thống'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {!(u.roleAssignments?.length) && <span className="text-xs text-md-outline italic opacity-60">Chưa gán vai trò</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                      onClick={() => setEditUser(u)}
                                                      className="p-3 text-md-on-surface-variant hover:text-md-primary hover:bg-md-primary/10 rounded-2xl transition-all active:scale-90"
                                                      title="Chỉnh sửa thông tin"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button 
                                                      onClick={() => setPasswordUser(u)}
                                                      className="p-3 text-md-on-surface-variant hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all active:scale-90"
                                                      title="Đặt lại mật khẩu"
                                                    >
                                                        <KeyRound size={18} />
                                                    </button>
                                                    <button 
                                                      onClick={() => setDeleteTarget(u)}
                                                      className="p-3 text-md-on-surface-variant hover:text-md-error hover:bg-md-error/10 rounded-2xl transition-all active:scale-90"
                                                      title="Xóa tài khoản"
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

                        {/* Pagination Area */}
                        {data && data.totalPages > 1 && (
                            <div className="px-8 py-6 bg-md-surface-container-low/50 flex items-center justify-between border-t border-md-outline/5 mt-auto">
                                <div className="flex items-center gap-2">
                                    <span className="size-8 rounded-lg bg-md-primary/10 text-md-primary flex items-center justify-center font-black text-xs">
                                        {data.page + 1}
                                    </span>
                                    <span className="text-[11px] font-bold text-md-on-surface-variant">/ {data.totalPages} trang</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        disabled={data.first}
                                        onClick={() => setPage(p => p - 1)}
                                        className="h-10 px-4 bg-white border border-md-outline/10 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-md-primary/5 active:scale-95 disabled:opacity-30 transition-all font-sans"
                                    >
                                        <ChevronLeft size={16} />
                                        Trước
                                    </button>
                                    <button 
                                        disabled={data.last}
                                        onClick={() => setPage(p => p + 1)}
                                        className="h-10 px-4 bg-white border border-md-outline/10 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-md-primary/5 active:scale-95 disabled:opacity-30 transition-all font-sans"
                                    >
                                        Sau
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals with AnimatePresence */}
            <AnimatePresence>
                {createOpen && (
                    <CreateUserModal 
                        onClose={() => setCreateOpen(false)} 
                        onSuccess={() => {
                            setCreateOpen(false)
                            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
                        }}
                    />
                )}
                {editUser && (
                    <EditUserModal 
                        user={editUser}
                        onClose={() => setEditUser(null)}
                        onSuccess={() => {
                            setEditUser(null)
                            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
                        }}
                    />
                )}
                {passwordUser && (
                    <ResetPasswordModal 
                        user={passwordUser}
                        onClose={() => setPasswordUser(null)}
                        onSuccess={() => setPasswordUser(null)}
                    />
                )}
                {deleteTarget && (
                    <DeleteUserModal 
                        user={deleteTarget}
                        onClose={() => setDeleteTarget(null)}
                        onSuccess={() => {
                            setDeleteTarget(null)
                            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

/* --- MD3 Modal Components --- */

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [form, setForm] = useState<CreateUserRequest>({
        email: '',
        fullNameVi: '',
        password: '',
        phone: '',
        tenantId: '',
        roleCode: '',
        branchId: '',
    })

    const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: listTenants })
    const { data: roles = [] } = useQuery({ queryKey: ['admin-roles'], queryFn: getRoles })

    const mutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            toastService.success('✨ Tạo tài khoản mới thành công!')
            onSuccess()
        },
        onError: (err: any) => toastService.error(err.message || 'Lỗi khi tạo tài khoản')
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate({
            ...form,
            branchId: form.branchId || null
        })
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-md-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl shadow-elevation-5 h-[auto] max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-8 pb-4 border-b border-md-outline/5 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-md-primary/10 text-md-primary flex items-center justify-center">
                            <UserPlus size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-md-on-surface tracking-tight">Tạo tài khoản mới</h3>
                            <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-60">Hệ thống cấp quyền truy cập</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-md-surface-container border border-md-outline/10 text-md-on-surface-variant hover:bg-md-primary/10 hover:text-md-primary rounded-2xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 CustomScrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MD3Input label="Họ và tên" icon={User} required value={form.fullNameVi} onChange={(v: string) => setForm({...form, fullNameVi: v})} placeholder="Nhập tên tiếng Việt..." />
                        <MD3Input label="Địa chỉ Email" icon={AtSign} required type="email" value={form.email} onChange={(v: string) => setForm({...form, email: v})} placeholder="name@example.com" />
                        <MD3Input label="Mật khẩu" icon={KeyRound} required type="password" value={form.password} onChange={(v: string) => setForm({...form, password: v})} />
                        <MD3Input label="Số điện thoại" icon={Phone} value={form.phone || ''} onChange={(v: string) => setForm({...form, phone: v})} />
                    </div>

                    <div className="pt-6 border-t border-md-outline/5 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={16} className="text-md-primary" />
                            <h4 className="text-sm font-black text-md-on-surface-variant tracking-widest uppercase">Cấu hình phân quyền</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-md-on-surface-variant ml-2">Cơ sở (Tenant)</label>
                                <CustomSelect 
                                    options={tenants.map(t => ({ id: t.id, name: t.nameVi }))}
                                    value={form.tenantId}
                                    onChange={v => setForm({...form, tenantId: v, branchId: ''})}
                                    labelKey="name" valueKey="id" placeholder="Chọn cơ sở chính..."
                                    className="h-14 bg-md-surface-container border border-md-outline/10 rounded-2xl font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-md-on-surface-variant ml-2">Vai trò (Role)</label>
                                <CustomSelect 
                                    options={roles.map(r => ({ id: r.code, name: r.nameVi }))}
                                    value={form.roleCode}
                                    onChange={v => setForm({...form, roleCode: v})}
                                    labelKey="name" valueKey="id" placeholder="Chức sắc chính..."
                                    className="h-14 bg-md-surface-container border border-md-outline/10 rounded-2xl font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                        <button 
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 h-16 bg-md-primary text-white rounded-[1.5rem] font-bold tracking-tight shadow-elevation-2 hover:shadow-elevation-4 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            {mutation.isPending ? 'Đang khởi tạo...' : 'Xác nhận Tạo tài khoản'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>,
        document.body
    )
}

function EditUserModal({ user, onClose, onSuccess }: { user: AdminUserDto, onClose: () => void, onSuccess: () => void }) {
    const [fullNameVi, setFullNameVi] = useState(user.fullNameVi)
    const [isActive, setIsActive] = useState(user.isActive)
    const [roleAssignments, setRoleAssignments] = useState(
        user.roleAssignments?.map(r => ({
            tenantId: r.tenantId,
            roleCode: r.roleCode,
            branchId: r.branchId || ''
        })) || []
    )

    const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: listTenants })
    const { data: roles = [] } = useQuery({ queryKey: ['admin-roles'], queryFn: getRoles })

    const mutation = useMutation({
        mutationFn: (body: UpdateUserRequest) => updateUser(user.id, body),
        onSuccess: () => {
            toastService.success('✨ Cập nhật tài khoản thành công!')
            onSuccess()
        },
        onError: (err: any) => toastService.error(err.message || 'Lỗi khi cập nhật')
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate({
            fullNameVi,
            isActive,
            roleAssignments: roleAssignments
                .filter(a => a.tenantId && a.roleCode)
                .map(a => ({
                    tenantId: a.tenantId,
                    roleCode: a.roleCode,
                    branchId: a.branchId || null
                }))
        })
    }

    const addRole = () => setRoleAssignments([...roleAssignments, { tenantId: '', roleCode: '', branchId: '' }])

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-md-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-4xl shadow-elevation-5 h-auto max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-8 border-b border-md-outline/5 flex items-center justify-between bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center">
                            <Pencil size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-md-on-surface tracking-tight">Chỉnh sửa Tài khoản</h3>
                            <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-60">{user.email}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 CustomScrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <MD3Input label="Họ tên hiển thị" icon={User} value={fullNameVi} onChange={setFullNameVi} />
                        <div className="flex items-center gap-4 bg-md-surface-container-low p-6 rounded-[2rem] border border-md-outline/5">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-md-on-surface">Trạng thái hoạt động</p>
                                <p className="text-[10px] text-md-on-surface-variant font-medium opacity-60">Cho phép truy cập hệ thống</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                <div className="w-14 h-8 bg-md-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-sm" />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-md-outline/5 pb-4">
                            <div className="flex items-center gap-2">
                                <Shield className="text-md-primary" />
                                <h4 className="text-sm font-black text-md-on-surface tracking-widest uppercase">Phân quyền chi tiết</h4>
                            </div>
                            <button type="button" onClick={addRole} className="px-5 py-2 bg-md-primary-container text-md-on-primary-container rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-md-primary/10 transition-all flex items-center gap-2 border border-md-primary/10">
                                <Plus size={14} />
                                Thêm gán vai trò
                            </button>
                        </div>

                        <div className="space-y-4">
                            {roleAssignments.map((ra, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-md-surface-container rounded-[2rem] border border-md-outline/5 relative group/row"
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-md-on-surface-variant uppercase tracking-widest ml-1">Cơ sở *</label>
                                        <CustomSelect 
                                            options={tenants.map(t => ({ id: t.id, name: t.nameVi }))}
                                            value={ra.tenantId}
                                            onChange={v => {
                                                const next = [...roleAssignments];
                                                next[idx].tenantId = v;
                                                setRoleAssignments(next);
                                            }}
                                            labelKey="name" valueKey="id" placeholder="Chọn cơ sở..."
                                            className="h-12 bg-white rounded-xl border-md-outline/10 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-md-on-surface-variant uppercase tracking-widest ml-1">Vai trò *</label>
                                        <CustomSelect 
                                            options={roles.map(r => ({ id: r.code, name: r.nameVi }))}
                                            value={ra.roleCode}
                                            onChange={v => {
                                                const next = [...roleAssignments];
                                                next[idx].roleCode = v;
                                                setRoleAssignments(next);
                                            }}
                                            labelKey="name" valueKey="id" placeholder="Chọn vai trò..."
                                            className="h-12 bg-white rounded-xl border-md-outline/10 font-bold"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button 
                                            type="button" 
                                            onClick={() => setRoleAssignments(roleAssignments.filter((_, i) => i !== idx))}
                                            className="size-12 bg-white border border-md-outline/10 text-md-outline hover:text-md-error hover:bg-md-error/5 rounded-xl flex items-center justify-center transition-all group-hover/row:border-md-error/20"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {roleAssignments.length === 0 && (
                                <div className="p-12 border-2 border-dashed border-md-outline/10 rounded-[2.5rem] text-center">
                                    <p className="text-sm font-bold text-md-on-surface-variant opacity-40 italic underline decoration-md-outline/10 decoration-wavy underline-offset-4">Chưa có vai trò nào được gán cho người dùng này.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-10 flex gap-4">
                        <button type="submit" disabled={mutation.isPending} className="flex-1 h-16 bg-md-primary text-white rounded-[1.5rem] font-bold tracking-tight shadow-elevation-2 hover:shadow-elevation-4 transition-all flex items-center justify-center gap-3">
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Lưu cấu hình tài khoản
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>,
        document.body
    )
}

function ResetPasswordModal({ user, onClose, onSuccess }: { user: AdminUserDto, onClose: () => void, onSuccess: () => void }) {
    const [pwd, setPwd] = useState('')
    const mutation = useMutation({
        mutationFn: () => setPassword(user.id, { newPassword: pwd }),
        onSuccess: () => {
            toastService.success('🔒 Đã cập nhật mật khẩu mới!')
            onSuccess()
        },
        onError: (err: any) => toastService.error(err.message || 'Lỗi khi đặt mật khẩu')
    })

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-md-on-surface/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white rounded-[3rem] w-full max-w-md shadow-elevation-5 overflow-hidden">
                <div className="p-8 border-b border-md-outline/5 flex items-center gap-4">
                    <div className="size-12 bg-md-error-container text-md-on-error-container rounded-2xl flex items-center justify-center shadow-sm">
                        <KeyRound size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-md-on-surface leading-tight">Đặt lại mật khẩu</h3>
                        <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-60">{user.email}</p>
                    </div>
                </div>
                <div className="p-10 space-y-8">
                    <MD3Input label="Mật khẩu mới hệ thống" type="password" value={pwd} onChange={setPwd} placeholder="Tối thiểu 8 ký tự..." />
                    <button 
                        onClick={() => pwd.length >= 8 ? mutation.mutate() : toastService.warning('Mật khẩu quá ngắn')}
                        disabled={mutation.isPending}
                        className="w-full h-14 bg-md-on-surface text-white rounded-2xl font-bold tracking-tight hover:shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                        Xác nhận đặt lại
                    </button>
                    <button onClick={onClose} className="w-full h-12 text-md-on-surface-variant font-bold text-sm hover:underline">Hủy thao tác</button>
                </div>
            </motion.div>
        </div>,
        document.body
    )
}

function MD3Input({ label, icon: Icon, value, onChange, placeholder, type = 'text', required = false }: any) {
    return (
        <div className="space-y-2 group">
            <label className="text-xs font-bold text-md-on-surface-variant ml-2 block group-focus-within:text-md-primary transition-colors">
                {label} {required && <span className="text-md-error">*</span>}
            </label>
            <div className="relative">
                {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-md-on-surface-variant opacity-40 group-focus-within:opacity-100 group-focus-within:text-md-primary" size={18} />}
                <input 
                    type={type} 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    placeholder={placeholder}
                    required={required}
                    className={`w-full h-14 ${Icon ? 'pl-14' : 'px-6'} pr-6 bg-md-surface-container-low border border-md-outline/10 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-md-primary/10 focus:border-md-primary outline-none transition-all placeholder:font-normal placeholder:opacity-40 text-slate-900`}
                />
            </div>
        </div>
    )
}

function DeleteUserModal({ user, onClose, onSuccess }: { user: AdminUserDto, onClose: () => void, onSuccess: () => void }) {
    const mutation = useMutation({
        mutationFn: () => deleteUser(user.id),
        onSuccess: () => {
            toastService.success('🗑️ Đã xóa tài khoản thành công!')
            onSuccess()
        },
        onError: (err: any) => toastService.error(err.message || 'Lỗi khi xóa tài khoản')
    })

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-md-on-surface/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white rounded-[3rem] w-full max-w-md shadow-elevation-5 overflow-hidden">
                <div className="p-10 text-center space-y-6">
                    <div className="size-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle size={36} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-md-on-surface">Xác nhận xóa tài khoản</h3>
                        <p className="text-sm text-md-on-surface-variant">
                            Bạn có chắc chắn muốn xóa tài khoản <span className="font-bold text-red-600">{user.fullNameVi}</span> ({user.email})?
                        </p>
                        <p className="text-[11px] text-red-600/70 font-bold italic">
                            Hành động này không thể hoàn tác.
                        </p>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={onClose} 
                            className="flex-1 h-14 bg-md-surface-container border border-md-outline/10 text-md-on-surface font-bold rounded-2xl hover:bg-md-surface-container-low transition-all"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={() => mutation.mutate()}
                            disabled={mutation.isPending}
                            className="flex-1 h-14 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                            {mutation.isPending ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    )
}
