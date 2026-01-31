import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import {
  getAdminUsers,
  createUser,
  updateUser,
  setPassword,
  getRoles,
} from '@/api/admin'
import { listTenants } from '@/api/tenants'
import { getBranches } from '@/api/tenants'
import type {
  AdminUserDto,
  CreateUserRequest,
  UpdateUserRequest,
  UserRoleAssignmentDto,
} from '@/types/api'

const PAGE_SIZE = 10

export function Admin() {
  const { user: authUser } = useAuth()
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

  const isAdmin = authUser?.roles?.includes('admin')
  if (!isAdmin) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <p className="text-slate-600">Chỉ Admin mới truy cập trang này.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">Quản trị người dùng</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditUser(null)
            setPasswordUser(null)
            setCreateOpen(true)
          }}
        >
          Tạo user
        </button>
      </div>

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="label mb-0">Lọc tenant:</label>
          <select
            className="input w-auto min-w-[180px]"
            value={tenantFilter}
            onChange={(e) => {
              setTenantFilter(e.target.value)
              setPage(0)
            }}
          >
            <option value="">Tất cả</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameVi} ({t.code})
              </option>
            ))}
          </select>
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
                      <td className="table-td">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-sm text-primary-600 hover:underline"
                            onClick={() => {
                              setCreateOpen(false)
                              setPasswordUser(null)
                              setEditUser(u)
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="text-sm text-primary-600 hover:underline"
                            onClick={() => {
                              setCreateOpen(false)
                              setEditUser(null)
                              setPasswordUser(u)
                            }}
                          >
                            Đặt mật khẩu
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
    queryFn: () => getBranches(form.tenantId),
    enabled: !!form.tenantId,
  })

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => onSuccess(),
    onError: (err: Error) => setError(err.message),
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
    <div className="card max-w-xl">
      <h3 className="section-title mb-4">Tạo user mới</h3>
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="label">Email *</label>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Họ tên *</label>
          <input
            className="input"
            value={form.fullNameVi}
            onChange={(e) => setForm((f) => ({ ...f, fullNameVi: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Mật khẩu *</label>
          <input
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="label">SĐT</label>
          <input
            className="input"
            value={form.phone ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || undefined }))}
          />
        </div>
        <div>
          <label className="label">Tenant *</label>
          <select
            className="input"
            value={form.tenantId}
            onChange={(e) =>
              setForm((f) => ({ ...f, tenantId: e.target.value, branchId: '' }))
            }
            required
          >
            <option value="">-- Chọn tenant --</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameVi} ({t.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Role *</label>
          <select
            className="input"
            value={form.roleCode}
            onChange={(e) => setForm((f) => ({ ...f, roleCode: e.target.value }))}
            required
          >
            <option value="">-- Chọn role --</option>
            {roles.map((r) => (
              <option key={r.id} value={r.code}>
                {r.nameVi} ({r.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Chi nhánh (tùy chọn)</label>
          <select
            className="input"
            value={form.branchId ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, branchId: e.target.value || undefined }))
            }
            disabled={!form.tenantId}
          >
            <option value="">-- Toàn tenant --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameVi} ({b.code})
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Đang tạo...' : 'Tạo'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </form>
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
  const [error, setError] = useState('')

  const updateMutation = useMutation({
    mutationFn: (body: UpdateUserRequest) => updateUser(user.id, body),
    onSuccess: () => onSuccess(),
    onError: (err: Error) => setError(err.message),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    updateMutation.mutate({
      fullNameVi,
      isActive,
    })
  }

  return (
    <div className="card max-w-xl">
      <h3 className="section-title mb-4">Sửa user: {user.email}</h3>
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="label">Họ tên</label>
          <input
            className="input"
            value={fullNameVi}
            onChange={(e) => setFullNameVi(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActive">Hoạt động</label>
        </div>
        <div>
          <label className="label">Vai trò (tenant / role / branch)</label>
          <p className="text-xs text-slate-500 mb-1">
            Hiện tại: {user.roleAssignments?.map((r) => r.roleCode).join(', ') || '—'}
          </p>
          <p className="text-xs text-slate-500">
            Để thay đổi gán role, dùng API PATCH với roleAssignments (danh sách tenantId, roleCode, branchId?).
          </p>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </form>
    </div>
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
    onSuccess: () => onSuccess(),
    onError: (err: Error) => setError(err.message),
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
    <div className="card max-w-md">
      <h3 className="section-title mb-4">Đặt mật khẩu: {user.email}</h3>
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="label">Mật khẩu mới *</label>
          <input
            type="password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}
