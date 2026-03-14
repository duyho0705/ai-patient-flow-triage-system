import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { UserManagement } from './admin/UserManagement'
import { RoleManagement } from './admin/RoleManagement'
import { AiConfig } from './admin/AiConfig'
import { BranchManagement } from './admin/BranchManagement'
import { MasterData } from './admin/MasterData'
import { AuditLogs } from './admin/AuditLogs'
import { RevenueAnalytics } from './admin/RevenueAnalytics'
import { SystemSettings } from './admin/SystemSettings'
import { Settings, Users, Building2, Layers, History, BarChart3, Settings2, Shield } from 'lucide-react'

type AdminTab = 'users' | 'roles' | 'ai' | 'branches' | 'services' | 'audit' | 'revenue' | 'system'

export function Admin() {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('users')

  const userRoles = authUser?.roles || []
  const isAdmin = userRoles.some(r => ['admin', 'clinic_manager', 'ADMIN', 'CLINIC_MANAGER'].includes(r))

  if (!isAdmin) {
    return (
      <div className="card max-w-md mx-auto text-center mt-10">
        <p className="text-slate-600 font-medium">⛔ Bạn không có quyền Quản trị.</p>
        <p className="text-sm text-slate-500 mt-2">Vui lòng đăng nhập tài khoản Quản trị viên hoặc Quản lý phòng khám.</p>
      </div>
    )
  }

  return (
    <div className="pb-12 space-y-4 animate-in fade duration-700">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100">
        {[
          { key: 'users' as AdminTab, label: 'Nhân sự', icon: Users, color: 'emerald' },
          { key: 'roles' as AdminTab, label: 'Vai trò', icon: Shield, color: 'blue' },
          { key: 'branches' as AdminTab, label: 'Chi nhánh', icon: Building2, color: 'emerald' },
          { key: 'services' as AdminTab, label: 'Dịch vụ', icon: Layers, color: 'amber' },
          { key: 'ai' as AdminTab, label: 'Cấu hình AI', icon: Settings, color: 'purple' },
          { key: 'system' as AdminTab, label: 'Hệ thống', icon: Settings2, color: 'blue' },
          { key: 'audit' as AdminTab, label: 'Nhật ký', icon: History, color: 'slate' },
          { key: 'revenue' as AdminTab, label: 'Doanh thu', icon: BarChart3, color: 'emerald' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`group flex items-center gap-1.5 border-b-2 px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all hover:text-${tab.color}-600 ${activeTab === tab.key ? `border-${tab.color === 'slate' ? 'slate-900' : (tab.color === 'blue' ? 'blue-600' : (tab.color === 'emerald' ? 'emerald-600' : 'amber-600'))} text-${tab.color === 'slate' ? 'slate-900' : (tab.color === 'blue' ? 'blue-600' : (tab.color === 'emerald' ? 'emerald-600' : 'amber-600'))}` : 'border-transparent text-slate-400'
              }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'roles' && <RoleManagement />}
        {activeTab === 'branches' && <BranchManagement />}
        {activeTab === 'services' && <MasterData />}
        { activeTab === 'ai' && <AiConfig /> }
        { activeTab === 'system' && <SystemSettings /> }
        { activeTab === 'audit' && <AuditLogs /> }
        {activeTab === 'revenue' && <RevenueAnalytics />}
      </div>
    </div>
  )
}
