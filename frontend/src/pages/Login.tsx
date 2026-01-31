import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { listTenants } from '@/api/tenants'
import { getBranches } from '@/api/tenants'
import { useQuery } from '@tanstack/react-query'
import type { LoginRequest } from '@/types/api'
import type { TenantDto, TenantBranchDto } from '@/types/api'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { setTenant } = useTenant()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: listTenants,
  })

  const { data: branches = [] } = useQuery({
    queryKey: ['branches', tenantId],
    queryFn: () => getBranches(tenantId),
    enabled: !!tenantId,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!tenantId) {
      setError('Vui lòng chọn phòng khám (tenant).')
      return
    }
    setSubmitting(true)
    try {
      const req: LoginRequest = {
        email: email.trim(),
        password,
        tenantId,
        branchId: branchId || undefined,
      }
      const res = await login(req)
      setTenant(res.user.tenantId, res.user.branchId ?? undefined)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Đăng nhập</h1>
          <p className="text-sm text-slate-600 mb-6">Hệ thống luồng bệnh nhân & phân loại</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phòng khám</label>
              <select
                value={tenantId}
                onChange={(e) => {
                  setTenantId(e.target.value)
                  setBranchId('')
                }}
                className="input"
                required
              >
                <option value="">-- Chọn phòng khám --</option>
                {tenants.map((t: TenantDto) => (
                  <option key={t.id} value={t.id}>
                    {t.nameVi} ({t.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chi nhánh</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="input"
                disabled={!tenantId}
              >
                <option value="">-- Chọn chi nhánh (tùy chọn) --</option>
                {branches.map((b: TenantBranchDto) => (
                  <option key={b.id} value={b.id}>
                    {b.nameVi} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn primary w-full" disabled={submitting}>
              {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Demo: admin@example.com / password, tenant CLINIC_DEMO
          </p>
        </div>
      </div>
    </div>
  )
}
