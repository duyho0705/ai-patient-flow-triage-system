import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getDoctorDashboard } from '@/api/doctor'
import {
    Users,
    Clock,
    CheckCircle2,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    Activity,
    BrainCircuit
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AcuityIndicator } from '@/components/AcuityBadge'
import { WebSocketService } from '@/services/websocket'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export function DoctorDashboard() {
    const { headers } = useTenant()

    const queryClient = useQueryClient()
    const { data: stats, isLoading } = useQuery({
        queryKey: ['doctor-dashboard-stats'],
        queryFn: () => getDoctorDashboard(headers),
        enabled: !!headers?.tenantId,
    })

    useEffect(() => {
        const ws = new WebSocketService((msg) => {
            if (msg.type === 'QUEUE_REFRESH' || msg.type === 'PATIENT_CALLED') {
                queryClient.invalidateQueries({ queryKey: ['doctor-dashboard-stats'] })
            }
        })
        ws.connect()
        return () => ws.disconnect()
    }, [queryClient])

    if (isLoading) return <div className="p-8 animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">Đang đồng bộ dữ liệu Clinical...</div>

    const quickStats = [
        {
            label: 'Bệnh nhân hôm nay',
            value: stats?.totalPatientsToday || 0,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: '+12% so với hôm qua'
        },
        {
            label: 'Đang đợi khám',
            value: stats?.pendingConsultations || 0,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            trend: 'Thời gian chờ TB: 15ph'
        },
        {
            label: 'Đã hoàn tất',
            value: stats?.completedConsultationsToday || 0,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: 'Đạt 85% chỉ tiêu ca/ngày'
        }
    ]

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Top Bar - Dynamic Search & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tightest uppercase mb-1">Clinical Overview</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <Activity className="w-3 h-3 text-blue-500" />
                        Trạng thái hệ thống: <span className="text-emerald-500 italic">Đang hoạt động ổn định</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm nhanh bệnh nhân..."
                            className="bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                    </button>
                    <Link
                        to="/consultation"
                        className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3"
                    >
                        Vào Phòng Khám
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {quickStats.map((s, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                <s.icon className="w-7 h-7" />
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black tracking-tightest leading-none mb-1">{s.value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2 relative z-10">
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                            <p className="text-[9px] font-bold text-slate-400 italic uppercase tracking-tighter">{s.trend}</p>
                        </div>
                        <div className={`absolute -right-6 -bottom-6 w-32 h-32 ${s.bg} opacity-[0.03] group-hover:opacity-[0.1] rounded-full blur-2xl transition-opacity`} />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Active Priority Queue */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Hàng chờ ưu tiên AI
                        </h3>
                        <Link to="/queue" className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline">Xem tất cả hàng chờ</Link>
                    </div>

                    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-8 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Acuity</th>
                                        <th className="px-8 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Bệnh nhân</th>
                                        <th className="px-8 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                                        <th className="px-8 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(stats?.activeQueue || []).filter(e => e.status !== 'COMPLETED').slice(0, 5).map((e, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <AcuityIndicator level={e.acuityLevel} />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase truncate max-w-[180px]">{e.patientName}</span>
                                                    <span className="text-[9px] font-bold text-slate-400">{e.medicalServiceName || 'Khám chuyên khoa'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                    <span className="text-xs font-bold text-slate-500 italic">Đã đợi 12ph</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link
                                                    to="/consultation"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                                                >
                                                    Khám ngay
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!stats?.activeQueue || stats.activeQueue.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                                    <CheckCircle2 className="w-8 h-8" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Hàng chờ trống</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Vertical Sidebar Cards */}
                <div className="lg:col-span-4 flex flex-col gap-10">
                    <section className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-amber-500 flex items-center gap-3">
                            <Calendar className="w-4 h-4" />
                            Lịch hẹn sắp tới
                        </h3>
                        <div className="space-y-6 relative z-10">
                            {(stats?.upcomingAppointments || []).slice(0, 3).map((a, i) => (
                                <div key={i} className="flex gap-5 border-l-2 border-white/5 pl-5 hover:border-white/20 transition-all cursor-default group/item">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black leading-none mb-1 group-hover/item:text-blue-400 transition-colors uppercase">{a.startTime || '09:30'}</span>
                                        <span className="text-[9px] font-bold text-slate-500 italic">Hôm nay</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black uppercase truncate text-slate-200">{a.patientName}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Tái khám định kỳ</p>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.upcomingAppointments || stats.upcomingAppointments.length === 0) && (
                                <p className="text-xs font-bold text-slate-500 italic">Không có lịch hẹn sắp tới.</p>
                            )}
                        </div>
                        <div className="mt-10 pt-8 border-t border-white/5">
                            <Link to="/scheduling" className="text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                                Quản lý lịch biểu <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </section>

                    <section className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
                            <BrainCircuit className="w-32 h-32 text-blue-500" />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3 italic">
                            AI Insight Hub
                        </h3>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic border-l-4 border-blue-500 pl-6 py-2">
                            "Mật độ hàng chờ đang tăng ở khu vực Khám nội. Vui lòng ưu tiên các ca Acuity 1 hiện đang chờ hơn 20 phút."
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
