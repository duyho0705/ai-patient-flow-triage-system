import { ReactNode, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { requestForToken } from '@/firebase'
import { registerPortalFcmToken } from '@/api/portal'
import {
    Home,
    Calendar,
    History,
    User,
    LogOut,
    Bell,
    X,
    Circle
} from 'lucide-react'
import { getPortalNotifications, markPortalNotificationAsRead, markPortalAllNotificationsAsRead, getPortalProfile } from '@/api/portal'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { usePatientRealtime } from '@/hooks/usePatientRealtime'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface PatientLayoutProps {
    children: ReactNode
}

export function PatientLayout({ children }: PatientLayoutProps) {
    const { logout, user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const { headers } = useTenant()

    const queryClient = useQueryClient()
    const [isNotifOpen, setIsNotifOpen] = useState(false)

    const { data: profile } = useQuery({
        queryKey: ['patient-profile'],
        queryFn: () => getPortalProfile(headers),
        enabled: !!user && !!headers?.tenantId
    })

    const { data: notifications = [] } = useQuery({
        queryKey: ['patient-notifications'],
        queryFn: () => getPortalNotifications(headers),
        enabled: !!user && !!headers?.tenantId,
        refetchInterval: 60000 // Poll every minute as backup
    })

    // Global Real-time Listener for the whole Layout
    usePatientRealtime(profile?.id, undefined)

    const unreadCount = notifications.filter(n => !n.isRead).length

    useEffect(() => {
        if (!user || !headers?.tenantId) return

        const setupNotifications = async () => {
            try {
                const token = await requestForToken()
                if (token) {
                    await registerPortalFcmToken(token, 'web', headers)
                }
            } catch (err) {
                console.warn('FCM registration failed:', err)
            }
        }

        setupNotifications()
    }, [headers, user])

    const handleMarkAsRead = async (id: string) => {
        try {
            await markPortalNotificationAsRead(id, headers)
            queryClient.invalidateQueries({ queryKey: ['patient-notifications'] })
        } catch (err) {
            console.error('Failed to mark notification as read:', err)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await markPortalAllNotificationsAsRead(headers)
            queryClient.invalidateQueries({ queryKey: ['patient-notifications'] })
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err)
        }
    }

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
                <button
                    onClick={() => setIsNotifOpen(true)}
                    className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px] relative"
                >
                    {user?.fullNameVi?.slice(0, 1) || 'P'}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Main Content */}
            <main className="p-4 sm:p-8 md:p-12 animate-in fade-in duration-500">
                {children}
            </main>

            {/* Notification Pane overlay */}
            <AnimatePresence>
                {isNotifOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsNotifOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-[70] flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900">Thông báo</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-xl"
                                        >
                                            Đọc tất cả
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsNotifOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                                    >
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {notifications.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-10">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                            <Bell className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 text-sm font-bold">Không có thông báo nào</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                            className={`p-5 rounded-[2rem] border transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 ${notif.isRead
                                                ? 'bg-white border-slate-100 text-slate-500'
                                                : 'bg-blue-50/50 border-blue-100 text-slate-900 shadow-sm'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    {!notif.isRead && <Circle className="w-2 h-2 fill-blue-600 text-blue-600" />}
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${notif.isRead ? 'text-slate-300' : 'text-blue-600'}`}>
                                                        {notif.type}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-300">
                                                    {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h3 className={`font-black tracking-tight mb-1 group-hover:text-blue-600 transition-colors ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                                                {notif.title}
                                            </h3>
                                            <p className="text-xs leading-relaxed opacity-80">{notif.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 italic text-[10px] text-slate-400 text-center uppercase tracking-widest font-black">
                                Hệ thống thông báo tự động
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
                {/* Mobile Notification Toggle */}
                <button
                    onClick={() => setIsNotifOpen(true)}
                    className="flex flex-col items-center gap-1 text-slate-400 relative"
                >
                    <div className="p-2">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-bold">Thông báo</span>
                </button>
            </nav>
        </div>
    )
}
