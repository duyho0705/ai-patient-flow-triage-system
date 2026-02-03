import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { UserManagement } from './admin/UserManagement'
import { AiConfig } from './admin/AiConfig'
import { BranchManagement } from './admin/BranchManagement'
import { MasterData } from './admin/MasterData'
import { AuditLogs } from './admin/AuditLogs'
import { Settings, Users, Building2, Layers, History } from 'lucide-react'

type AdminTab = 'users' | 'ai' | 'branches' | 'services' | 'audit'

export function Admin() {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('users')

  const userRoles = authUser?.roles || []
  const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('CLINIC_MANAGER')

  if (!isAdmin) {
    return (
      <div className="card max-w-md mx-auto text-center mt-10">
        <p className="text-slate-600 font-medium">⛔ Bạn không có quyền Quản trị.</p>
        <p className="text-sm text-slate-500 mt-2">Vui lòng đăng nhập tài khoản Quản trị viên hoặc Quản lý phòng khám.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl pb-20 space-y-10 animate-in fade duration-700">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100">
        <button
          onClick={() => setActiveTab('users')}
          className={`group flex items-center gap-2 border-b-2 px-6 py-5 text-xs font-black uppercase tracking-widest transition-all hover:text-blue-600 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'
            }`}
        >
          <Users className={`h-4 w-4 ${activeTab === 'users' ? 'text-blue-600' : 'text-slate-300 group-hover:text-blue-600'}`} />
          Nhân sự
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`group flex items-center gap-2 border-b-2 px-6 py-5 text-xs font-black uppercase tracking-widest transition-all hover:text-emerald-600 ${activeTab === 'branches' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400'
            }`}
        >
          <Building2 className={`h-4 w-4 ${activeTab === 'branches' ? 'text-emerald-600' : 'text-slate-300 group-hover:text-emerald-600'}`} />
          Chi nhánh
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`group flex items-center gap-2 border-b-2 px-6 py-5 text-xs font-black uppercase tracking-widest transition-all hover:text-amber-600 ${activeTab === 'services' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400'
            }`}
        >
          <Layers className={`h-4 w-4 ${activeTab === 'services' ? 'text-amber-600' : 'text-slate-300 group-hover:text-amber-600'}`} />
          Dịch vụ & Gói khám
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`group flex items-center gap-2 border-b-2 px-6 py-5 text-xs font-black uppercase tracking-widest transition-all hover:text-purple-600 ${activeTab === 'ai' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-400'
            }`}
        >
          <Settings className={`h-4 w-4 ${activeTab === 'ai' ? 'text-purple-600' : 'text-slate-300 group-hover:text-purple-600'}`} />
          Cấu hình AI
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`group flex items-center gap-2 border-b-2 px-6 py-5 text-xs font-black uppercase tracking-widest transition-all hover:text-slate-900 ${activeTab === 'audit' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'
            }`}
        >
          <History className={`h-4 w-4 ${activeTab === 'audit' ? 'text-slate-900' : 'text-slate-300 group-hover:text-slate-900'}`} />
          Nhật ký (Audit)
        </button>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'branches' && <BranchManagement />}
        {activeTab === 'services' && <MasterData />}
        {activeTab === 'ai' && <AiConfig />}
        {activeTab === 'audit' && <AuditLogs />}
      </div>
    </div>
  )
}
