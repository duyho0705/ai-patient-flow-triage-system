import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { listTenants } from '@/api/tenants'
import { useQuery } from '@tanstack/react-query'
import {
  X, AlertCircle, Loader2, ShieldCheck, CheckCircle2, Eye, EyeOff, Building2, Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ERROR_CODES } from '@/constants'
import { useAppNavigation } from '@/hooks/useAppNavigation'
import { EnterpriseErrorUtils } from '@/utils/errors'

/* ─────────── Components ─────────── */

interface FormFieldProps {
  label: string
  error?: string
  touched?: boolean
  children: React.ReactNode
  className?: string
}

function FormField({ label, error, touched, children, className = "" }: FormFieldProps) {
  const isInvalid = !!(error && touched)

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="relative group">
        {children}
        <label className={`absolute left-4 top-2 text-[11px] font-medium transition-colors ${
          isInvalid ? 'text-md-error' : 'text-md-primary group-focus-within:text-md-primary'
        }`}>
          {label}
        </label>
      </div>
      <AnimatePresence>
        {isInvalid && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11px] text-md-error font-medium px-4"
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
    if (!email) newErrors.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email không hợp lệ'
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
    const allTouched: Record<string, boolean> = { email: true, password: true }
    setTouched(allTouched)
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await login({ email: email.trim(), password, tenantId: tenantId || undefined, branchId: undefined })
      if (!res?.user) throw new Error("Không lấy được thông tin người dùng")
      setTenant(res.user.tenantId || null, res.user.branchId || undefined)
      navigation.navigateAfterLogin(res.user as any, redirectTo?.pathname)
      onSuccess?.()
    } catch (err: any) {
      setError(EnterpriseErrorUtils.getMessage(err))
      if (err.errorCode === ERROR_CODES.AUTH_TENANT_REQUIRED) setStep(2)
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          >
            <div className="space-y-2 mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-md-on-surface">Welcome back</h1>
              <p className="text-md-on-surface-variant font-normal">Enter your details to access your health portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-md-error-container text-md-on-error-container text-sm font-medium border border-md-error/10">
                  <AlertCircle className="size-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <FormField label="Email address" error={fieldErrors.email} touched={touched.email}>
                  <input
                    type="email"
                    value={email}
                    onBlur={() => handleBlur('email')}
                    onChange={e => { setEmail(e.target.value); if (touched.email) validate() }}
                    className={`input pt-7 ${fieldErrors.email && touched.email ? 'border-md-error' : ''}`}
                    placeholder="name@example.com"
                    required
                  />
                </FormField>

                <FormField label="Password" error={fieldErrors.password} touched={touched.password}>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onBlur={() => handleBlur('password')}
                      onChange={e => { setPassword(e.target.value); if (touched.password) validate() }}
                      className={`input pt-7 pr-12 ${fieldErrors.password && touched.password ? 'border-md-error' : ''}`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 bottom-3 text-md-on-surface-variant hover:text-md-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </FormField>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="size-5 rounded-md border-2 border-md-outline checked:bg-md-primary checked:border-md-primary transition-all cursor-pointer"
                  />
                  <span className="text-sm font-medium text-md-on-surface-variant">Remember me</span>
                </label>
                <button type="button" className="text-md-primary text-sm font-bold hover:underline">Forgot password?</button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full h-14 text-base font-bold shadow-elevation-2 mt-4"
              >
                {submitting ? <Loader2 className="size-6 animate-spin" /> : <span>Sign in</span>}
              </button>
              
              <p className="text-center text-sm text-md-on-surface-variant pt-4 font-normal">
                Don't have an account? <button type="button" className="text-md-primary font-bold hover:underline">Request access</button>
              </p>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="space-y-8"
          >
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-md-on-surface">Select Clinic</h1>
              <p className="text-md-on-surface-variant font-normal">Choose the healthcare facility you want to access</p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {tenants.map((t: any) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTenantId(t.id)}
                  className={`w-full p-4 rounded-[24px] border-2 transition-all flex items-center gap-4 text-left group ${tenantId === t.id
                    ? 'border-md-primary bg-md-primary-container text-md-on-primary-container shadow-elevation-1'
                    : 'border-transparent bg-md-surface-container-low hover:bg-md-primary/5'
                    }`}
                >
                  <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${tenantId === t.id ? 'bg-md-primary text-white' : 'bg-md-surface-container text-md-primary'}`}>
                    <Building2 size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-md leading-tight">{t.nameVi}</h4>
                    <p className={`text-[11px] font-medium uppercase tracking-wider mt-1 ${tenantId === t.id ? 'opacity-80' : 'text-md-on-surface-variant opacity-70'}`}>{t.code}</p>
                  </div>
                  {tenantId === t.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-md-primary rounded-full p-1">
                      <CheckCircle2 className="size-5 text-white" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-6 flex flex-col gap-4">
              <button
                onClick={handleSubmit}
                disabled={!tenantId || submitting}
                className="btn-primary w-full h-14 text-base font-bold shadow-elevation-2"
              >
                {submitting ? <Loader2 className="size-6 animate-spin" /> : <div className="flex items-center gap-2"><ShieldCheck size={20} /> <span>Enter System</span></div>}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 text-sm font-bold text-md-on-surface-variant hover:text-md-primary transition-colors text-center"
              >
                Back to credentials
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
    <div className="bg-white min-h-screen flex flex-col relative overflow-hidden selection:bg-md-primary/20">
      {/* Organic Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#F3EDF7] -z-0 rounded-l-[100px] hidden lg:block" />
      <div className="blur-blob size-[600px] bg-md-primary/5 top-[-10%] right-[-5%]" />
      <div className="blur-blob size-[400px] bg-md-tertiary/5 bottom-[10%] left-[-5%]" />

      <div className="relative flex h-full grow flex-col z-10">
        <div className="max-w-[1440px] mx-auto w-full flex h-full grow flex-col px-6">
          {/* Header */}
          <header className="flex items-center justify-between py-8">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-md-primary flex items-center justify-center text-white shadow-elevation-1">
                <Activity size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-md-on-surface">Acme Inc.</h1>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center py-12">
            <div className="w-full grid lg:grid-cols-[1.2fr,1fr] items-center gap-16 lg:gap-32">
              {/* Left Side */}
              <div className="hidden lg:flex flex-col gap-12">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-md-primary/10 text-md-primary text-xs font-bold uppercase tracking-widest">
                    Digital Health Platform
                  </div>
                  <h1 className="text-7xl xl:text-8xl font-black text-md-on-surface leading-[1.05] tracking-tight">
                    Healthcare <br />
                    <span className="text-md-primary">Reimagined</span>
                  </h1>
                  <p className="text-xl text-md-on-surface-variant max-w-lg leading-relaxed font-normal">
                    Empowering patients and clinicians with data-driven insights and AI-powered personalized care.
                  </p>
                </div>

                <div className="flex gap-16">
                  <div className="space-y-2">
                    <h4 className="text-5xl font-bold text-md-on-surface tracking-tight">50k+</h4>
                    <p className="text-sm font-medium text-md-on-surface-variant opacity-70">Active Patients</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-5xl font-bold text-md-on-surface tracking-tight">200+</h4>
                    <p className="text-sm font-medium text-md-on-surface-variant opacity-70">Clinic Partners</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Login Form */}
              <div className="w-full max-w-[480px] mx-auto lg:mx-0">
                <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-elevation-3 border border-md-outline/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-md-primary/10" />
                  <LoginForm />
                </div>

                <div className="mt-10 flex justify-center items-center gap-12 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="size-6 text-md-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">SSL Security</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Activity className="size-6 text-md-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">HL7 Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="py-8 border-t border-md-outline/5 flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-medium text-md-on-surface-variant/60">
            <p>© 2024 Acme Health. Personalized care for everyone.</p>
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-md-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-md-primary transition-colors">Privacy Policy</a>
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
            className="absolute inset-0 bg-md-on-surface/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[480px] bg-white rounded-[40px] shadow-elevation-3 overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-md-surface-container rounded-full mt-4" />

            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-30 size-10 flex items-center justify-center rounded-full bg-md-surface-container/50 text-md-on-surface-variant hover:bg-md-error-container hover:text-md-error transition-all active:scale-90"
            >
              <X size={24} />
            </button>

            <div className="p-10 md:p-14 max-h-[90vh] overflow-y-auto custom-scrollbar pt-16">
              <LoginForm onSuccess={onClose} redirectTo={redirectTo} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
