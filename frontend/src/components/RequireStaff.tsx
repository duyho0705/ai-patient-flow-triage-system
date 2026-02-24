import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const STAFF_ROLES = ['admin', 'receptionist', 'triage_nurse', 'doctor', 'clinic_manager', 'pharmacist']

export function RequireStaff() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Đang tải...</p>
      </div>
    )
  }

  const isStaff = user?.roles?.some((r) => STAFF_ROLES.includes(r))

  if (!isStaff) {
    return <Navigate to="/" state={{ from: location, openLogin: true }} replace />
  }

  return <Outlet />
}
