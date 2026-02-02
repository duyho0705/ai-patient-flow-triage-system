import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { listTenants, getBranches } from '@/api/tenants'
import { useQuery } from '@tanstack/react-query'
import { X, LogIn } from 'lucide-react'
import type { LoginRequest, TenantDto, TenantBranchDto } from '@/types/api'

interface LoginFormProps {
  onSuccess: () => void;
}

function LoginForm({ onSuccess }: LoginFormProps) {
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
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2b8cee] focus:border-[#2b8cee] outline-none transition-all"
            placeholder="admin@example.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2b8cee] focus:border-[#2b8cee] outline-none transition-all"
            required
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Phòng khám</label>
          <select
            value={tenantId}
            onChange={(e) => {
              setTenantId(e.target.value)
              setBranchId('')
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2b8cee] focus:border-[#2b8cee] outline-none transition-all bg-white"
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
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Chi nhánh</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2b8cee] focus:border-[#2b8cee] outline-none transition-all bg-white disabled:bg-slate-100 disabled:text-slate-400"
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
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#2b8cee] text-white py-2.5 rounded-lg font-bold hover:bg-[#2b8cee]/90 transition-all shadow-lg shadow-[#2b8cee]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Đăng nhập
            </>
          )}
        </button>
      </form>
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
        <p className="text-xs text-center text-slate-500 font-mono">
          Demo: admin@example.com / password<br />
          Tenant: CLINIC_DEMO
        </p>
      </div>
    </div>
  )
}

export function Login() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
            <p className="text-slate-500 mt-2">Hệ thống luồng bệnh nhân & phân loại AI</p>
          </div>
          <LoginForm onSuccess={() => navigate('/dashboard', { replace: true })} />
        </div>
      </div>
    </div>
  )
}

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#2d3436]">Chào mừng trở lại</h2>
            <p className="text-slate-500 mt-2">Vui lòng đăng nhập để tiếp tục</p>
          </div>

          <LoginForm onSuccess={() => {
            onClose()
            navigate('/dashboard', { replace: true })
          }} />
        </div>
      </div>

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}
