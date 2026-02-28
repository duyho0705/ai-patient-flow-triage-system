import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getStoredToken } from '@/api/client'
import { Loader2 } from 'lucide-react'

const STAFF_ROLES = ['admin', 'receptionist', 'triage_nurse', 'doctor', 'clinic_manager', 'pharmacist']

export function RequireStaff() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Đang tải...</p>
      </div>
    )
  }

  if (!isAuthenticated && !getStoredToken()) {
    return <Navigate to="/" state={{ from: location, openLogin: true }} replace />
  }

  if (!user && getStoredToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#4ade80]" />
      </div>
    )
  }

  const isStaff = user?.roles?.some((r) => STAFF_ROLES.includes(r))

  if (!isStaff) {
    return <Navigate to="/patient" replace />
  }

  return <Outlet />
}
