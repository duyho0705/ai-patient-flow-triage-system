import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'

import { LogOut, Menu, X, Search, Bell, Settings, BriefcaseMedical } from 'lucide-react'
import { useState, useEffect } from 'react'
import { STAFF_NAV } from '@/routes/staffNav'
import { requestForToken, onForegroundMessage, db } from '@/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { tenantId } = useTenant()
  const [sidebarOpen, setSidebarOpen] = useState(false)



  useEffect(() => {
    if (!user || !tenantId) return

    // Request token on layout mount
    requestForToken().then(async (token) => {
      if (token && user?.id) {
        // Lưu token vào Firestore để Cloud Functions có thể truy cập
        await setDoc(doc(db, 'users', user.id), {
          fcmToken: token,
          lastSeenAt: serverTimestamp(),
          userType: 'DOCTOR',
          name: user?.fullNameVi || ''
        }, { merge: true }).catch(err => console.warn('Lỗi lưu token:', err));
      }
    }).catch(err => console.warn('FCM token error:', err))

    // Handle foreground push notifications
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Foreground push notification:", payload);
      toast.success(
        payload?.notification?.body || "Bạn có thông báo mới",
        {
          icon: '🔔',
          position: 'top-right',
          duration: 5000,
        }
      );
    });

    return () => {
      unsubscribe();
    }
  }, [user, tenantId])

  const visibleNav = STAFF_NAV.filter(
    (item) => !item.roles || (user?.roles && item.roles.some((r) => user.roles.includes(r)))
  )

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true, state: { openLogin: true } })
  }



  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex">
      {/* ═══════════ Sidebar - Desktop (matching FontText.html) ═══════════ */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-primary/10 z-40">
        {/* Brand */}
        <Link to="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl text-white">
            <BriefcaseMedical className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">Sống Khỏe</h1>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">Hệ thống quản lý</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {visibleNav.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-4 first:mt-0">
                  {item.label}
                </div>
              )
            }
            const { to, label, icon: Icon } = item
            const isActive = location.pathname === to || (to !== '/dashboard' && to && location.pathname.startsWith(to))
            return (
              <Link
                key={idx}
                to={to || '#'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                  }`}
              >
                {Icon && <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />}
                <span className="flex-1 truncate text-sm">{label}</span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Doctor Profile Card (bottom) */}
        <div className="p-4 mt-auto">
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black text-sm">
                {user?.fullNameVi?.split(' ').pop()?.substring(0, 2).toUpperCase() || 'BS'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.fullNameVi || 'Bác sĩ'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.roles?.[0] === 'DOCTOR' ? 'Chuyên khoa Nội' : (user?.roles?.[0] || 'Bác sĩ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ═══════════ Mobile Sidebar Overlay ═══════════ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══════════ Mobile Sidebar ═══════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-slate-900 transition-transform duration-300 ease-out md:hidden shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl text-white">
              <BriefcaseMedical className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-white leading-none">Sống Khỏe</span>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider">Hệ thống quản lý</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col gap-1 px-4 py-4 overflow-y-auto">
          {visibleNav.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2">
                  {item.label}
                </div>
              )
            }
            const isActive = location.pathname === item.to
            return (
              <Link
                key={idx}
                to={item.to || '#'}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                  }`}
              >
                {item.icon && <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />}
                <span className="flex-1 truncate text-sm">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </aside>

      {/* ═══════════ Main Content Area ═══════════ */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* ─── Top Bar (sticky, matching FontText.html) ─── */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-primary/5 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-slate-700 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:block w-96 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bệnh nhân, hồ sơ..."
                className="w-full pl-10 pr-4 py-2.5 bg-background-light dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/50 placeholder-slate-400 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-light dark:bg-slate-800 text-slate-600 hover:text-primary relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-background-light dark:bg-slate-800 text-slate-600 hover:text-primary transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

            <Link
              to="/patients"
              className="bg-primary hover:bg-primary/90 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all"
            >
              <BriefcaseMedical className="w-4 h-4" />
              Thêm bệnh nhân
            </Link>
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <div className={`flex-1 flex flex-col min-h-0 w-full ${location.pathname.includes('/chat') ? '' : 'p-8'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
