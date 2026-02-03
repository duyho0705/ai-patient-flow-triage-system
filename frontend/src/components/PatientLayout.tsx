import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
    Home,
    Calendar,
    History,
    User,
    LogOut,
    LayoutDashboard,
    Bell
} from 'lucide-react'

interface PatientLayoutProps {
    children: ReactNode
}

export function PatientLayout({ children }: PatientLayoutProps) {
    const { logout, user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const navItems = [
        { path: '/patient', label: 'Trang chủ', icon: Home },
        { path: '/patient/appointments', label: 'Lịch hẹn', icon: Calendar },
        { path: '/patient/history', label: 'Lịch sử khám', icon: History },
        { path: '/patient/profile', label: 'Cá nhân', icon: User },
    ]

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24 lg:pb-0 lg:pl-64">
            {/* Sidebar for Desktop */}
            <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 p-6 z-50">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-900 tracking-tight">PatientPortal</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v1.0.0</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="pt-6 border-t border-slate-50">
                    <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                                {user?.fullNameVi?.slice(0, 1) || 'P'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate">{user?.fullNameVi}</p>
                                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 font-bold hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Top Bar for Mobile */}
            <header className="lg:hidden bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <Bell className="w-5 h-5" />
                    </div>
                    <span className="font-black text-slate-900 tracking-tight">Patient Portal</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px]">
                    {user?.fullNameVi?.slice(0, 1) || 'P'}
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4 sm:p-8 md:p-12 animate-in fade-in duration-500">
                {children}
            </main>

            {/* Bottom Nav for Mobile */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-2 py-3 flex items-center justify-around z-40">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-blue-600' : 'text-slate-400'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : ''}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
