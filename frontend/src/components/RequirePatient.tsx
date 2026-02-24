import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function RequirePatient() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Đang tải...</p>
      </div>
    )
  }

  const isPatient = user?.roles?.includes('patient')

  if (!isPatient) {
    return <Navigate to="/" state={{ from: location, openLogin: true }} replace />
  }

  return <Outlet />
}

