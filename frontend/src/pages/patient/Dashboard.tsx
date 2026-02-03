import { useQuery } from '@tanstack/react-query'
import { getPortalDashboard, getPortalQueues } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import {
    Calendar,
    Clock,
    ArrowRight,
    History,
    Activity,
    ChevronRight,
    Users,
    Stethoscope
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function PatientDashboard() {
    const { headers } = useTenant()

    const { data: dashboard, isLoading: loadingDash } = useQuery({
        queryKey: ['portal-dashboard'],
        queryFn: () => getPortalDashboard(headers),
        enabled: !!headers?.tenantId
    })

    const { data: queues, isLoading: loadingQueues } = useQuery({
        queryKey: ['portal-queues'],
        queryFn: () => getPortalQueues(headers),
        enabled: !!headers?.tenantId,
        refetchInterval: 15000 // Refresh queue status every 15s
    })

    if (loadingDash) return <div className="p-8 text-center font-bold text-slate-400">Đang tải...</div>

    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            {/* Hero Welcome */}
            <header className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white">
                <div className="absolute top-0 right-0 p-12 opacity-10 -mr-20 -mt-20">
                    <Activity className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Xin chào, {dashboard?.patientName}!</h2>
                    <p className="text-slate-400 font-medium">Chúc bạn một ngày tốt lành và nhiều sức khỏe.</p>
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
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số người phía trước</p>
                                    <p className="text-3xl font-black text-blue-600">{q.peopleAhead}</p>
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

            {/* Quick Actions */}
            <section className="bg-blue-50 rounded-[3rem] p-8 md:p-12 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-200/50">
                        <History className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-blue-900 tracking-tight">Cần xem lại đơn thuốc?</h3>
                        <p className="text-blue-700/60 font-medium">Xem lại toàn bộ lịch sử khám và đơn thuốc cũ tại đây.</p>
                    </div>
                </div>
                <Link
                    to="/patient/history"
                    className="px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm tracking-tight hover:bg-blue-700 shadow-xl shadow-blue-300/50 transition-all whitespace-nowrap"
                >
                    Truy cập Hồ sơ
                </Link>
            </section>
        </div>
    )
}
