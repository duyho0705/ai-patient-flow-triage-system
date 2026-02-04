import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPatientPortalStatus } from '@/api/portal'
import { getMedicalTimeline } from '@/api/ehr'
import { useTenant } from '@/context/TenantContext'
import {
    Users, Clock, MapPin,
    History, CreditCard, Pill,
    ArrowRight, ChevronRight, RefreshCw,
    Activity, Calendar, CheckCircle2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { WebSocketService } from '@/services/websocket'
import toast from 'react-hot-toast'

export function PatientPortal() {
    const { patientId } = useParams()
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [refreshKey, setRefreshKey] = useState(0)

    const { data: status, isLoading: isLoadingStatus, refetch } = useQuery({
        queryKey: ['portal-status', patientId, refreshKey],
        queryFn: () => getPatientPortalStatus(patientId!, headers),
        enabled: !!patientId && !!headers?.tenantId,
        refetchInterval: 30000 // Polling backup
    })

    const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
        queryKey: ['portal-timeline', patientId],
        queryFn: () => getMedicalTimeline(patientId!, headers),
        enabled: !!patientId && !!headers?.tenantId
    })

    useEffect(() => {
        if (!patientId) return

        const ws = new WebSocketService((msg) => {
            queryClient.invalidateQueries({ queryKey: ['portal-status', patientId] })
            queryClient.invalidateQueries({ queryKey: ['portal-timeline', patientId] })

            toast.success(msg.body || msg.title || 'Cập nhật mới!', {
                icon: '🔔',
                position: 'top-center',
                style: {
                    borderRadius: '1rem',
                    background: '#1e293b',
                    color: '#fff',
                }
            })
        }, `/topic/patient/${patientId}`)

        ws.connect()
        return () => ws.disconnect()
    }, [patientId, queryClient])

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1)
        refetch()
    }

    if (!patientId) return <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Cần mã định danh bệnh nhân</div>

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            {/* Header / Branding */}
            <header className="bg-slate-900 px-8 pt-16 pb-24 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10 flex justify-between items-start mb-10">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Chào mừng trở lại</p>
                        <h1 className="text-3xl font-black tracking-tight">{status?.patientName || 'Bệnh nhân'}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-500/30">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Trực tiếp</span>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all active:scale-90"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Status Card Overlay */}
                <div className="absolute left-8 right-8 bottom-0 translate-y-1/2 bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái Hàng chờ</p>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                {status?.status === 'WAITING' ? 'Đang chờ khám' :
                                    status?.status === 'CALLING' ? 'Đang gọi lượt' :
                                        'Không trong hàng chờ'}
                            </h2>
                        </div>
                    </div>
                    {status?.status === 'WAITING' && (
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Trước bạn</p>
                            <div className="flex items-baseline gap-1 text-blue-600">
                                <span className="text-4xl font-black">{status?.peopleAhead}</span>
                                <span className="text-xs font-bold uppercase">Nhà</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Content Area */}
            <main className="px-8 mt-24 space-y-10">
                {/* Active Queue Info if any */}
                {status?.status === 'WAITING' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-black tracking-tight">Phòng: {status?.queueName}</h3>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    Khu vực Tầng 1 - Khu B
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <ArrowRight className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-6 border-t border-white/10">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-blue-400 border-2 border-blue-600" />)}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 ml-4">Thời gian ước tính: ~{status?.estimatedWaitMinutes} phút</p>
                        </div>
                    </motion.div>
                )}

                {/* Quick Actions Grid */}
                <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Truy cập nhanh</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickActionCard icon={History} label="Lịch sử khám" color="bg-emerald-50 text-emerald-600" />
                        <QuickActionCard icon={CreditCard} label="Hóa đơn điện tử" color="bg-rose-50 text-rose-600" />
                        <QuickActionCard icon={Pill} label="Đơn thuốc" color="bg-amber-50 text-amber-600" />
                        <QuickActionCard icon={Calendar} label="Đặt lịch hẹn" color="bg-purple-50 text-purple-600" />
                    </div>
                </div>

                {/* Medical Timeline Summary */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dòng thời gian y khoa</h4>
                        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                            Xem tất cả <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {isLoadingTimeline ? (
                            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-[2rem] animate-pulse" />)
                        ) : timeline?.slice(0, 5).map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center justify-between group active:scale-95 transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${item.type === 'TRIAGE' ? 'bg-blue-50 text-blue-600' :
                                        item.type === 'CONSULTATION' ? 'bg-emerald-50 text-emerald-600' :
                                            item.type === 'INVOICE' ? 'bg-rose-50 text-rose-600' :
                                                'bg-slate-50 text-slate-600'
                                        }`}>
                                        {item.type === 'TRIAGE' ? <Activity className="w-5 h-5" /> :
                                            item.type === 'CONSULTATION' ? <CheckCircle2 className="w-5 h-5" /> :
                                                item.type === 'INVOICE' ? <CreditCard className="w-5 h-5" /> :
                                                    <Calendar className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{new Date(item.timestamp).toLocaleDateString('vi-VN')}</p>
                                        <h5 className="font-black text-slate-900 tracking-tight">{item.title}</h5>
                                        <p className="text-[10px] font-bold text-slate-400 truncate w-40 italic">{item.subtitle}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-slate-400" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Floating Navigation (Mobile Style) */}
            <div className="fixed bottom-8 left-8 right-8 bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-4 flex items-center justify-around shadow-2xl border border-white/10">
                <NavIcon icon={Users} active />
                <NavIcon icon={Calendar} />
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center -translate-y-8 shadow-xl shadow-blue-500/40 border-4 border-[#f8fafc]">
                    <Activity className="w-6 h-6 text-white" />
                </div>
                <NavIcon icon={CreditCard} />
                <NavIcon icon={RefreshCw} />
            </div>
        </div>
    )
}

function QuickActionCard({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col gap-4 text-left group"
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${color} group-hover:scale-110`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black text-slate-900 leading-tight tracking-tight uppercase tracking-widest">{label}</span>
        </motion.button>
    )
}

function NavIcon({ icon: Icon, active }: { icon: any, active?: boolean }) {
    return (
        <button className={`p-4 rounded-2xl transition-all ${active ? 'text-white bg-white/10' : 'text-slate-500 hover:text-white'}`}>
            <Icon className="w-6 h-6" />
        </button>
    )
}
