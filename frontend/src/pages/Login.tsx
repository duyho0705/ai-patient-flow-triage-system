import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { listTenants, getBranches } from '@/api/tenants'
import { useQuery } from '@tanstack/react-query'
import { X, LogIn, Mail, Lock, Building2, MapPin, AlertCircle, Loader2, Stethoscope, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LoginRequest, RegisterRequest } from '@/types/api'

interface LoginFormProps {
  onSuccess: () => void;
}

import { CustomSelect } from '@/components/CustomSelect'

function LoginForm({ onSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [step, setStep] = useState(1)
  const { login, register } = useAuth()
  const { setTenant } = useTenant()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullNameVi, setFullNameVi] = useState('')
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

  // Set default tenant if only one exists
  useEffect(() => {
    if (tenants.length === 1 && !tenantId) {
      setTenantId(tenants[0].id)
    }
  }, [tenants])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic Validation
    if (!email) {
      setError('Vui lòng nhập email.')
      setStep(1)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Định dạng email không hợp lệ.')
      setStep(1)
      return
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.')
      setStep(1)
      return
    }

    if (mode === 'register') {
      if (!fullNameVi.trim()) {
        setError('Vui lòng nhập họ và tên.')
        setStep(1)
        return
      }
      if (password.length < 8) {
        setError('Mật khẩu đăng ký phải có ít nhất 8 ký tự.')
        setStep(1)
        return
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
        setError('Mật khẩu phải bao gồm chữ hoa, chữ thường và số.')
        setStep(1)
        return
      }
    }

    if (step === 1) {
      setStep(2)
      return
    }

    if (!tenantId) {
      setError('Vui lòng chọn phòng khám.')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'login') {
        const req: LoginRequest = {
          email: email.trim(),
          password,
          tenantId,
          branchId: branchId || undefined,
        }
        await login(req)
      } else {
        const req: RegisterRequest = {
          email: email.trim(),
          password,
          fullNameVi: fullNameVi.trim(),
          tenantId,
          branchId: branchId || undefined,
        }
        await register(req)
      }
      // Success logic - we need to login after registration, but context register might do it or we do it here.
      // Based on code line 86, it calls login again. 
      const res = await login({ email: email.trim(), password, tenantId, branchId: branchId || undefined })
      setTenant(res.user.tenantId, res.user.branchId ?? undefined)

      const isPatient = res.user.roles.includes('patient');
      if (isPatient) {
        navigate('/patient', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Thao tác thất bại. Vui lòng kiểm tra lại thông tin.')
      setStep(1)
    } finally {
      setSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="relative overflow-hidden">
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {step === 1 ? (
            <motion.div
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-5"
            >
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Họ và tên</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2b8cee] transition-colors">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={fullNameVi}
                      onChange={(e) => setFullNameVi(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2b8cee]/10 focus:border-[#2b8cee] focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2b8cee] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2b8cee]/10 focus:border-[#2b8cee] focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    placeholder="admin@patientflow.vn"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mật khẩu</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2b8cee] transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#2b8cee]/10 focus:border-[#2b8cee] focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full group bg-[#2d3436] text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                >
                  Tiếp tục
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-sm font-medium text-[#2b8cee] hover:underline"
                >
                  {mode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phòng khám</label>
                <CustomSelect
                  options={tenants}
                  value={tenantId}
                  onChange={(val) => {
                    setTenantId(val)
                    setBranchId('')
                  }}
                  labelKey="nameVi"
                  valueKey="id"
                  placeholder="Chọn phòng khám"
                  icon={<Building2 className="w-5 h-5" />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Chi nhánh</label>
                <CustomSelect
                  options={branches}
                  value={branchId}
                  onChange={setBranchId}
                  labelKey="nameVi"
                  valueKey="id"
                  disabled={!tenantId}
                  placeholder="Chọn chi nhánh (Tùy chọn)"
                  icon={<MapPin className="w-5 h-5" />}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-[1] bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] bg-[#2b8cee] text-white py-4 rounded-2xl font-bold hover:bg-[#2b8cee]/90 transition-all shadow-xl shadow-[#2b8cee]/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  {mode === 'login' ? 'Đăng nhập' : 'Hoàn tất Đăng ký'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Thông tin dùng thử</p>
          <p className="text-xs font-mono text-slate-500">
            Email: <span className="text-[#2b8cee]">admin@patientflow.vn</span><br />
            Pass: <span className="text-[#2b8cee]">password</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8] px-4 relative overflow-hidden">
      {/* Abstract Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#2b8cee]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/50 relative overflow-hidden">
          <div className="text-center mb-10">
            <div className="inline-flex w-16 h-16 bg-[#2b8cee]/10 rounded-2xl items-center justify-center mb-6">
              <Stethoscope className="w-8 h-8 text-[#2b8cee]" />
            </div>
            <h1 className="text-3xl font-black text-[#2d3436] tracking-tight">ModernClinic</h1>
            <p className="text-slate-400 mt-2 font-medium">Hệ thống Phân loại Y tế AI</p>
          </div>
          <LoginForm onSuccess={() => { }} />
        </div>
      </motion.div>
    </div>
  )
}

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2d3436]/10 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-10 pt-12">
              <div className="text-center mb-10">
                <div className="inline-flex w-14 h-14 bg-[#2b8cee]/10 rounded-2xl items-center justify-center mb-6">
                  <Stethoscope className="w-7 h-7 text-[#2b8cee]" />
                </div>
                <h2 className="text-3xl font-black text-[#2d3436] tracking-tight">Chào mừng</h2>
                <p className="text-slate-400 mt-2 font-medium">Đăng nhập hoặc Đăng ký để vào hệ thống</p>
              </div>

              <LoginForm onSuccess={() => {
                onClose()
              }} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
