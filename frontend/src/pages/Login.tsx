import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { listTenants, getBranches } from '@/api/tenants'
import type { LoginRequest, TenantDto, TenantBranchDto } from '@/types/api'
import { LogIn, UserPlus, Building2, User, Mail, Lock, Stethoscope, ChevronRight, X } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function Login() {
  // Wrapper for the standalone login route
  return <LoginModal isOpen={true} onClose={() => { }} />
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth()
  const { setTenant } = useTenant()

  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [branchId, setBranchId] = useState('')

  // Register fields
  const [fullName, setFullName] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: listTenants,
  })

  // Auto-select first tenant if only one
  if (tenants.length === 1 && !tenantId) {
    setTenantId(tenants[0].id)
  }

  const { data: branches = [] } = useQuery({
    queryKey: ['branches', tenantId],
    queryFn: () => getBranches(tenantId),
    enabled: !!tenantId,
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!tenantId) {
      setError('Vui lòng chọn phòng khám.')
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
      // Close modal on success (Or redirect if we were on a protected route)
      // Since Login is now a modal used likely on LandingPage, we might want to redirect.
      // But typically a modal login keeps user on same page or redirects to dashboard.
      // Let's assume we redirect to dashboard for now as per previous logic.
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    setTimeout(() => {
      alert('Đăng ký thành công! Vui lòng liên hệ Admin để duyệt phòng khám của bạn.')
      setIsRegister(false)
      setSubmitting(false)
    }, 1000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto relative">

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>

              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {isRegister ? 'Đăng ký tài khoản' : 'Chào mừng trở lại'}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    {isRegister ? 'Tạo tài khoản mới cho phòng khám' : 'Đăng nhập để truy cập hệ thống'}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {isRegister ? (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                      onSubmit={handleRegister}
                    >
                      <div className="space-y-3">
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Họ tên người quản lý"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Tên phòng khám"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                            value={clinicName}
                            onChange={e => setClinicName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <input
                            type="email"
                            placeholder="Email đăng nhập"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                            value={registerEmail}
                            onChange={e => setRegisterEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <input
                            type="password"
                            placeholder="Mật khẩu"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                            value={registerPassword}
                            onChange={e => setRegisterPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2">
                        {submitting ? 'Đang xử lý...' : (
                          <>Đăng Ký <UserPlus className="h-4 w-4" /></>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                      onSubmit={handleLogin}
                    >
                      {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                          {error}
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <input
                            type="email"
                            placeholder="Email"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <input
                            type="password"
                            placeholder="Mật khẩu"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <select
                              value={tenantId}
                              onChange={(e) => {
                                setTenantId(e.target.value)
                                setBranchId('')
                              }}
                              className="w-full pl-3 pr-8 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none truncate"
                              required
                            >
                              <option value="">Chọn Tenant</option>
                              {tenants.map((t: TenantDto) => (
                                <option key={t.id} value={t.id}>{t.code}</option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none">
                              <Building2 className="h-4 w-4 text-slate-400" />
                            </div>
                          </div>

                          <div className="relative">
                            <select
                              value={branchId}
                              onChange={(e) => setBranchId(e.target.value)}
                              className="w-full pl-3 pr-8 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none disabled:opacity-50 truncate"
                              disabled={!tenantId}
                            >
                              <option value="">Chi nhánh</option>
                              {branches.map((b: TenantBranchDto) => (
                                <option key={b.id} value={b.id}>{b.nameVi}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition transform flex items-center justify-center gap-2">
                        {submitting ? 'Đang đăng nhập...' : (
                          <>Đăng Nhập <LogIn className="h-4 w-4" /></>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="mt-6 text-center border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-500 mb-2">
                    {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
                  </p>
                  <button
                    onClick={() => {
                      setIsRegister(!isRegister)
                      setError('')
                    }}
                    className="text-blue-600 font-semibold hover:text-blue-700 transition flex items-center justify-center gap-1 mx-auto text-sm"
                  >
                    {isRegister ? 'Đăng nhập ngay' : 'Đăng ký phòng khám mới'}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
