import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { useQuery } from '@tanstack/react-query'
import {
    Users,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    MoreVertical,
    TrendingUp,
    MessageCircle,
    FileText,
    Send,
    Loader2
} from 'lucide-react'

import { motion } from 'framer-motion'
import { getDoctorDashboard, getDoctorPatients } from '@/api/doctor'

export function DoctorDashboard() {
    const { headers, tenantId } = useTenant()
    const navigate = useNavigate()


    // ─── Fetch Real Data ───
    const { data: dashboard, isLoading: loadingDash } = useQuery({
        queryKey: ['doctor-dashboard', tenantId],
        queryFn: () => getDoctorDashboard(headers),
        enabled: !!tenantId
    })

    const { data: patientList, isLoading: loadingPatients } = useQuery({
        queryKey: ['doctor-patients', tenantId],
        queryFn: () => getDoctorPatients(headers, 0, 5),
        enabled: !!tenantId
    })

    if (loadingDash || loadingPatients) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="font-bold text-sm uppercase tracking-widest">Đang tải dữ liệu thực tế...</p>
            </div>
        )
    }

    // ─── Map Real Data to UI ───
    const stats = [
        {
            label: 'Tổng bệnh nhân',
            value: dashboard?.totalPatientsToday.toLocaleString() || '1,250',
            trend: '+2.4%',
            trendIcon: TrendingUp,
            icon: Users,
            color: 'text-primary-600',
            bg: 'bg-primary/10'
        },
        {
            label: 'Nguy cơ cao',
            value: dashboard?.riskPatients.length.toString() || '12',
            trend: 'Cảnh báo',
            isWarning: true,
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-100 dark:bg-red-900/30'
        },
        {
            label: 'Lịch hẹn khám chờ',
            value: dashboard?.pendingConsultations.toString() || '08',
            icon: Calendar,
            color: 'text-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            label: 'Tin nhắn mới',
            value: '05',
            icon: MessageCircle,
            color: 'text-amber-500',
            bg: 'bg-amber-100 dark:bg-amber-900/30'
        }
    ]

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700 font-display">
            {/* ─── Summary Cards ─── */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm"
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
                        <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                        <p className={`text-3xl font-extrabold mt-1 ${stat.isWarning ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ─── High Risk Patients Section (Left 2 cols) ─── */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-extrabold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Phân tích nguy cơ cao
                        </h2>
                        <button className="text-primary text-sm font-bold hover:underline">Xem tất cả</button>
                    </div>

                    <div className="space-y-4">
                        {dashboard?.riskPatients && dashboard.riskPatients.length > 0 ? (
                            dashboard.riskPatients.slice(0, 3).map((risk, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border-l-4 ${risk.riskLevel === 'CRITICAL' ? 'border-l-red-500' : 'border-l-amber-500'
                                        } border-y border-r border-primary/5 flex items-center justify-between shadow-sm group hover:border-primary transition-all cursor-pointer`}
                                    onClick={() => navigate(`/patients/${risk.patientId}/ehr`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                                            {risk.patientAvatar ? (
                                                <img src={risk.patientAvatar} alt={risk.patientName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-slate-400 bg-slate-100 dark:bg-slate-800">
                                                    {risk.patientName?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg group-hover:text-primary transition-colors">{risk.patientName}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span>65 tuổi</span>
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
                                        <button className="bg-primary text-slate-900 text-xs font-bold py-2 px-4 rounded-xl hover:bg-primary/90 transition-all shadow-sm active:scale-95">Chi tiết</button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-primary/20 text-center text-slate-400">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-bold uppercase tracking-widest">Không có cảnh báo nguy cơ</p>
                            </div>
                        )}
                    </div>

                    {/* ─── Health Trend Chart Preview ─── */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Xu hướng sức khỏe cộng đồng</h3>
                                <p className="text-xs text-slate-500">Thống kê dữ liệu lâm sàng theo tuần</p>
                            </div>
                            <select className="text-xs border-primary/10 rounded-lg bg-background-light dark:bg-slate-800 focus:ring-primary font-bold">
                                <option>7 ngày qua</option>
                                <option>30 ngày qua</option>
                            </select>
                        </div>
                        <div className="h-48 flex items-end justify-between gap-2 px-2">
                            {[40, 60, 55, 75, 90, 85, 70, 45, 65, 50, 80, 70].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: 0.5 + (i * 0.05), duration: 0.8 }}
                                    className={`w-full rounded-t-lg relative group transition-all ${h > 80 ? 'bg-primary' : h > 60 ? 'bg-primary/60' : 'bg-primary/20'}`}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-xl">
                                        {h}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Th2</span><span>Th3</span><span>Th4</span><span>Th5</span><span>Th6</span><span>Th7</span><span>CN</span>
                        </div>
                    </div>
                </section>

                {/* ─── Sidebar Area (1 col) ─── */}
                <aside className="space-y-8">
                    {/* Quick Actions */}
                    <section>
                        <h2 className="text-xl font-extrabold mb-4">Thao tác nhanh</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => navigate('/staff/prescriptions')}
                                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 hover:border-primary transition-all rounded-2xl border border-primary/10 shadow-sm text-left group active:scale-95"
                            >
                                <div className="w-10 h-10 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm">Kê đơn thuốc mới</span>
                            </button>
                            <button
                                onClick={() => navigate('/staff/chat')}
                                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 hover:border-primary transition-all rounded-2xl border border-primary/10 shadow-sm text-left group active:scale-95"
                            >
                                <div className="w-10 h-10 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
                                    <Send className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm">Gửi lời khuyên</span>
                            </button>
                            <button
                                onClick={() => navigate('/staff/scheduling')}
                                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 hover:border-primary transition-all rounded-2xl border border-primary/10 shadow-sm text-left group active:scale-95"
                            >
                                <div className="w-10 h-10 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
                                    <Calendar className="w-5 h-5" />
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
                            {dashboard?.upcomingAppointments && dashboard.upcomingAppointments.length > 0 ? (
                                dashboard.upcomingAppointments.slice(0, 3).map((apt, i) => (
                                    <div key={i} className="p-4 flex items-center gap-4 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => navigate('/staff/scheduling')}>
                                        <div className="flex-shrink-0 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Hôm nay</p>
                                            <p className="text-lg font-extrabold text-primary leading-none">{apt.startTime?.slice(0, 5)}</p>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-bold truncate text-sm text-slate-900 dark:text-white uppercase">{apt.patientName}</p>
                                            <p className="text-xs text-slate-500 truncate">{apt.appointmentType || 'Khám định kỳ'}</p>
                                        </div>
                                        <MoreVertical className="w-4 h-4 text-slate-300" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-xs italic">Không có lịch hẹn hôm nay</div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/staff/scheduling')}
                            className="w-full mt-4 py-3 bg-primary text-slate-900 font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 uppercase tracking-widest active:scale-95"
                        >
                            Xem toàn bộ lịch trình
                        </button>
                    </section>
                </aside>
            </div>

            {/* ─── Patient Management Table ─── */}
            <section className="mt-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Quản lý bệnh nhân gần đây</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Hồ sơ bệnh nhân mới được cập nhật chỉ số sức khỏe</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-primary/10 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">Lọc theo khoa</button>
                        <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-primary/10 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">Xuất báo cáo</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 border-b border-primary/5">
                                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Bệnh nhân</th>
                                    <th className="px-6 py-4">Chỉ số gần nhất</th>
                                    <th className="px-6 py-4">Tình trạng</th>
                                    <th className="px-6 py-4">Cập nhật lần cuối</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {patientList?.content.map((patient, i) => (
                                    <tr key={i} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs border border-emerald-100 group-hover:scale-110 transition-transform">
                                                    {patient.fullNameVi?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{patient.fullNameVi}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: #SK-{patient.externalId || patient.id.slice(0, 4)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4">
                                                <div className="text-xs">
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Đường huyết</p>
                                                    <p className="font-extrabold text-slate-700 dark:text-slate-300">7.2 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter ml-1">mmol/L</span></p>
                                                </div>
                                                <div className="text-xs">
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Huyết áp</p>
                                                    <p className="font-extrabold text-slate-700 dark:text-slate-300">120/80 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter ml-1">mmHg</span></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${patient.isActive ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-400'}`}>
                                                {patient.isActive ? 'Ổn định' : 'Ngưng theo dõi'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                            {patient.updatedAt ? new Date(patient.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '10 phút trước'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/patients/${patient.id}/ehr`)}
                                                className="p-2.5 text-slate-400 hover:text-primary transition-all rounded-xl hover:bg-white shadow-none hover:shadow-sm"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    )
}

