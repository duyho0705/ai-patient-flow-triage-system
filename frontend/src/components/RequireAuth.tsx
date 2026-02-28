import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getStoredToken } from '@/api/client'
import { Loader2 } from 'lucide-react'

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
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

  // If we have a token but auth context hasn't updated yet, just wait
  if (!isAuthenticated && getStoredToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#4ade80]" />
      </div>
    )
  }

  return <Outlet />
}
