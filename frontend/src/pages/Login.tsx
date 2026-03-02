import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { listTenants } from '@/api/tenants'
import { useQuery } from '@tanstack/react-query'
import {
  X, LogIn, Mail, Lock, AlertCircle, Loader2,
  BriefcaseMedical, User, Eye, EyeOff, ShieldCheck, Heart,
  Activity,
} from 'lucide-react'
import { FaFacebook } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { motion, AnimatePresence } from 'framer-motion'
import type { RegisterRequest } from '@/types/api'
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/firebase'
import { ERROR_CODES } from '@/constants'
import { useAppNavigation } from '@/hooks/useAppNavigation'
import { EnterpriseErrorUtils } from '@/utils/errors'

/* ─────────── helpers ─────────── */

function getPasswordStrength(pw: string) {
  if (!pw) return { level: 0, label: '', color: 'transparent' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 2) return { level: 1, label: 'Yếu', color: '#ef4444' }
  if (score <= 3) return { level: 2, label: 'Trung bình', color: '#f59e0b' }
  if (score <= 4) return { level: 3, label: 'Mạnh', color: '#22c55e' }
  return { level: 4, label: 'Rất mạnh', color: '#059669' }
}

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAxurL_0mHkDSA7Xy8Ivzc16G0mL0tuBC-qzP2L6nAylR1tH6aJySP9Xn-h53lyWhTu0qDM3g7pHesLDfwkHbBck-H6ydTV0PNaAVqhWN9i5nv2I-CWCsMsPBEp1n_bN4FS3-FLyKSK5t0aJ5HIvpsYUxAxgiIv0bxmfQs6BqHY50b4qblQuxhm_of6WK5KgtBV4D-yb4o4vHDXodAgXHfj5xaNOCNpM1xNjEn2vkrm286YzltEXIO8pbuqOE8a2jQ-lyWDOUQLI3bx'

/* ═══════════════════════════════════════
   LoginForm — shared by page & modal
   ═══════════════════════════════════════ */

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: { pathname?: string; search?: string }
  initialFirebaseToken?: string
}

