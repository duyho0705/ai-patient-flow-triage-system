import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { PrescriptionModal } from '@/components/modals/PrescriptionModal'
import { AppointmentModal } from '@/components/modals/AppointmentModal'
import { AdviceModal } from '@/components/modals/AdviceModal'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { useQuery } from '@tanstack/react-query'
import {
    User,
    Mail,
    CalendarDays,
    Calendar as CalendarIcon,
    AlertTriangle,
    CheckCircle2,
    MoreVertical,
    TrendingUp,
    FileText,
    Send,
    Loader2,
} from 'lucide-react'

import {
    AreaChart,
    Area,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts'

import { getDoctorDashboard } from '@/api/doctor'
import { getDoctorTodayAppointments } from '@/api/doctorAppointments'
import { ChronicDiseaseService } from '@/services/ChronicDiseaseService'

export function DoctorDashboard() {
    const { headers, tenantId } = useTenant()
    const navigate = useNavigate()
    const [timeRange] = useState('7 ngày qua')
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
    const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false)
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
    // ─── Fetch Real Data ───
    const { data: dashboard, isLoading: loadingDash } = useQuery({
        queryKey: ['doctor-dashboard', tenantId],
        queryFn: () => getDoctorDashboard(headers),
        enabled: !!tenantId
    })

    // Priority Sort for Risk Patients
    const sortedRiskPatients = useMemo(() => {
        if (!dashboard?.riskPatients) return [];
        return ChronicDiseaseService.sortRiskPatients(dashboard.riskPatients);
    }, [dashboard?.riskPatients]);

    const { data: todayAppointments } = useQuery({
        queryKey: ['doctor-today-appointments', tenantId],
        queryFn: () => getDoctorTodayAppointments(headers),
        enabled: !!tenantId
    })

    // ─── Chart data derived from dashboard stats ───
    const communityHealthData = useMemo(() => {
        const completed = dashboard?.completedConsultationsToday ?? 0
        return [
            { name: 'Th2', 'Chỉ số': 0 },
            { name: 'Th3', 'Chỉ số': 0 },
            { name: 'Th4', 'Chỉ số': 0 },
            { name: 'Th5', 'Chỉ số': 0 },
            { name: 'Th6', 'Chỉ số': 0 },
            { name: 'Th7', 'Chỉ số': 0 },
            { name: 'CN', 'Chỉ số': completed },
        ]
    }, [dashboard])

    // ─── Helper: Format date display ───
    const formatAppointmentDate = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10)
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
        return (dateStr?: string) => {
            if (!dateStr) return 'Hôm nay'
            if (dateStr === today) return 'Hôm nay'
            if (dateStr === tomorrow) return 'Ngày mai'
            return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        }
    }, [])

    // Merge: ưu tiên todayAppointments nếu có, fallback lên dashboard.upcomingAppointments
    const displayAppointments = todayAppointments?.length
        ? todayAppointments
        : dashboard?.upcomingAppointments || []



    if (loadingDash) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="font-bold text-sm uppercase tracking-widest">Đang tải dữ liệu thực tế...</p>
            </div>
        )
    }

    const stats = [
        {
            label: 'Tổng bệnh nhân',
            value: dashboard?.totalPatientsToday?.toLocaleString() || '0',
            trend: '—',
            trendIcon: TrendingUp,
            icon: User,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            label: 'Nguy cơ cao',
            value: dashboard?.riskPatients?.length?.toString() || '0',
            trend: 'Cảnh báo',
            isWarning: true,
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-100 dark:bg-red-900/30'
        },
        {
            label: 'Lịch hẹn chờ',
            value: dashboard?.pendingConsultations?.toString() || '0',
            icon: CalendarDays,
            color: 'text-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            label: 'Tin nhắn mới',
            value: (dashboard?.unreadMessages?.length ?? 0).toString(),
            icon: Mail,
            color: 'text-amber-500',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            path: '/chat'
        }
    ]

    const navigationPathMap: Record<string, string> = {
        'Tổng bệnh nhân': '/patients',
        'Nguy cơ cao': '/analytics',
        'Lịch hẹn chờ': '/scheduling',
        'Tin nhắn mới': '/chat'
    }

    return (
        <div className="relative min-h-[calc(100vh-80px)] isolate px-8 py-8">
            {/* Background Decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="space-y-8 pb-12 animate-in fade-in duration-700 font-display">
                {/* ─── Summary Cards ─── */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => navigate(navigationPathMap[stat.label])}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                {stat.trend && (
                                    <span className={`text-xs font-bold ${stat.isWarning ? 'bg-red-500 text-white' : 'text-green-500'} flex items-center gap-1 ${stat.isWarning ? 'px-2 py-1 rounded-full' : ''}`}>
                                        {stat.trend} {stat.trendIcon && <stat.trendIcon className="w-3 h-3" />}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
                            <p className={`text-4xl font-extrabold ${stat.isWarning ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ─── High Risk Patients Section ─── */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-extrabold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500 fill-red-500/20" />
                                Phân tích nguy cơ cao
                            </h2>
                            <button onClick={() => navigate('/patients')} className="text-primary text-sm font-bold hover:underline">Xem tất cả</button>
                        </div>

                        <div className="space-y-6">
                            {sortedRiskPatients && sortedRiskPatients.length > 0 ? (
                                sortedRiskPatients.slice(0, 4).map((risk: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-[6px] ${risk.riskLevel === 'CRITICAL' ? 'border-l-red-500' : 'border-l-amber-500'
                                            } border-y border-r border-primary/5 flex items-center justify-between shadow-sm group hover:border-primary transition-all cursor-pointer`}
                                        onClick={() => navigate(`/patients/${risk.patientId}/ehr`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
                                                {risk.patientAvatar ? (
                                                    <img src={risk.patientAvatar} alt={risk.patientName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-black text-slate-400 bg-slate-100 dark:bg-slate-800 text-xl">
                                                        {risk.patientName?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg group-hover:text-primary transition-colors">{risk.patientName}</p>
                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                    <span>{risk.riskLevel}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span className="truncate max-w-[150px]">{risk.reason}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center px-6 hidden sm:block">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</p>
                                            <p className={`font-extrabold text-lg ${risk.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>{risk.riskLevel}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Hệ thống AI đề xuất</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full text-center ${risk.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {risk.riskLevel === 'CRITICAL' ? 'Nguy cấp' : 'Cần theo dõi'}
                                            </span>
                                            <button 
                                                onClick={() => navigate(`/patients/${risk.patientId}/ehr`)}
                                                className="bg-primary text-slate-900 text-xs font-bold py-2 px-4 rounded-xl hover:bg-primary/90 transition-all shadow-sm active:scale-95">Chi tiết</button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-primary/20 text-center">
                                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-20" />
                                    <p className="text-sm font-bold text-slate-500">Không có cảnh báo nguy cơ</p>
                                </div>
                            )}
                        </div>

                        {/* ─── Health Trend Chart Preview ─── */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Xu hướng sức khỏe cộng đồng</h3>
                                    <p className="text-xs text-slate-500">Thống kê dữ liệu lâm sàng theo tuần</p>
                                </div>

                                {/* timeRange selection dropdown omitted for brevity, keeping simple button for now or just the text */}
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                                    {timeRange}
                                </div>
                            </div>

                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={communityHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="doctorCommunityGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4ade80" strokeOpacity={0.05} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                            dy={10}
                                        />
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                border: 'none',
                                                borderRadius: '16px',
                                                padding: '12px',
                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                                            }}
                                            itemStyle={{ color: '#4ade80', fontSize: '11px', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
                                            cursor={{ stroke: '#4ade80', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="Chỉ số"
                                            stroke="#4ade80"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#doctorCommunityGrad)"
                                            animationDuration={2000}
                                            dot={{ fill: '#4ade80', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#4ade80' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* ─── NEW: Critical Vitals Alerts Section ─── */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-extrabold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Theo dõi bất thường (24h qua)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dashboard?.criticalVitalsAlerts && dashboard.criticalVitalsAlerts.length > 0 ? (
                                    dashboard.criticalVitalsAlerts.map((alert: string, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + (idx * 0.05) }}
                                            className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-start gap-3"
                                        >
                                            <div className="size-8 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-red-900 dark:text-red-400 leading-tight">{alert}</p>
                                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">Cảnh báo tự động</p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="md:col-span-2 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                                        <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Không có chỉ số bất thường khẩn cấp</p>
                                    </div>
                                )}
                            </div>
                        </section>

                    </section>

                    {/* Sidebar Area */}
                    <aside className="space-y-8">
                        {/* Quick Actions */}
                        <section>
                            <h2 className="text-xl font-extrabold mb-4">Thao tác nhanh</h2>
                            <div className="grid grid-cols-1 gap-5">
                                <button
                                    onClick={() => setIsPrescriptionModalOpen(true)}
                                    className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 hover:border-primary transition-all rounded-2xl border border-primary/10 shadow-sm text-left group"
                                >
                                    <div className="w-10 h-10 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Kê đơn thuốc điện tử</span>
                                </button>

                                <button
                                    onClick={() => setIsAdviceModalOpen(true)}
                                    className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 hover:border-primary transition-all rounded-2xl border border-primary/10 shadow-sm text-left group"
                                >
                                    <div className="w-10 h-10 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Gửi lời khuyên</span>
                                </button>

                                <button
                                    onClick={() => setIsAppointmentModalOpen(true)}
                                    className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 hover:border-primary transition-all rounded-2xl border border-primary/10 shadow-sm text-left group"
                                >
                                    <div className="w-10 h-10 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
                                        <CalendarIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Đặt lịch tái khám</span>
                                </button>
                            </div>
                        </section>

                        {/* Recent Appointments */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-extrabold">Lịch hẹn khám sắp tới</h2>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm divide-y divide-primary/5 overflow-hidden">
                                {displayAppointments.length > 0 ? (
                                    displayAppointments.slice(0, 4).map((apt: any, i: number) => (
                                        <div key={apt.id || i} className="p-5 flex items-center gap-5 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => navigate('/scheduling')}>
                                            <div className="flex-shrink-0 text-center min-w-[52px]">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{formatAppointmentDate(apt.date || apt.appointmentDate)}</p>
                                                <p className="text-lg font-extrabold text-primary leading-none">{apt.startTime?.slice(0, 5)}</p>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-bold truncate text-sm text-slate-900 dark:text-white uppercase">{apt.patientName}</p>
                                                <p className="text-xs text-slate-500 truncate">{apt.appointmentType === 'FOLLOW_UP' ? 'Tái khám' : apt.appointmentType || 'Khám định kỳ'}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {apt.status === 'SCHEDULED' && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                                                {apt.status === 'ARRIVED' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                                                {apt.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                <MoreVertical className="w-4 h-4 text-slate-300" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-xs italic">Không có lịch hẹn hôm nay</div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/scheduling')}
                                className="w-full mt-4 py-3 border border-dashed border-primary/30 text-primary font-bold text-sm rounded-xl hover:bg-primary/5 transition-colors active:scale-[0.98]"
                            >
                                Xem toàn bộ lịch trình
                            </button>
                        </section>
                    </aside>
                </div>
            </div>

            {/* ─── Modals ─── */}

            {/* Prescription Modal */}
            <PrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
            />

            {/* Advice Modal */}
            <AdviceModal
                isOpen={isAdviceModalOpen}
                onClose={() => setIsAdviceModalOpen(false)}
            />

            <AppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
            />
        </div>
    )
}
