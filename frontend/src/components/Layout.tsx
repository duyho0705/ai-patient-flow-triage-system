import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { TenantSelect } from './TenantSelect'
import { RoleSelect } from './RoleSelect'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  ListOrdered,
  Brain,
  BarChart2,
  FileText,
  Calendar,
  CreditCard,
  Package,
  Pill,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/patients', label: 'Bệnh nhân', icon: Users },
  { to: '/triage', label: 'Phân loại', icon: Stethoscope },
  { to: '/queue', label: 'Hàng chờ', icon: ListOrdered },
  { to: '/scheduling', label: 'Lịch hẹn', icon: Calendar },
  { to: '/billing', label: 'Viện phí', icon: CreditCard },
  { to: '/inventory', label: 'Kho thuốc', icon: Package, roles: ['admin', 'pharmacist', 'clinic_manager'] },
  { to: '/dispensing', label: 'Cấp phát thuốc', icon: Pill, roles: ['admin', 'pharmacist'] },
  { to: '/reports', label: 'Báo cáo', icon: FileText, roles: ['admin', 'clinic_manager'] },
  { to: '/ai-audit', label: 'AI Audit', icon: Brain, roles: ['admin'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart2, roles: ['admin', 'clinic_manager'] },
  { to: '/admin', label: 'Quản trị', icon: Settings, roles: ['admin'] },
]

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { tenantId, branchId } = useTenant()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const visibleNav = nav.filter(
    (item) => !item.roles || (user?.roles && item.roles.some((r) => user.roles.includes(r)))
  )

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true, state: { openLogin: true } })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden border-r border-slate-200 bg-white md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 text-sm">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            PatientFlow
          </Link>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 gap-1">
          {visibleNav.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all ${isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'}`} />
                {label}
              </Link>
            )
          })}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-[#2d3436]/10 backdrop-blur-[2px] md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-200 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <span className="font-bold text-slate-900 text-lg">PatientFlow</span>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-500">
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-1 p-4">
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${location.pathname.startsWith(to)
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-700 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-4">
            <RoleSelect />
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-200 rounded-full h-8 shrink-0">
              <svg viewBox="0 0 512 512" className="w-4 h-4 rounded-full shadow-sm">
                <path fill="#da251d" d="M0 0h512v512H0z" />
                <path fill="#ffff00" d="m256 94.4l36.5 112.4h118.2l-95.6 69.5l36.5 112.4l-95.6-69.5l-95.6 69.5l36.5-112.4l-95.6-69.5h118.2z" />
              </svg>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">VN</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-medium text-xs">
              {user?.fullNameVi?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {location.pathname === '/' ? (
            <Outlet />
          ) : location.pathname === '/dashboard' && !tenantId ? (
            <Outlet />
          ) : !tenantId ? (
            <div className="flex h-[50vh] flex-col items-center justify-center">
              <div className="card w-full max-w-md text-center p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Chọn Tenant</h3>
                <p className="mt-1 text-sm text-slate-500 mb-6">Vui lòng chọn tổ chức và chi nhánh để bắt đầu.</p>
                <TenantSelect className="justify-center w-full" />
              </div>
            </div>
          ) : !branchId ? (
            <div className="flex h-[50vh] flex-col items-center justify-center">
              <div className="card w-full max-w-md text-center">
                <p className="text-slate-600">Vui lòng chọn chi nhánh để tiếp tục.</p>
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