function LoginForm({ onSuccess, redirectTo, initialFirebaseToken }: LoginFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [step, setStep] = useState(initialFirebaseToken ? 2 : 1)
  const { login, register, socialLogin } = useAuth()
  const { setTenant } = useTenant()
  const navigation = useAppNavigation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullNameVi, setFullNameVi] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [error, setError] = useState('')
  const [hasFailed, setHasFailed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [firebaseIdToken, setFirebaseIdToken] = useState<string | null>(initialFirebaseToken || null)

  const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: listTenants })

  useEffect(() => {
    if (initialFirebaseToken) {
      setFirebaseIdToken(initialFirebaseToken)
      setStep(2)
    }
  }, [initialFirebaseToken])

  /* 
  useEffect(() => {
    if (tenants.length === 1 && !tenantId) setTenantId(tenants[0].id)
  }, [tenants, tenantId])
  */

  /* 
  // Disable auto-login to ensure user always goes through the selection step as requested
  useEffect(() => {
    let active = true
    const attemptAutoLogin = async () => {
      if (firebaseIdToken && tenants.length === 1 && tenantId && !submitting && !hasFailed) {
        setSubmitting(true)
        try {
          const res = await socialLogin({ idToken: firebaseIdToken, tenantId: tenantId, branchId: undefined })
          if (active) {
            setTenant(res.user.tenantId, res.user.branchId ?? undefined)
            setTimeout(() => {
              navigation.navigateAfterLogin(res.user, redirectTo?.pathname)
              onSuccess?.()
            }, 100)
          }
        } catch (err: any) {
          if (active) {
            setError(EnterpriseErrorUtils.getMessage(err))
            setHasFailed(true)
          }
          setSubmitting(false)
        }
      }
    }
    attemptAutoLogin()
    return () => { active = false }
  }, [firebaseIdToken, tenants.length, tenantId, navigation, onSuccess, socialLogin, setTenant, hasFailed])
  */

  const pwStrength = useMemo(() => getPasswordStrength(password), [password])

  /* ── validation + submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setHasFailed(false)

    if (!firebaseIdToken) {
      if (!email) { setError('Vui lòng nhập email.'); setStep(1); return }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Định dạng email không hợp lệ.'); setStep(1); return }
      if (!password) { setError('Vui lòng nhập mật khẩu.'); setStep(1); return }

      if (mode === 'register') {
        if (!fullNameVi.trim()) { setError('Vui lòng nhập họ và tên.'); setStep(1); return }
        if (password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự.'); setStep(1); return }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
          setError('Mật khẩu phải bao gồm chữ hoa, chữ thường và số.')
          setStep(1); return
        }
      }
    }

    // Simplified: always stay on step 1 or just skip checks for step 2
    // if (!tenantId) { setError('Vui lòng chọn phòng khám.'); return }


    setSubmitting(true)
    try {
      let res;
      if (firebaseIdToken) {
        // Complete social login flow using the selected tenant
        res = await socialLogin({ idToken: firebaseIdToken, tenantId: tenantId, branchId: undefined })
      } else {
        if (mode === 'register') {
          if (!tenantId) { setError('Vui lòng chọn phòng khám để đăng ký.'); setStep(2); return }
          const req: RegisterRequest = { email: email.trim(), password, fullNameVi: fullNameVi.trim(), tenantId, branchId: undefined }
          res = await register(req)
        } else {
          res = await login({ email: email.trim(), password, tenantId: tenantId || undefined, branchId: undefined })
        }
      }

      setTenant(res.user.tenantId, res.user.branchId ?? undefined)

      navigation.navigateAfterLogin(res.user, redirectTo?.pathname) // Fixed: hook handle basic redirect or pass targetPath
      onSuccess?.()
    } catch (err: any) {
      setError(EnterpriseErrorUtils.getMessage(err))
      if (firebaseIdToken) {
        setHasFailed(true)
      } else {
        setStep(1)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    setError('')
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider()
      provider.addScope('email')
      const result = await signInWithPopup(auth, provider)
      if (result.user) {
        const token = await result.user.getIdToken()
        setFirebaseIdToken(token)
        setStep(2) // Luôn đi đến bước chọn phòng khám as requested
      }
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/popup-closed-by-user') return
      setError(err?.message || `Lỗi khi đăng nhập bằng ${providerName}`)
    }
  }

  const switchMode = () => { setMode(m => m === 'login' ? 'register' : 'login'); setStep(1); setError(''); setFirebaseIdToken(null) }

  return (
    <>
      {/* Logo + heading could go here if needed, but keeping it clean */}


      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {/* Full name (register only) */}
                {mode === 'register' && (
                  <Field label="Họ và tên" icon={<User className="w-4 h-4" />} value={fullNameVi} onChange={setFullNameVi} placeholder="Nguyễn Văn A" />
                )}

                {/* Email */}
                <Field label="Email" icon={<Mail className="w-4 h-4" />} type="email" value={email} onChange={setEmail} placeholder="name@example.com" />

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Mật khẩu</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 group-focus-within:text-[#4ade80] transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:border-[#4ade80] focus:ring-[3px] focus:ring-[#4ade80]/10 transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button" tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength (register) */}
                  {mode === 'register' && password && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          animate={{ width: `${(pwStrength.level / 4) * 100}%`, backgroundColor: pwStrength.color }}
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: pwStrength.color }}>
                        {pwStrength.label}
                      </span>
                    </motion.div>
                  )}
                </div>

                <motion.button
                  type="submit" disabled={submitting}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-[#4ade80] to-[#2fb344] text-slate-900 text-sm font-bold shadow-lg shadow-[#4ade80]/20 disabled:opacity-60 transition-shadow"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  {mode === 'login' ? 'Tiếp tục' : 'Tiếp tục đăng ký'}
                </motion.button>
              </div>
            </form>

            {/* Social Login Section */}
            <div className="mt-6">
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 font-medium uppercase tracking-widest">Hoặc tiếp tục với</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button" onClick={() => handleSocialLogin('google')}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FcGoogle className="w-5 h-5" />
                  <span className="text-sm font-bold text-slate-700">Google</span>
                </motion.button>
                <motion.button
                  type="button" onClick={() => handleSocialLogin('facebook')}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-full hover:bg-[#1877F2]/10 transition-colors shadow-sm"
                >
                  <FaFacebook className="w-5 h-5 text-[#1877F2]" />
                  <span className="text-sm font-bold text-slate-700">Facebook</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#4ade80]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BriefcaseMedical className="w-6 h-6 text-[#4ade80]" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Chọn phòng khám</h3>
              <p className="text-xs text-slate-500 font-medium">Vui lòng chọn cơ sở y tế bạn muốn truy cập</p>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {tenants.map((t: any) => (
                <motion.div
                  key={t.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTenantId(t.id)}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${tenantId === t.id
                    ? 'border-[#4ade80] bg-[#4ade80]/5 shadow-md shadow-[#4ade80]/10'
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tenantId === t.id ? 'bg-[#4ade80] text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                    <BriefcaseMedical className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${tenantId === t.id ? 'text-slate-900' : 'text-slate-600'}`}>
                      {t.nameVi}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {t.code}
                    </p>
                  </div>
                  {tenantId === t.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <ShieldCheck className="w-5 h-5 text-[#4ade80]" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
                onClick={handleSubmit} disabled={submitting || !tenantId}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-[#4ade80] to-[#2fb344] text-slate-900 text-sm font-bold shadow-lg shadow-[#4ade80]/20 disabled:opacity-60 transition-shadow"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Xác nhận & Vào hệ thống
              </motion.button>

              <button
                type="button" onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest py-2"
              >
                Quay lại
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer: switch mode */}
      <div className="mt-8 pt-6 border-t border-slate-100/60 text-center">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">
          {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
        </p>
        <button
          type="button"
          onClick={switchMode}
          className="w-full py-3.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-[#4ade80]/40 hover:text-[#4ade80] transition-all active:scale-[0.98] shadow-sm hover:shadow-md hover:shadow-[#4ade80]/5"
        >
          {mode === 'login' ? 'Đăng ký thành viên mới' : 'Quay lại Đăng nhập'}
        </button>
      </div>
    </>
  )
}

/* ─── reusable input field ─── */
function Field({ label, icon, type = 'text', value, onChange, placeholder }: {
  label: string; icon: React.ReactNode; type?: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">{label}</label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 group-focus-within:text-[#4ade80] transition-colors pointer-events-none">
          {icon}
        </div>
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:border-[#4ade80] focus:ring-[3px] focus:ring-[#4ade80]/10 transition-all"
          placeholder={placeholder} required
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   Login — full‑page (split‑screen)
   ═══════════════════════════════════════ */

export function Login() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* ── Left: Hero ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img src={HERO_IMG} alt="Sống Khỏe" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-white/10" />

        <motion.div
          className="relative z-10 flex flex-col justify-end h-full p-10"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-bold w-fit mb-5">
            <BriefcaseMedical className="w-5 h-5 text-[#4ade80]" strokeWidth={2.5} /> Sống Khỏe
          </div>

          <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3 shadow-md">
            Quản lý bệnh<br />
            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
              Mãn tính Toàn diện
            </span>
          </h2>
          <p className="text-white/85 text-sm max-w-md font-medium leading-relaxed mb-8 shadow-md">
            Giải pháp y tế số tiên phong — kết nối bệnh nhân, chuyên gia và công nghệ để nâng tầm chất lượng sống mỗi ngày.
          </p>

          {/* Stats */}
          <div className="flex gap-4">
            <StatCard icon={<Heart className="w-5 h-5" />} value="10,000+" label="Bệnh nhân" />
            <StatCard icon={<ShieldCheck className="w-5 h-5" />} value="99.9%" label="Uptime" />
            <StatCard icon={<Activity className="w-5 h-5" />} value="24/7" label="Hỗ trợ" />
          </div>
        </motion.div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-white">
        {/* Decorative blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#4ade80]/25 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-8%] w-[50vw] h-[50vw] rounded-full bg-emerald-400/20 blur-[120px] pointer-events-none" />

        <motion.div
          className="w-full max-w-[420px] relative z-10"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}
        >
          {/* Logo + heading */}
          <div className="mb-8">
            <Link to="/">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.05 }}
                className="mb-4"
              >
                <BriefcaseMedical className="w-12 h-12 text-[#4ade80]" strokeWidth={2.5} />
              </motion.div>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Chào mừng trở lại</h1>
            <p className="text-sm text-slate-500 font-semibold italic">Đăng nhập để truy cập hệ thống</p>
          </div>

          <LoginForm initialFirebaseToken={location.state?.firebaseToken} />
        </motion.div>
      </div>
    </div>
  )
}

/* ─── hero stat card ─── */
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[.08] backdrop-blur-md border border-white/10">
      <div className="w-9 h-9 rounded-lg bg-[#4ade80]/20 flex items-center justify-center text-[#4ade80]">{icon}</div>
      <div>
        <p className="text-base font-extrabold text-white">{value}</p>
        <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   LoginModal — popup overlay
   ═══════════════════════════════════════ */

export function LoginModal({
  isOpen,
  onClose,
  redirectTo,
  initialFirebaseToken,
}: {
  isOpen: boolean
  onClose: () => void
  redirectTo?: { pathname?: string; search?: string }
  initialFirebaseToken?: string
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute right-5 top-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 pt-10">
              {/* Header */}
              <div className="text-center mb-6">
                <Link to="/" className="inline-flex items-center justify-center mb-4">
                  <BriefcaseMedical className="w-10 h-10 text-[#4ade80]" strokeWidth={2.5} />
                </Link>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Chào mừng đến Sống Khỏe</h2>
              </div>

              <LoginForm onSuccess={onClose} redirectTo={redirectTo} initialFirebaseToken={initialFirebaseToken} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
