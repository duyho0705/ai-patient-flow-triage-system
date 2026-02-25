import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { TenantSelect } from './TenantSelect'

import { LogOut, Menu, HeartPulse, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { STAFF_NAV } from '@/routes/staffNav'
import { motion } from 'framer-motion'

export function Layout() {
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
      <div className="flex-1 flex flex-col md:pl-72 min-h-screen">
        {location.pathname !== '/dashboard' ? (
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 dark:bg-slate-900/80 px-8 backdrop-blur-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-slate-700 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex flex-1 items-center justify-end gap-4">
              <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full h-8 shrink-0">
                <svg viewBox="0 0 512 512" className="w-4 h-4 rounded-full shadow-sm">
                  <path fill="#da251d" d="M0 0h512v512H0z" />
                  <path fill="#ffff00" d="m256 94.4l36.5 112.4h118.2l-95.6 69.5l36.5 112.4l-95.6-69.5l-95.6 69.5l36.5-112.4l-95.6-69.5h118.2z" />
                </svg>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">VN</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs">
                {user?.fullNameVi?.charAt(0) || 'U'}
              </div>
            </div>
          </header>
        ) : (
          /* Small mobile trigger for dashboard */
          <div className="md:hidden fixed top-6 left-6 z-50">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 text-slate-600 overflow-hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        )}

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
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
