import { useQuery } from '@tanstack/react-query'
import { getPortalDashboard, getPortalQueues } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import { usePatientRealtime } from '@/hooks/usePatientRealtime'
import {
    Calendar,
    Clock,
    ArrowRight,
    History as HistoryIcon,
    Activity,
    ChevronRight,
    Users,
    Stethoscope,
    QrCode,
    Wallet,
    ShieldPlus,
    X,
    MessageCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function PatientDashboard() {
    const { headers } = useTenant()

    const { data: dashboard, isLoading: loadingDash } = useQuery({
        queryKey: ['portal-dashboard'],
        queryFn: () => getPortalDashboard(headers),
        enabled: !!headers?.tenantId
    })

    const { data: queues } = useQuery({
        queryKey: ['portal-queues'],
        queryFn: () => getPortalQueues(headers),
        enabled: !!headers?.tenantId
    })

    const [isQrOpen, setIsQrOpen] = useState(false)
    const [isPaymentSimOpen, setIsPaymentSimOpen] = useState(false)

    // Enable Real-time updates
    usePatientRealtime(dashboard?.patientId, dashboard?.branchId)

    if (loadingDash) return <div className="p-8 text-center font-bold text-slate-400">Đang tải...</div>

    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            {/* Hero Welcome */}
            <header className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white">
                <div className="absolute top-0 right-0 p-12 opacity-10 -mr-20 -mt-20">
                    <Activity className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Xin chào, {dashboard?.patientName}!</h2>
                        <p className="text-slate-400 font-medium">Chúc bạn một ngày tốt lành và nhiều sức khỏe.</p>
                    </div>
                    <button
                        onClick={() => setIsQrOpen(true)}
                        className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-3xl flex items-center gap-3 hover:bg-white/20 transition-all group"
                    >
                        <QrCode className="w-6 h-6 text-blue-400" />
                        <div className="text-left">
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest leading-none mb-1">Mã Check-in</p>
                            <p className="text-sm font-bold">Quét tại Kiosk</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </header>

            {/* Active Queues Card */}
            {(queues && queues.length > 0) && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Tiến độ Hàng chờ
                        </h3>
                    </div>
                    <div className="grid gap-4">
                        {queues.map(q => (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/40 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{q.queueName}</p>
                                        <p className="text-lg font-black text-slate-900">{q.status === 'CALLED' ? 'Mời bạn vào khám!' : 'Đang chờ nội dung'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian chờ dự kiến</p>
                                    <p className="text-2xl font-black text-blue-600">~{q.estimatedWaitMinutes} phút</p>
                                    <p className="text-[10px] font-bold text-slate-400">({q.peopleAhead} người phía trước)</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* Next Appointment */}
                <section className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900 px-2">Lịch hẹn sắp tới</h3>
                    {dashboard?.nextAppointment ? (
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/30">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">
                                        {new Date(dashboard.nextAppointment.appointmentDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                                    </p>
                                    <p className="text-xs font-medium text-slate-400">{dashboard.nextAppointment.startTime} - {dashboard.nextAppointment.endTime}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 mb-8">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cơ sở khám</p>
                                <p className="text-sm font-bold text-slate-700">{dashboard.nextAppointment.branchName}</p>
                            </div>
                            <Link
                                to="/patient/appointments"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-tight hover:bg-blue-600 transition-all"
                            >
                                Chi tiết lịch hẹn
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] p-12 border border-dashed border-slate-200 text-center space-y-4">
                            <p className="text-slate-400 font-bold">Bạn chưa có lịch hẹn nào.</p>
                            <Link
                                to="/patient/booking"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200"
                            >
                                Đặt lịch ngay
                            </Link>
                        </div>
                    )}
                </section>

                {/* Recent Visits */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-black text-slate-900">Lần khám gần đây</h3>
                        <Link to="/patient/history" className="text-xs font-bold text-blue-600 hover:underline">Tất cả</Link>
                    </div>
                    <div className="space-y-3">
                        {dashboard?.recentVisits && dashboard.recentVisits.length > 0 ? (
                            dashboard.recentVisits.map(v => (
                                <Link
                                    key={v.id}
                                    to={`/patient/history/${v.id}`}
                                    className="group flex items-center justify-between p-5 bg-white border border-slate-50 rounded-3xl hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Stethoscope className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{v.diagnosisNotes || 'Kết quả khám'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {new Date(v.startedAt).toLocaleDateString('vi-VN')} · BS. {v.doctorName}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </Link>
                            ))
                        ) : (
                            <p className="text-center py-8 text-slate-400 font-medium">Chưa có lịch sử khám.</p>
                        )}
                    </div>
                </section>
            </div>

            {/* Quick Actions Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Chat với Bác sĩ', icon: MessageCircle, color: 'bg-blue-50 text-blue-600', path: '#' },
                    { label: 'Thanh toán', icon: Wallet, color: 'bg-emerald-50 text-emerald-600', path: '/patient/history' },
                    { label: 'Bảo hiểm', icon: ShieldPlus, color: 'bg-orange-50 text-orange-600', path: '#' },
                    { label: 'Lịch sử', icon: HistoryIcon, color: 'bg-purple-50 text-purple-600', path: '/patient/history' },
                ].map((action, idx) => (
                    <button
                        key={idx}
                        className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col items-center gap-4 group"
                    >
                        <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{action.label}</span>
                    </button>
                ))}
            </section>

            {/* QR Scanner Mock Modal */}
            <AnimatePresence>
                {isQrOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsQrOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] p-10 w-full max-w-sm relative z-10 shadow-2xl text-center"
                        >
                            <button
                                onClick={() => setIsQrOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6 text-slate-300" />
                            </button>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mã Check-in của bạn</h3>
                                    <p className="text-slate-400 font-medium text-sm mt-1 mb-8">Dùng mã này tại Kiosk để nhận số thứ tự</p>
                                </div>
                                <div className="bg-slate-900 p-8 rounded-[2rem] relative group">
                                    <div className="aspect-square bg-white rounded-2xl flex items-center justify-center p-4 shadow-inner">
                                        {/* Simulated QR Code SVG */}
                                        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                                            <rect x="10" y="10" width="25" height="25" fill="currentColor" />
                                            <rect x="65" y="10" width="25" height="25" fill="currentColor" />
                                            <rect x="10" y="65" width="25" height="25" fill="currentColor" />
                                            <rect x="15" y="15" width="15" height="15" fill="white" />
                                            <rect x="70" y="15" width="15" height="15" fill="white" />
                                            <rect x="15" y="70" width="15" height="15" fill="white" />
                                            <rect x="40" y="10" width="10" height="10" fill="currentColor" />
                                            <rect x="55" y="40" width="15" height="20" fill="currentColor" />
                                            <rect x="40" y="55" width="10" height="35" fill="currentColor" />
                                            <rect x="75" y="65" width="15" height="15" fill="currentColor" />
                                        </svg>
                                    </div>
                                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black text-slate-900 tracking-tight">BỆNH NHÂN: {dashboard?.patientName?.toUpperCase()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {dashboard?.patientId?.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
