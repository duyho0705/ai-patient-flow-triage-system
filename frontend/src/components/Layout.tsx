import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'

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
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex antialiased">
      {/* ═══════════ Sidebar - Desktop (100% FontText.html) ═══════════ */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col sticky top-0 h-screen z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined font-bold">health_and_safety</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Sống Khỏe</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {visibleNav.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6 first:mt-2">
                  {item.label}
                </div>
              )
            }
            const { to, label } = item
            const isActive = location.pathname === to || (to !== '/dashboard' && to && location.pathname.startsWith(to))

            // Icon mapping for material symbols
            let iconName = 'dashboard'
            if (label.toLowerCase().includes('bệnh nhân')) iconName = 'group'
            if (label.toLowerCase().includes('lịch hẹn')) iconName = 'calendar_today'
            if (label.toLowerCase().includes('tin nhắn') || label.toLowerCase().includes('chat')) iconName = 'chat_bubble'
            if (label.toLowerCase().includes('đơn thuốc')) iconName = 'pill'
            if (label.toLowerCase().includes('phân tích')) iconName = 'monitoring'
            if (label.toLowerCase().includes('báo cáo')) iconName = 'description'
            if (label.toLowerCase().includes('quản lý')) iconName = 'admin_panel_settings'

            return (
              <Link
                key={idx}
                to={to || '#'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform duration-200 group-hover:scale-110 ${isActive ? 'fill-[1]' : ''}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {iconName}
                </span>
                <span className={`font-bold text-sm tracking-tight ${isActive ? '' : 'font-semibold'}`}>{label}</span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black ${isActive ? 'bg-primary text-white' : 'bg-red-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-45 transition-transform duration-500">settings</span>
            <span className="font-bold text-sm tracking-tight">Cài đặt</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">logout</span>
            <span className="font-bold text-sm tracking-tight">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ═══════════ Mobile Sidebar Overlay ═══════════ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══════════ Mobile Sidebar ═══════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-64 transform bg-white dark:bg-slate-900 transition-transform duration-500 ease-in-out lg:hidden shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm">health_and_safety</span>
            </div>
            <h1 className="text-lg font-black tracking-tight">Sống Khỏe</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="size-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="px-4 py-4 space-y-1">
          {visibleNav.map((item, idx) => (
            <Link
              key={idx}
              to={item.to || '#'}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${location.pathname === item.to ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-xl">{item.label.toLowerCase().includes('bệnh nhân') ? 'group' : 'dashboard'}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* ═══════════ Main Content Area ═══════════ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* ─── Top Navbar (100% FontText.html) ─── */}
        <header
          className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-500 lg:hidden hover:bg-slate-100 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative max-w-md w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm font-semibold placeholder:text-slate-400 transition-all"
                placeholder="Tìm kiếm bệnh nhân, hồ sơ..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black leading-none text-slate-900 dark:text-white uppercase tracking-tight">{user?.fullNameVi || 'BS. Lê Mạnh Hùng'}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {user?.roles?.[0] === 'doctor' ? 'Khoa Nội Tổng Quát' : 'Quản lý phòng khám'}
                </p>
              </div>
              <div className="size-10 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/10">
                <img
                  className="w-full h-full object-cover"
                  alt="Doctor Profile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuRBpLgHBDUQc-pBZeoNg7p5zyQhhWF0e0vOl1QrSZGoM8jsEmo5V8T5IKpxCoETrcB9m0yonrlwc5cTgeLd4GJ-EtIlbH2mbgZz3XY900jbDCLoPrnmU23ZVNw-4xXGTgftV-HaIe3mF_keVr1O92VDXOUR6xRD6cKx2JGXmoq61v566EK4ZPxvKxj-d2A1iybYsz5QwMjNknVLGSZVPG7x2CSpC81mIJtvMsvWKk8zp9Uzq22yOXgW0Gp9cxjT9AYlACWxGJcNY"
                />
              </div>
            </div>
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <div className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col ${location.pathname.includes('/chat') ? '' : 'p-0'}`}>
          <Outlet />
          {/* Footer spacing */}
          <div className="h-12 w-full shrink-0"></div>
        </div>
      </main>
    </div>
  )
}
