import {
    createUser,
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
import { motion } from 'framer-motion'
import { Filter, KeyRound, Loader2, Pencil, Plus, Save, Shield, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

const PAGE_SIZE = 10

export function UserManagement() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(0)
    const [tenantFilter, setTenantFilter] = useState<string>('')
    const [createOpen, setCreateOpen] = useState(false)
    const [editUser, setEditUser] = useState<AdminUserDto | null>(null)
    const [passwordUser, setPasswordUser] = useState<AdminUserDto | null>(null)

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

    return (
        <div className="w-full animate-in fade-in duration-700 font-sans space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-end text-left">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Quản lý Tài khoản</h2>
                    <p className="text-neutral-500">Quản lý và phân quyền truy cập cho người dùng trong hệ thống.</p>
                </div>
                <button
                    type="button"
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                    onClick={() => {
                        setEditUser(null)
                        setPasswordUser(null)
                        setCreateOpen(true)
                    }}
                >
                    <UserPlus className="w-4 h-4" />
                    Tạo tài khoản mới
                </button>
            </div>

            {/* Quick Filters Area */}
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary-500" />
                    <h2 className="text-sm font-bold text-slate-900 pr-2 border-r border-slate-200">Danh sách tài khoản</h2>
                </div>
                <div className="flex items-center gap-2 w-full md:w-72">
                    <CustomSelect
                        options={[{ id: '', name: 'Tất cả cơ sở' }, ...tenants.map(t => ({ id: t.id, name: `${t.nameVi} (${t.code})` }))]}
                        value={tenantFilter}
                        onChange={(val) => {
                            setTenantFilter(val)
                            setPage(0)
                        }}
                        labelKey="name"
                        valueKey="id"
                        placeholder="Lọc theo Tenant..."
                        size="sm"
                        className="flex-1"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Đang tải danh sách tài khoản...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 tracking-widest">Tài khoản</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 tracking-widest">Trạng thái</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 tracking-widest">Phân quyền</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 tracking-widest">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {(data?.content ?? []).map((u: AdminUserDto) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{u.fullNameVi}</span>
                                                    <span className="text-[11px] text-slate-400 font-medium">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-widest ${u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5 max-w-sm">
                                                    {(u.roleAssignments || []).map((ra, rai) => (
                                                        <div key={rai} className="flex flex-col bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-tighter italic">{ra.roleCode}</span>
                                                            <span className="text-[9px] text-slate-400 truncate max-w-[120px]">@ {ra.tenantName || 'System'}</span>
                                                        </div>
                                                    ))}
                                                    {!(u.roleAssignments?.length) && <span className="text-[10px] text-slate-300 italic">Chưa gán vai trò</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                                                        onClick={() => {
                                                            setCreateOpen(false)
                                                            setPasswordUser(null)
                                                            setEditUser(u)
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                                        onClick={() => {
                                                            setCreateOpen(false)
                                                            setEditUser(null)
                                                            setPasswordUser(u)
                                                        }}
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {data && data.totalPages > 1 && (
                            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
                                <p className="text-[11px] text-slate-400 font-bold">
                                    Trang <span className="text-slate-900">{data.page + 1}</span> / {data.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={data.first}
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all"
                                    >
                                        Trước
                                    </button>
                                    <button
                                        type="button"
                                        disabled={data.last}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {createOpen && (
                <CreateUserForm
                    onSuccess={() => {
                        setCreateOpen(false)
                        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
                    }}
                    onCancel={() => setCreateOpen(false)}
                />
            )}
            {editUser && (
                <EditUserForm
                    user={editUser!}
                    onSuccess={() => {
                        setEditUser(null)
                        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
                    }}
                    onCancel={() => setEditUser(null)}
                />
            )}
            {passwordUser && (
                <SetPasswordForm
                    user={passwordUser!}
                    onSuccess={() => {
                        setPasswordUser(null)
                    }}
                    onCancel={() => setPasswordUser(null)}
                />
            )}
        </div>
    )
}

function CreateUserForm({
    onSuccess,
    onCancel,
}: {
    onSuccess: () => void
    onCancel: () => void
}) {
    const [form, setForm] = useState<CreateUserRequest>({
        email: '',
        fullNameVi: '',
        password: '',
        phone: '',
        tenantId: '',
        roleCode: '',
        branchId: '',
    })
    const [error, setError] = useState('')

    const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: listTenants })
    const { data: roles = [] } = useQuery({ queryKey: ['admin-roles'], queryFn: getRoles })
    const { data: branches = [] } = useQuery({
        queryKey: ['branches', form.tenantId],
        queryFn: () => listBranches(form.tenantId),
        enabled: !!form.tenantId,
    })

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            toastService.success('✅ Tạo user thành công!')
            onSuccess()
        },
        onError: (err: Error) => {
            setError(err.message)
            toastService.error(err.message)
        },
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!form.tenantId || !form.roleCode) {
            setError('Chọn tenant và role.')
            return
        }
        createMutation.mutate({
            ...form,
            tenantId: form.tenantId,
            roleCode: form.roleCode,
            branchId: form.branchId || undefined,
        })
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden z-10"
            >
                <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 dark:bg-primary/20 text-white dark:text-primary rounded-2xl shadow-lg">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Tạo tài khoản mới</h3>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1.5">Hệ thống quản trị truy cập</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl transition-all shadow-sm">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-10 space-y-6 overflow-y-auto">
                    {error && <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-2xl">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Địa chỉ Email *</label>
                            <input type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Họ và tên *</label>
                            <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" value={form.fullNameVi} onChange={(e) => setForm((f) => ({ ...f, fullNameVi: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Mật khẩu khởi tạo *</label>
                            <input type="password" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={6} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Số điện thoại</label>
                            <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || undefined }))} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Phòng khám/Cơ sở *</label>
                            <CustomSelect options={tenants.map(t => ({ id: t.id, name: t.nameVi }))} value={form.tenantId} onChange={(val) => setForm((f) => ({ ...f, tenantId: val, branchId: '' }))} labelKey="name" valueKey="id" placeholder="Chọn cơ sở..." size="sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Vai trò chính *</label>
                            <CustomSelect options={roles.map(r => ({ code: r.code, name: r.nameVi }))} value={form.roleCode} onChange={(val) => setForm((f) => ({ ...f, roleCode: val }))} labelKey="name" valueKey="code" placeholder="Chọn vai trò..." size="sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Chi nhánh cụ thể</label>
                            <CustomSelect options={[{ id: '', name: '-- Toàn cơ sở --' }, ...branches.map(b => ({ id: b.id, name: b.nameVi }))]} value={form.branchId || ''} onChange={(val) => setForm((f) => ({ ...f, branchId: val || undefined }))} labelKey="name" valueKey="id" placeholder="Toàn bộ" size="sm" disabled={!form.tenantId} />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-10 border-t border-slate-50">
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 bg-slate-900 dark:bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {createMutation.isPending ? 'Đang khởi tạo...' : 'Xác nhận Tạo tài khoản'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>,
        document.body
    )
}

function EditUserForm({
    user,
    onSuccess,
    onCancel,
}: {
    user: AdminUserDto
    onSuccess: () => void
    onCancel: () => void
}) {
    const [fullNameVi, setFullNameVi] = useState(user.fullNameVi)
    const [isActive, setIsActive] = useState(user.isActive)
    const [roleAssignments, setRoleAssignments] = useState(
        user.roleAssignments?.map(r => ({
            tenantId: r.tenantId,
            roleCode: r.roleCode,
            branchId: r.branchId || ''
        })) || []
    )
    const [error, setError] = useState('')

    const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: listTenants })
    const { data: roles = [] } = useQuery({ queryKey: ['admin-roles'], queryFn: getRoles })

    const updateMutation = useMutation({
        mutationFn: (body: UpdateUserRequest) => updateUser(user.id, body),
        onSuccess: () => {
            toastService.success('✨ Cập nhật người dùng thành công!')
            onSuccess()
        },
        onError: (err: Error) => {
            setError(err.message)
            toastService.error(err.message)
        },
    })

    const addAssignment = () => {
        setRoleAssignments([...roleAssignments, { tenantId: '', roleCode: '', branchId: '' }])
    }

    const removeAssignment = (idx: number) => {
        setRoleAssignments(roleAssignments.filter((_, i) => i !== idx))
    }

    const updateAssignment = (idx: number, key: string, val: string) => {
        const next = [...roleAssignments]
        next[idx] = { ...next[idx], [key]: val }
        if (key === 'tenantId') {
            next[idx].branchId = '' // reset branch when tenant changed
        }
        setRoleAssignments(next)
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        updateMutation.mutate({
            fullNameVi,
            isActive,
            roleAssignments: roleAssignments
                .filter(a => a.tenantId && a.roleCode)
                .map(a => ({
                    tenantId: a.tenantId,
                    roleCode: a.roleCode,
                    branchId: a.branchId || undefined
                }))
        })
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-10"
            >
                <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 dark:bg-primary/20 text-white dark:text-primary rounded-2xl shadow-lg">
                            <Pencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Chỉnh sửa Tài khoản</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1.5">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl transition-all shadow-sm">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={submit} className="flex-1 overflow-y-auto p-10 space-y-10">
                    {error && <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-2xl">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Họ tên *</label>
                            <input
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all dark:bg-slate-800 dark:text-white shadow-inner"
                                value={fullNameVi}
                                onChange={(e) => setFullNameVi(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-end pb-4">
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[26px] after:transition-all peer-checked:bg-emerald-500"></div>
                                <span className="ml-3 text-sm font-black text-slate-600 group-hover:text-slate-900 transition-colors">
                                    {isActive ? 'Tài khoản đang Hoạt động' : 'Tài khoản đang bị Khóa'}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-500" />
                                <h4 className="text-sm font-black text-slate-900 tracking-widest">Phân quyền & Truy cập</h4>
                            </div>
                            <button
                                type="button"
                                onClick={addAssignment}
                                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-black text-xs uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm gán vai trò
                            </button>
                        </div>

                        <div className="space-y-4">
                            {roleAssignments.length === 0 && (
                                <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
                                    <p className="text-slate-400 text-sm font-medium italic">Chưa có vai trò nào được gán cho người dùng này.</p>
                                </div>
                            )}
                            {roleAssignments.map((ra, idx) => (
                                <AssignmentRow
                                    key={idx}
                                    assignment={ra}
                                    tenants={tenants}
                                    roles={roles}
                                    onChange={(key, val) => updateAssignment(idx, key, val)}
                                    onDelete={() => removeAssignment(idx)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-10 border-t border-slate-50 dark:border-slate-800">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="flex-1 bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black tracking-widest uppercase hover:bg-emerald-600 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {updateMutation.isPending ? 'Đang cập nhật...' : 'Lưu thay đổi hệ thống'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all font-bold"
                        >
                            Đóng
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>,
        document.body
    )
}

function AssignmentRow({ assignment, tenants, roles, onChange, onDelete }: {
    assignment: { tenantId: string; roleCode: string; branchId: string };
    tenants: any[];
    roles: any[];
    onChange: (key: string, val: string) => void;
    onDelete: () => void;
}) {
    const { data: branches = [] } = useQuery({
        queryKey: ['branches', assignment.tenantId],
        queryFn: () => listBranches(assignment.tenantId),
        enabled: !!assignment.tenantId,
    })

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] items-end gap-4 p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] group"
        >
            <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Cơ sở *</label>
                <CustomSelect
                    options={tenants.map(t => ({ id: t.id, name: t.nameVi }))}
                    value={assignment.tenantId}
                    onChange={(val) => onChange('tenantId', val)}
                    labelKey="name"
                    valueKey="id"
                    placeholder="Chọn cơ sở..."
                    size="sm"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Vai trò *</label>
                <CustomSelect
                    options={roles.map(r => ({ code: r.code, name: r.nameVi }))}
                    value={assignment.roleCode}
                    onChange={(val) => onChange('roleCode', val)}
                    labelKey="name"
                    valueKey="code"
                    placeholder="Chọn vai trò..."
                    size="sm"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Chi nhánh</label>
                <CustomSelect
                    options={[{ id: '', name: 'Toàn bộ' }, ...branches.map(b => ({ id: b.id, name: b.nameVi }))]}
                    value={assignment.branchId}
                    onChange={(val) => onChange('branchId', val)}
                    labelKey="name"
                    valueKey="id"
                    placeholder="Toàn bộ"
                    size="sm"
                    disabled={!assignment.tenantId}
                />
            </div>
            <button
                type="button"
                onClick={onDelete}
                className="p-3 mb-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    )
}

function SetPasswordForm({
    user,
    onSuccess,
    onCancel,
}: {
    user: AdminUserDto
    onSuccess: () => void
    onCancel: () => void
}) {
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')

    const mutation = useMutation({
        mutationFn: () => setPassword(user.id, { newPassword }),
        onSuccess: () => {
            toastService.success('🔒 Đã cập nhật mật khẩu mới!')
            onSuccess()
        },
        onError: (err: Error) => {
            setError(err.message)
            toastService.error(err.message)
        },
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (newPassword.length < 6) {
            setError('Mật khẩu tối thiểu 6 ký tự.')
            return
        }
        mutation.mutate()
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden z-10"
            >
                <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl shadow-lg shadow-amber-500/5">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Đặt mật khẩu</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1.5">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl transition-all shadow-sm">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-10 space-y-6">
                    {error && <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-2xl">{error}</p>}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Mật khẩu mới hệ thống *</label>
                        <input
                            type="password"
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-slate-900 dark:text-white shadow-inner"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Tối thiểu 6 ký tự..."
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-amber-500 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {mutation.isPending ? 'Đang thực thi...' : 'Xác nhận Đổi mật khẩu'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all font-bold"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>,
        document.body
    )
}
