import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { UserManagement } from './admin/UserManagement'
import { AiConfig } from './admin/AiConfig'
import { Settings, Users } from 'lucide-react'

export function Admin() {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'ai'>('users')

  const isAdmin = authUser?.roles?.includes('admin')
  if (!isAdmin) {
    return (
      <div className="card max-w-md mx-auto text-center mt-10">
        <p className="text-slate-600 font-medium">⛔ Bạn không có quyền Admin.</p>
        <p className="text-sm text-slate-500 mt-2">Vui lòng đăng nhập tài khoản Quản trị viên.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl pb-20 space-y-6">
      <div className="flex items-center gap-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`group flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors hover:text-blue-600 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
            }`}
        >
          <Users className={`h-4 w-4 ${activeTab === 'users' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
          User Management
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`group flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors hover:text-purple-600 ${activeTab === 'ai' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500'
            }`}
        >
          <Settings className={`h-4 w-4 ${activeTab === 'ai' ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'}`} />
          AI & System Config
        </button>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'users' ? <UserManagement /> : <AiConfig />}
      </div>
    </div>
  )
}
