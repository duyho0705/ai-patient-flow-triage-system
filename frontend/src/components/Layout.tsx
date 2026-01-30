import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { TenantSelect } from './TenantSelect'

const nav = [
  { to: '/patients', label: 'Bệnh nhân' },
  { to: '/triage', label: 'Phân loại' },
  { to: '/queue', label: 'Hàng chờ' },
]

export function Layout() {
  const location = useLocation()
  const { tenantId, branchId } = useTenant()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-lg font-semibold text-primary-600">
            Luồng bệnh nhân
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  location.pathname.startsWith(to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <TenantSelect />
        </div>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {!tenantId ? (
          <div className="card max-w-md mx-auto text-center">
            <p className="text-slate-600">Chọn tenant và chi nhánh để tiếp tục.</p>
            <TenantSelect className="mt-4 justify-center" />
          </div>
        ) : !branchId ? (
          <div className="card max-w-md mx-auto text-center">
            <p className="text-slate-600">Chọn chi nhánh để tiếp tục.</p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}
