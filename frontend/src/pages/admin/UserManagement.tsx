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
import { ChevronLeft, Filter, KeyRound, Pencil, Plus, Shield, UserPlus, X } from 'lucide-react'
import { useState } from 'react'

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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản trị người dùng</h1>
                    <p className="text-slate-500 font-medium text-sm">Quản lý tài khoản, phân quyền và truy cập chi nhánh.</p>
                </div>
                <button
                    type="button"
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-sm tracking-tight hover:bg-[#2b8cee] hover:shadow-xl hover:shadow-[#2b8cee]/20 transition-all active:scale-95"
                    onClick={() => {
                        setEditUser(null)
                        setPasswordUser(null)
                        setCreateOpen(true)
                    }}
                >
                    <UserPlus className="w-4 h-4" />
                    Tạo User mới
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-[#2b8cee]" />
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Danh sách tài khoản</h2>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-80">
                        <CustomSelect
                            options={[{ id: '', name: 'Tất cả Tenant' }, ...tenants.map(t => ({ id: t.id, name: `${t.nameVi} (${t.code})` }))]}
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

                {isLoading ? (
                    <p className="text-slate-500">Đang tải...</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                    <tr>
                                        <th className="table-th">Email</th>
                                        <th className="table-th">Họ tên</th>
                                        <th className="table-th">Trạng thái</th>
                                        <th className="table-th">Vai trò (tenant / chi nhánh)</th>
                                        <th className="table-th">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data?.content ?? []).map((u) => (
                                        <tr key={u.id}>
                                            <td className="table-td font-medium">{u.email}</td>
                                            <td className="table-td">{u.fullNameVi}</td>
                                            <td className="table-td">
                                                <span
                                                    className={
                                                        u.isActive
                                                            ? 'text-emerald-600'
                                                            : 'text-slate-400'
                                                    }
                                                >
                                                    {u.isActive ? 'Hoạt động' : 'Khóa'}
                                                </span>
                                            </td>
                                            <td className="table-td text-xs text-slate-600">
                                                {u.roleAssignments?.length
                                                    ? u.roleAssignments
                                                        .map(
                                                            (r) =>
                                                                `${r.roleCode}${r.tenantName ? ` @ ${r.tenantName}` : ''}${r.branchName ? ` / ${r.branchName}` : ''}`
                                                        )
                                                        .join(', ')
                                                    : '—'}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="p-2 text-slate-400 hover:text-[#2b8cee] hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Sửa thông tin"
                                                        onClick={() => {
                                                            setCreateOpen(false)
                                                            setPasswordUser(null)
                                                            setEditUser(u)
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="Đặt lại mật khẩu"
                                                        onClick={() => {
                                                            setCreateOpen(false)
                                                            setEditUser(null)
                                                            setPasswordUser(u)
                                                        }}
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {data && data.totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                <p className="text-sm text-slate-500">
                                    Trang {data.page + 1} / {data.totalPages} ({data.totalElements} user)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        disabled={data.first}
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    >
                                        Trước
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        disabled={data.last}
                                        onClick={() => setPage((p) => p + 1)}
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
                    user={editUser}
                    onSuccess={() => {
                        setEditUser(null)
                        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
                    }}
                    onCancel={() => setEditUser(null)}
                />
            )}
            {passwordUser && (
                <SetPasswordForm
                    user={passwordUser}
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#2b8cee]/10 rounded-xl text-[#2b8cee]">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Tạo User mới</h3>
                    </div>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-8 space-y-6">
                    {error && <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-2xl">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email *</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2b8cee]/10 focus:border-[#2b8cee] outline-none transition-all font-medium"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Họ tên *</label>
                            <input
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2b8cee]/10 focus:border-[#2b8cee] outline-none transition-all font-medium"
                                value={form.fullNameVi}
                                onChange={(e) => setForm((f) => ({ ...f, fullNameVi: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mật khẩu *</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2b8cee]/10 focus:border-[#2b8cee] outline-none transition-all font-medium"
                                value={form.password}
                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Số điện thoại</label>
                            <input
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2b8cee]/10 focus:border-[#2b8cee] outline-none transition-all font-medium"
                                value={form.phone ?? ''}
                                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || undefined }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tenant *</label>
                            <CustomSelect
                                options={tenants.map(t => ({ id: t.id, name: `${t.nameVi} (${t.code})` }))}
                                value={form.tenantId}
                                onChange={(val) => setForm((f) => ({ ...f, tenantId: val, branchId: '' }))}
                                labelKey="name"
                                valueKey="id"
                                placeholder="Chọn Tenant..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Role *</label>
                            <CustomSelect
                                options={roles.map(r => ({ code: r.code, name: `${r.nameVi} (${r.code})` }))}
                                value={form.roleCode}
                                onChange={(val) => setForm((f) => ({ ...f, roleCode: val }))}
                                labelKey="name"
                                valueKey="code"
                                placeholder="Chọn Vai trò..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Chi nhánh</label>
                            <CustomSelect
                                options={[{ id: '', name: '-- Toàn Tenant --' }, ...branches.map(b => ({ id: b.id, name: b.nameVi }))]}
                                value={form.branchId || ''}
                                onChange={(val) => setForm((f) => ({ ...f, branchId: val || undefined }))}
                                labelKey="name"
                                valueKey="id"
                                placeholder="Toàn bộ hệ thống"
                                disabled={!form.tenantId}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm tracking-tight hover:bg-[#2b8cee] shadow-xl hover:shadow-[#2b8cee]/20 transition-all disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Tạo'}
                        </button>
                        <button type="button" className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all" onClick={onCancel}>
                            Hủy
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                            <Pencil className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Chỉnh sửa Tài khoản</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={submit} className="flex-1 overflow-y-auto p-10 space-y-10">
                    {error && <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-2xl">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Họ tên *</label>
                            <input
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
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
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Phân quyền & Truy cập</h4>
                            </div>
                            <button
                                type="button"
                                onClick={addAssignment}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-black text-xs uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl transition-all"
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

                    <div className="flex gap-4 pt-10 border-t border-slate-50">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="flex-1 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black tracking-tight hover:bg-blue-600 shadow-xl hover:shadow-blue-600/20 transition-all disabled:opacity-50"
                        >
                            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-10 py-5 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all font-black"
                        >
                            Đóng
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
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
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Cơ sở (Tenant) *</label>
                <CustomSelect
                    options={tenants.map(t => ({ id: t.id, name: t.nameVi }))}
                    value={assignment.tenantId}
                    onChange={(val) => onChange('tenantId', val)}
                    labelKey="name"
                    valueKey="id"
                    placeholder="Chọn Tenant..."
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
                    placeholder="Chọn Role..."
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden"
            >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Đặt mật khẩu</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="p-8 space-y-6">
                    {error && <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-xl">{error}</p>}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mật khẩu mới *</label>
                        <input
                            type="password"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm tracking-tight hover:bg-amber-500 shadow-xl hover:shadow-amber-500/20 transition-all disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Đang lưu...' : 'Xác nhận Đổi'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
