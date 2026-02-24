import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '@/context/RoleContext'
import { toastService } from '@/services/toast'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { hasAnyRole } from '@/security/roleMapping'

interface PermissionGateProps {
  allowedRoles: Role[]
  redirectTo?: string
}

export function PermissionGate({ allowedRoles, redirectTo = '/dashboard' }: PermissionGateProps) {
  const { user } = useAuth()
  const hasPermission = hasAnyRole(user?.roles, allowedRoles)

  useEffect(() => {
    if (!hasPermission) {
      toastService.error('⛔ Bạn không có quyền truy cập khu vực này!')
    }
  }, [hasPermission])

  if (!hasPermission) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

