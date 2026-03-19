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
    (item) => !item.roles || (user?.roles && item.roles.some((r) => user.roles?.includes(r)))
  )

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true, state: { openLogin: true } })
  }

  return (
    <div className="h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display flex antialiased">
      {/* ═══════════ Sidebar - Desktop (100% FontText.html) ═══════════ */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-primary/10 flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Sống Khỏe</h1>

          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto scrollbar-hide">
          {visibleNav.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} className="px-4 py-3 text-[10px] font-black text-slate-400 tracking-tight mt-6 first:mt-2">
                  {item.label}
                </div>
              )
            }
            const { to, label } = item
            const isActive = location.pathname === to || (to !== '/dashboard' && to && location.pathname.startsWith(to))

            // Icon mapping for material symbols
            let iconName = 'dashboard'
            if (label.toLowerCase().includes('bệnh nhân')) iconName = 'group'
            if (label.toLowerCase().includes('người dùng')) iconName = 'group'
            if (label.toLowerCase().includes('vai trò')) iconName = 'shield_person'
            if (label.toLowerCase().includes('lịch hẹn') || label.toLowerCase().includes('scheduling')) iconName = 'calendar_today'
            if (label.toLowerCase().includes('tin nhắn') || label.toLowerCase().includes('chat')) iconName = 'chat_bubble'
            if (label.toLowerCase().includes('đơn thuốc') || label.toLowerCase().includes('prescriptions')) iconName = 'description'
            if (label.toLowerCase().includes('phân tích') || label.toLowerCase().includes('analytics')) iconName = 'monitoring'
            if (label.toLowerCase().includes('thống kê') || label.toLowerCase().includes('reports')) iconName = 'assessment'
            if (label.toLowerCase().includes('bảng điều khiển') || label.toLocaleLowerCase() === 'dashboard') iconName = 'dashboard'
            if (label.toLowerCase().includes('phòng khám')) iconName = 'apartment'
            if (label.toLowerCase().includes('bệnh lý') || label.toLowerCase().includes('disease')) iconName = 'microbiology'
            if (label.toLowerCase().includes('nhật ký') || label.toLowerCase().includes('audit')) iconName = 'history_edu'
            if (label.toLowerCase().includes('cài đặt') || label.toLowerCase().includes('settings')) iconName = 'settings'

            return (
              <Link
                key={idx}
                to={to || '#'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary font-medium'
                  }`}
              >
                <span
                  className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {iconName}
                </span>
                <span className="text-sm tracking-tight">{label}</span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-lg font-black ${isActive ? 'bg-white text-primary' : 'bg-red-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-primary/5 dark:bg-slate-800/50 rounded-2xl p-4 border border-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white dark:ring-slate-700 shadow-sm shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt="Admin Profile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuRBpLgHBDUQc-pBZeoNg7p5zyQhhWF0e0vOl1QrSZGoM8jsEmo5V8T5IKpxCoETrcB9m0yonrlwc5cTgeLd4GJ-EtIlbH2mbgZz3XY900jbDCLoPrnmU23ZVNw-4xXGTgftV-HaIe3mF_keVr1O92VDXOUR6xRD6cKx2JGXmoq61v566EK4ZPxvKxj-d2A1iybYsz5QwMjNknVLGSZVPG7x2CSpC81mIJtvMsvWKk8zp9Uzq22yOXgW0Gp9cxjT9AYlACWxGJcNY"
                />
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{user?.fullNameVi || 'Quản trị viên'}</p>
                <p className="text-[10px] text-slate-500 font-bold truncate tracking-widest">{user?.email || 'admin@songkhoe.vn'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all tracking-widest shadow-sm border border-transparent hover:border-red-100"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ═══════════ Mobile Sidebar Overlay ═══════════ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══════════ Main Content Area ═══════════ */}
      <main className="flex-1 lg:ml-72 flex flex-col min-w-0 overflow-hidden relative">
        {/* ─── Top Navbar (100% FontText.html) ─── */}
        <header
          className="h-20 border-b border-primary/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 text-slate-500 lg:hidden hover:bg-slate-100 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative max-w-md w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-background-light dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/40 text-sm font-semibold placeholder:text-slate-400 transition-all shadow-inner"
                placeholder="Tìm kiếm dữ liệu, bệnh nhân, hoặc báo cáo..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="size-10 flex items-center justify-center bg-background-light dark:bg-slate-800 text-slate-500 hover:text-primary rounded-xl transition-all relative group">
              <span className="material-symbols-outlined transition-transform group-hover:scale-110">notifications</span>
              <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white bg-background-light dark:bg-slate-800 px-4 py-2 rounded-xl border border-primary/5 tracking-tight">
                Thứ 2, 16 Tháng 3
              </span>
            </div>
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <div className={`flex-1 flex flex-col ${location.pathname.includes('/chat') ? 'overflow-hidden' : 'overflow-y-auto scrollbar-hide'}`}>
          <Outlet />
          {/* Footer spacing */}
          {!location.pathname.includes('/chat') && (
            <div className="h-12 w-full shrink-0"></div>
          )}
        </div>
      </main>
    </div>
  )
}
