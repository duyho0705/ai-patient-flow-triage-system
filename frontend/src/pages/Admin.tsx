import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { UserManagement } from './admin/UserManagement'
import { RoleManagement } from './admin/RoleManagement'
import { AuditLogs } from './admin/AuditLogs'
import { SystemSettings } from './admin/SystemSettings'
import { BranchManagement } from './admin/BranchManagement'
import { SystemOverview } from './admin/SystemOverview'
import { AiConfig } from './admin/AiConfig'

type AdminAction = 'overview' | 'users' | 'roles' | 'audit' | 'system' | 'tenants' | 'diseases' | 'reports' | 'ai-config' | null

export function Admin() {
   const navigate = useNavigate()
   const location = useLocation()

   // Derive active action from URL path
   const path = location.pathname
   const activeAction = useMemo((): AdminAction => {
      if (path.includes('/dashboard')) return 'overview'
      if (path.includes('/admin/users')) return 'users'
      if (path.includes('/admin/roles')) return 'roles'
      if (path.includes('/admin/audit-logs')) return 'audit'
      if (path.includes('/admin/settings')) return 'system'
      if (path.includes('/admin/tenants')) return 'tenants'
      if (path.includes('/admin/ai-config')) return 'ai-config'
      return null
   }, [path])

   // Redirect to overview by default if at the base admin path
   useEffect(() => {
      if (path === '/admin' || path === '/admin/') {
         navigate('/dashboard', { replace: true })
      }
   }, [path, navigate])

   if (activeAction) {
      return (
         <div className="flex-1 p-8 animate-in fade-in duration-700 bg-background-light dark:bg-background-dark font-display min-h-[calc(100vh-80px)]">
            <div className="min-h-[600px] w-full">
               {activeAction === 'overview' && <SystemOverview />}
               {activeAction === 'users' && <UserManagement />}
               {activeAction === 'roles' && <RoleManagement />}
               {activeAction === 'audit' && <AuditLogs />}
               {activeAction === 'system' && <SystemSettings />}
               {activeAction === 'tenants' && <BranchManagement />}
               {activeAction === 'ai-config' && <AiConfig />}
            </div>
         </div>
      )
   }

   return null
}
