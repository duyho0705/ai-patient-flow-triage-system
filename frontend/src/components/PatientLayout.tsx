import { ReactNode, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { requestForToken } from '@/firebase'
import { registerPortalFcmToken } from '@/api/portal'
import {
    LayoutGrid,
    Pill,
    BarChart3,
    Calendar,
    MessageSquare,
    User,
    LogOut,
    Bell,
    Search,
    Settings,
    X,
    Circle,
    LifeBuoy,
    BriefcaseMedical
} from 'lucide-react'
import { getPortalNotifications, markPortalNotificationAsRead, markPortalAllNotificationsAsRead, getPortalProfile, getPortalInvoices } from '@/api/portal'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { usePatientRealtime } from '@/hooks/usePatientRealtime'
import { useState } from 'react'

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
        queryKey: ['portal-profile'],
        queryFn: () => getPortalProfile(headers),
        enabled: !!user && !!headers?.tenantId
    })

    const { data: notifications = [] } = useQuery({
        queryKey: ['patient-notifications'],
        queryFn: () => getPortalNotifications(headers),
        enabled: !!user && !!headers?.tenantId,
        refetchInterval: 60000
    })

    const { data: invoices = [] } = useQuery({
        queryKey: ['portal-invoices'],
        queryFn: () => getPortalInvoices(headers),
        enabled: !!user && !!headers?.tenantId,
        refetchInterval: 120000 // Invoices less frequent than notifications
    })

    // Global Real-time Listener
    usePatientRealtime(profile?.id, undefined)

    const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0
    const hasPendingInvoice = Array.isArray(invoices) && invoices.some(inv => inv.status === 'PENDING')

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
        { path: '/patient', label: 'Bảng điều khiển', icon: LayoutGrid },
        { path: '/patient/history', label: 'Đơn thuốc', icon: Pill },
        { path: '/patient/vitals', label: 'Chỉ số sức khỏe', icon: BarChart3 },
        { path: '/patient/appointments', label: 'Lịch hẹn', icon: Calendar },
        { path: '/patient/chat', label: 'Tin nhắn bác sĩ', icon: MessageSquare },
        { path: '/patient/profile', label: 'Hồ sơ cá nhân', icon: User },
    ]

    const handleLogout = () => {
        logout()
        navigate('/', { replace: true, state: { openLogin: true } })
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24 lg:pb-0 lg:pl-64">
            {/* Sidebar for Desktop */}
            <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 z-50">
                <Link to="/" className="flex items-center gap-3 mb-10 px-2 hover:opacity-80 transition-opacity">
                    <BriefcaseMedical className="h-9 w-9 text-emerald-500" strokeWidth={2.5} />
                    <h1 className="font-semibold text-2xl text-slate-800 dark:text-slate-100 leading-none tracking-tight">Sống Khỏe</h1>
                </Link>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        const isBilling = item.path === '/patient/billing'
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-full font-bold transition-all ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-300'
                                    }`}
                            >
                                <item.icon className={`w-6 h-6 ${isActive ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`} />
                                <span className="text-base tracking-tight">{item.label}</span>
                                {isBilling && hasPendingInvoice && !isActive && (
                                    <span className="ml-auto w-2 h-2 bg-rose-500 rounded-full" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <button className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
                        <LifeBuoy className="w-5 h-5" />
                        Cần trợ giúp?
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 mt-2 text-slate-400 font-bold hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Header for Desktop & Mobile */}
            <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between z-40">
                <div className="hidden md:flex flex-1 max-w-xl">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông tin y tế..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsNotifOpen(true)}
                        className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative group transition-all"
                    >
                        <Bell className="w-5 h-5 text-slate-500 group-hover:text-emerald-500" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
                        )}
                    </button>

                    <button className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 group transition-all">
                        <Settings className="w-5 h-5 text-slate-500 group-hover:text-emerald-500" />
                    </button>

                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
                                {profile?.fullNameVi || 'Người dùng'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                ID: {profile?.id?.slice(0, 8).toUpperCase() || 'BN-XXXX'}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                                    {profile?.fullNameVi?.charAt(0) || 'P'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 px-4 lg:px-6 pb-12">
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
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900">Thông báo</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl"
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
                                                : 'bg-emerald-50/50 border-emerald-100 text-slate-900 shadow-sm'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    {!notif.isRead && <Circle className="w-2 h-2 fill-emerald-600 text-emerald-600" />}
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${notif.isRead ? 'text-slate-300' : 'text-emerald-600'}`}>
                                                        {notif.type}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-300">
                                                    {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h3 className={`font-black tracking-tight mb-1 group-hover:text-emerald-600 transition-colors ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
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
                    const isBilling = item.path === '/patient/billing'
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all relative ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : ''}`}>
                                <item.icon className="w-5 h-5" />
                                {isBilling && hasPendingInvoice && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                                )}
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
