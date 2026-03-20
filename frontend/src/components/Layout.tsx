import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { useState, useEffect } from 'react'
import { STAFF_NAV } from '@/routes/staffNav'
import { requestForToken, onForegroundMessage, db } from '@/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Search, Bell, Menu, X, LogOut, Activity, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { tenantId } = useTenant()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user || !tenantId) return
    requestForToken().then(async (token) => {
      if (token && user?.id) {
        await setDoc(doc(db, 'users', user.id), {
          fcmToken: token,
          lastSeenAt: serverTimestamp(),
          userType: 'STAFF',
          name: user?.fullNameVi || ''
        }, { merge: true }).catch(err => console.warn('Lỗi lưu token:', err));
      }
    }).catch(err => console.warn('FCM token error:', err))

    const unsubscribe = onForegroundMessage((payload) => {
      toast.success(payload?.notification?.body || "Bạn có thông báo mới", {
        icon: '🔔',
        position: 'top-right',
        duration: 5000,
      });
    });
    return () => unsubscribe()
  }, [user, tenantId])

  const visibleNav = STAFF_NAV.filter(
    (item) => !item.roles || (user?.roles && item.roles.some((r) => user.roles?.includes(r)))
  )

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true, state: { openLogin: true } })
  }

  return (
    <div className="h-screen overflow-hidden bg-[#FBF8FD] font-display flex antialiased">
      {/* ═══════════ Sidebar ═══════════ */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-[#F3EDF7] transition-transform duration-300 lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col border-r border-[#E0E0E0]/30
      `}>
        {/* Sidebar Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-md-primary rounded-[16px] flex items-center justify-center text-white shadow-elevation-2">
              <Activity size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-md-on-surface">Acme Health</h1>
              <p className="text-[10px] font-bold text-md-primary uppercase tracking-widest opacity-70">Staff Portal</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-md-primary/10">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {visibleNav.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} className="px-5 pt-6 pb-2 text-[11px] font-bold text-md-on-surface-variant uppercase tracking-widest opacity-60">
                  {item.label}
                </div>
              )
            }
            const { to, label } = item
            const isActive = location.pathname === to || (to !== '/dashboard' && to && location.pathname.startsWith(to))
            const Icon = item.icon || Activity

            return (
              <Link
                key={idx}
                to={to || '#'}
                className={`
                  flex items-center gap-4 px-5 py-3.5 rounded-full transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-md-secondary-container text-md-on-secondary-container font-bold' 
                    : 'text-md-on-surface-variant hover:bg-md-primary/5 font-medium'}
                `}
              >
                <div className="flex items-center justify-center size-6 group-hover:scale-110 transition-transform">
                   <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[15px] tracking-tight">{label}</span>
                {item.badge && (
                  <span className={`ml-auto text-[11px] px-2.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-md-primary text-white' : 'bg-md-error text-white'}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute inset-0 bg-md-secondary-container rounded-full -z-10" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 mx-4 mb-6 mt-auto bg-white rounded-[28px] shadow-elevation-1 border border-md-outline/5 hover:shadow-elevation-2 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-full bg-md-primary-container text-md-primary flex items-center justify-center p-0.5 border-2 border-white overflow-hidden shadow-sm">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-md-on-surface truncate tracking-tight">{user?.fullNameVi || 'Staff Member'}</p>
              <p className="text-[10px] text-md-on-surface-variant font-medium truncate opacity-70 uppercase tracking-wider">{user?.roles?.[0] || 'Member'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-md-error-container text-md-on-error-container rounded-2xl text-xs font-bold hover:bg-md-error hover:text-white transition-all active:scale-95"
          >
            <div className="flex items-center gap-2">
              <LogOut size={14} />
              <span>Log out</span>
            </div>
            <ChevronRight size={14} />
          </button>
        </div>
      </aside>

      {/* ═══════════ Mobile Sidebar Overlay ═══════════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] bg-black/30 backdrop-blur-sm lg:hidden transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* ═══════════ Main Content Area ═══════════ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* ─── Top Navbar ─── */}
        <header className="h-20 lg:h-24 sticky top-0 z-40 px-8 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-md-outline/5">
          <div className="flex items-center gap-6 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 text-md-on-surface-variant lg:hidden hover:bg-md-primary/10 rounded-full transition-all active:scale-90"
            >
              <Menu size={24} />
            </button>
            <div className="relative max-w-lg w-full group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/50 group-focus-within:text-md-primary transition-colors" size={20} />
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-md-surface-container-low rounded-full border-none focus:ring-2 focus:ring-md-primary/30 text-[15px] font-medium placeholder:text-md-on-surface-variant/40 transition-all shadow-sm group-hover:bg-md-surface-container"
                placeholder="Search patient, records, or help..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="size-12 flex items-center justify-center bg-md-surface-container-low text-md-on-surface-variant hover:text-md-primary rounded-full transition-all relative group shadow-sm active:scale-90">
              <Bell size={22} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-3 right-3.5 size-2.5 bg-md-error rounded-full border-2 border-white shadow-sm" />
            </button>

            <div className="h-8 w-px bg-md-outline/10 mx-2 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-3 bg-md-surface-container-low px-5 py-2.5 rounded-full border border-md-outline/5 shadow-sm">
                <div className="size-2 rounded-full bg-md-primary animate-pulse" />
                <span className="text-sm font-bold text-md-on-surface-variant tracking-tight">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
            </div>
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <div className={`flex-1 flex flex-col bg-white overflow-y-auto custom-scrollbar`}>
          <div className="p-8 max-w-[1600px] w-full mx-auto">
             <Outlet />
          </div>
          {/* Footer spacing */}
          <div className="h-12 w-full shrink-0"></div>
        </div>
      </main>
    </div>
  )
}
