import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { TenantSelect } from './TenantSelect'

import { LogOut, Menu, HeartPulse, Plus, X, Search, Bell, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { STAFF_NAV } from '@/routes/staffNav'
import { motion } from 'framer-motion'

export function Layout() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDateVi = (date: Date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { tenantId, branchId } = useTenant()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const visibleNav = STAFF_NAV.filter(
    (item) => !item.roles || (user?.roles && item.roles.some((r) => user.roles.includes(r)))
  )

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true, state: { openLogin: true } })
  }

  return (
    <div className="min-h-screen bg-background-light-blue dark:bg-background-dark-blue flex">
      {/* Sidebar - Desktop matching Dashboard.html */}
      <aside className="hidden w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 md:flex md:flex-col md:fixed md:inset-y-0 shadow-xl shadow-slate-200/20 z-40">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-blue-600 rounded-xl p-2.5 text-white shadow-lg shadow-blue-600/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-blue-600 tracking-tightest">ChronicCare</h2>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {visibleNav.map((item) => {
            const { to, label, icon: Icon } = item
            const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group relative ${isActive
                  ? 'bg-blue-600/10 text-blue-600'
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {item.badge && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black shadow-lg shadow-red-500/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <img
                  className="w-10 h-10 rounded-2xl object-cover shadow-sm ring-2 ring-white"
                  alt="Doctor profile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJrcXkFjPjaMjzW1d4ygCY_6SnjmIIHO1Q8WUsNjVPojS6_xzCsYEyZF4divSLTLKdaw4MKV6ZPSXLhzoWy8bWNiAuA4zO1QzWeo1xp32R-bqPpuJTpWQZq_T9igarVD8x8v-trzK-r2AIl_FbuSk_23BvbfzLWocEwFGPRdqFVWVDX9qQ_XDIn9-tHEDsUOeE5j_0wBeiZxrH7pjjkQR6Njrd7FwsvoQOPgoZRcBSZNYRtZcpf9O_1Rcs9TIR1N01vZ_woylEsfo"
                />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user?.fullNameVi || 'BS. Nguyễn Văn A'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">Chuyên khoa Nội tiết</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/consultation')}
              className="w-full bg-blue-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo toa thuốc
            </button>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-slate-900 transition-transform duration-300 ease-out md:hidden shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-20 items-center justify-between px-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-2 text-white">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="font-black text-blue-600 text-lg tracking-tightest">ChronicCare</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col gap-2 p-6">
          {visibleNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all ${location.pathname === item.to
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.badge && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-72 min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 dark:bg-slate-900/80 px-8 backdrop-blur-md">
          <div className="flex flex-1 items-center gap-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-slate-700 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Global Search Bar */}
            <div className="relative flex-1 max-w-2xl group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm bệnh nhân bằng tên, ID hoặc số điện thoại..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-[13px] text-sm font-medium focus:ring-2 focus:ring-blue-600/20 shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button className="p-2.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[13px] transition-all relative group">
                <Bell className="w-5 h-5 group-hover:text-blue-600" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></span>
              </button>
              <button className="p-2.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[13px] transition-all group">
                <Settings className="w-5 h-5 group-hover:text-blue-600" />
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            <div className="text-right hidden sm:block min-w-[120px]">
              <p className="text-xs font-black text-slate-900 dark:text-white mb-0.5">{formatDateVi(currentTime)}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{formatTime(currentTime)}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">
          {location.pathname === '/' ? (
            <Outlet />
          ) : location.pathname === '/dashboard' && !tenantId ? (
            <Outlet />
          ) : !tenantId ? (
            <div className="flex h-[50vh] flex-col items-center justify-center">
              <div className="card w-full max-w-md text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Chọn cơ sở y tế</h3>
                <p className="mt-2 text-sm text-slate-500 mb-8 font-medium">Vui lòng lựa chọn tổ chức và chi nhánh để tiếp tục làm việc.</p>
                <TenantSelect className="justify-center w-full" />
              </div>
            </div>
          ) : !branchId ? (
            <div className="flex h-[50vh] flex-col items-center justify-center">
              <div className="card w-full max-w-md text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100">
                <p className="text-slate-600 dark:text-slate-400 font-bold">Vui lòng chọn chi nhánh để tiếp tục.</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
