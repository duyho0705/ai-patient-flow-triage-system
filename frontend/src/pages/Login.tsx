import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { listTenants } from '@/api/tenants'
import { useQuery } from '@tanstack/react-query'
import {
  X, AlertCircle, Loader2, ShieldCheck, CheckCircle2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ERROR_CODES } from '@/constants'
import { useAppNavigation } from '@/hooks/useAppNavigation'
import { EnterpriseErrorUtils } from '@/utils/errors'

/* ─────────── Components ─────────── */

interface FormFieldProps {
  label: string
  icon: string
  error?: string
  touched?: boolean
  children: React.ReactNode
  className?: string
}

function FormField({ label, icon, error, touched, children, className = "" }: FormFieldProps) {
  const isInvalid = !!(error && touched)

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className={`text-slate-700 dark:text-slate-300 text-[13px] font-semibold px-1 transition-colors ${isInvalid ? 'text-red-500' : ''}`}>
        {label}
      </label>
      <div className="relative group">
        <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl transition-colors ${isInvalid ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}>
          {icon}
        </span>
        {children}
      </div>
      <AnimatePresence>
        {isInvalid && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[11px] text-red-500 font-medium px-1 mt-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════
   LoginForm — core logic for both page/modal
   ═══════════════════════════════════════ */

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: { pathname?: string; search?: string }
  onStepChange?: (step: number) => void
}

function LoginForm({ onSuccess, redirectTo, onStepChange }: LoginFormProps) {
  const [step, setStep] = useState(1)
  const { login } = useAuth()
  const { setTenant } = useTenant()
  const navigation = useAppNavigation()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: listTenants })

  useEffect(() => {
    onStepChange?.(step)
  }, [step, onStepChange])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    // Email
    if (!email) newErrors.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email không hợp lệ'

    // Password
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu'

    setFieldErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validate()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Mark all as touched
    const allTouched: Record<string, boolean> = { email: true, password: true }
    setTouched(allTouched)

    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await login({ email: email.trim(), password, tenantId: tenantId || undefined, branchId: undefined })

      if (!res?.user) {
        throw new Error("Không lấy được thông tin người dùng")
      }
      setTenant(res.user.tenantId || null, res.user.branchId || undefined)
      navigation.navigateAfterLogin(res.user as any, redirectTo?.pathname)
      onSuccess?.()
    } catch (err: any) {
      setError(EnterpriseErrorUtils.getMessage(err))
      if (err.errorCode === ERROR_CODES.AUTH_TENANT_REQUIRED) {
        setStep(2)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-3 mb-10 text-center">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Đăng nhập hệ thống
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Truy cập cổng thông tin y tế chuyên sâu
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-5">
                <FormField label="Tài khoản email" icon="alternate_email" error={fieldErrors.email} touched={touched.email}>
                  <input
                    type="email"
                    value={email}
                    onBlur={() => handleBlur('email')}
                    onChange={e => { setEmail(e.target.value); if (touched.email) validate() }}
                    className={`form-input flex w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 h-14 pl-12 pr-4 text-base focus:border-primary focus:ring-4 focus:ring-primary/5 dark:text-white placeholder:text-slate-400 transition-all outline-none font-bold ${fieldErrors.email && touched.email ? 'border-red-300 ring-red-100' : ''}`}
                    placeholder="Nhập email của bạn..."
                    required
                  />
                </FormField>

                <FormField label="Mật khẩu truy cập" icon="lock_open" error={fieldErrors.password} touched={touched.password}>
                  <div className="w-full relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onBlur={() => handleBlur('password')}
                      onChange={e => { setPassword(e.target.value); if (touched.password) validate() }}
                      className={`form-input flex w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 h-14 pl-12 pr-12 text-base focus:border-primary focus:ring-4 focus:ring-primary/5 dark:text-white placeholder:text-slate-400 transition-all outline-none font-bold ${fieldErrors.password && touched.password ? 'border-red-300 ring-red-100' : ''}`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </FormField>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded-md text-primary focus:ring-primary border-slate-300 size-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wider">Duy trì đăng nhập</span>
                </label>
                <button type="button" className="text-primary text-xs font-black uppercase tracking-widest hover:underline">Quên mật khẩu?</button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 h-14 text-sm shadow-xl shadow-slate-900/10 dark:shadow-primary/20 mt-2"
              >
                {submitting ? <Loader2 className="size-5 animate-spin" /> : <span>Xác nhận đăng nhập</span>}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-8"
          >
            <div className="flex flex-col gap-3 mb-10 text-center">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Chọn cơ sở làm việc</h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Xác thực quyền truy cập đơn vị y tế</p>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              {tenants.map((t: any) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTenantId(t.id)}
                  className={`w-full p-5 rounded-[1.5rem] border-2 transition-all flex items-center gap-4 text-left ${tenantId === t.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/30'
                    }`}
                >
                  <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${tenantId === t.id ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-400'
                    }`}>
                    <span className="material-symbols-outlined">apartment</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{t.nameVi}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.code}</p>
                  </div>
                  {tenantId === t.id && (
                    <CheckCircle2 className="size-6 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-6 flex flex-col gap-4">
              <button
                onClick={handleSubmit}
                disabled={!tenantId || submitting}
                className="w-full bg-slate-900 dark:bg-primary hover:bg-slate-800 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center justify-center gap-3"
              >
                {submitting ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
                Vào hệ thống quản trị
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                Quay lại bước trước
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════
   Login — Split screen full page
   ═══════════════════════════════════════ */

export function Login() {
  return (
    <div className="bg-[#f0f9f6] dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative flex h-full grow flex-col z-10">
        <div className="layout-container flex h-full grow flex-col">
          {/* Header */}
          <header className="flex items-center justify-between px-6 md:px-12 py-6">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                <span className="material-symbols-outlined font-bold">health_and_safety</span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">Sống Khỏe</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Healthcare Portal</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-6">
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Trang chủ</a>
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Dịch vụ</a>
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Hỗ trợ</a>
              </nav>
              <button className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black uppercase tracking-widest hover:border-primary transition-all">
                Hotline: 1900 6868
              </button>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-[1100px] flex flex-col md:flex-row items-center gap-16">
              {/* Left Side: Professional Content */}
              <div className="hidden md:flex flex-col flex-1 gap-8 text-left">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                    <span className="size-1.5 bg-primary rounded-full animate-pulse" />
                    Hệ thống quản lý y tế thông minh
                  </div>
                  <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                    Nâng cao chất lượng <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">chăm sóc sức khỏe</span>
                  </h1>
                  <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-md leading-relaxed">
                    Nền tảng quản lý bệnh mãn tính hiện đại, giúp kết nối bác sĩ và bệnh nhân một cách liền mạch, an toàn và hiệu quả.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="space-y-2">
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white">50k+</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Bệnh nhân tin dùng</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white">200+</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Phòng khám đối tác</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Login Form */}
              <div className="w-full max-w-[460px]">
                <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(16,185,129,0.15)] border border-slate-100 dark:border-slate-800 relative z-20">
                  <LoginForm />
                </div>
                
                <div className="mt-8 flex justify-center items-center gap-6 text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Bảo mật SSL</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-200 rounded-full" />
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Tiêu chuẩn HL7</span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="py-8 px-12 border-t border-slate-100/50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2024 Sồng Khỏe Healthcare Provider</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors">Điều khoản</a>
              <a href="#" className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors">Quyền riêng tư</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   LoginModal — Popup implementation
   ═══════════════════════════════════════ */

export function LoginModal({
  isOpen,
  onClose,
  redirectTo,
}: {
  isOpen: boolean
  onClose: () => void
  redirectTo?: { pathname?: string; search?: string }
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-10 size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <LoginForm onSuccess={onClose} redirectTo={redirectTo} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
