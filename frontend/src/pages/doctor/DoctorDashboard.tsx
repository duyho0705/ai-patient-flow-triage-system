import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
    Calendar, 
    Clock, 
    Filter,
    Plus,
    CheckCircle2,
    AlertTriangle,
    Activity,
    ArrowRight,
    Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getDoctorDashboard } from '@/api/doctor'
import { useTenant } from '@/context/TenantContext'

export function DoctorDashboard() {
    const navigate = useNavigate()
    const { headers } = useTenant()
    
    const { data: dashboard, isLoading } = useQuery({
        queryKey: ['doctor-dashboard', headers?.tenantId],
        queryFn: () => getDoctorDashboard(headers),
        enabled: !!headers?.tenantId
    })

    const patientStats = useMemo(() => {
        if (!dashboard) return []
        return [
            { label: 'Today Patients', value: dashboard.totalPatientsToday || 0, icon: Activity, color: 'primary', trend: '+12%' },
            { label: 'Pending Consult', value: dashboard.pendingConsultations || 0, icon: AlertTriangle, color: 'error', trend: '+2%' },
            { label: 'Upcoming Appt', value: dashboard.upcomingAppointments?.length || 0, icon: Calendar, color: 'secondary', trend: '-5%' },
            { label: 'Completed Today', value: dashboard.completedConsultationsToday || 0, icon: CheckCircle2, color: 'success', trend: '+8%' },
        ]
    }, [dashboard])

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 bg-md-background font-sans space-y-10 pb-20 px-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">Physician Workstation</h2>
                    <p className="text-md-on-surface-variant font-medium opacity-70">
                        Chào bác sĩ, đây là tổng quan tình trạng lâm sàng của các bệnh nhân trong kỳ giám sát.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                         onClick={() => navigate('/doctor/patients')} 
                         className="flex items-center gap-2 h-14 px-8 bg-md-primary text-white rounded-full font-bold text-sm shadow-elevation-2 hover:shadow-elevation-4 transition-all active:scale-95 group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        <span>Tiếp nhận Bệnh nhân mới</span>
                    </button>
                    <button className="p-4 bg-md-surface-container-highest text-md-on-surface rounded-2xl border border-md-outline/10 shadow-sm transition-all hover:bg-white active:scale-90">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {patientStats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} index={idx} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Real-time Risk Monitoring */}
                <div className="lg:col-span-2 space-y-8 flex flex-col h-full">
                    <div className="bg-md-surface-container-lowest rounded-[3rem] border border-md-outline/10 shadow-sm p-8 flex flex-col gap-8 flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-md-on-surface tracking-tight leading-none mb-1">Critical Risk Monitoring</h3>
                            <button className="p-3 text-md-primary hover:bg-md-primary/10 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                Real-time Feed <div className="size-2 bg-md-primary rounded-full animate-ping" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-auto CustomScrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-md-outline/5 text-[9px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-40 italic">
                                        <th className="px-6 py-4">Bệnh nhân / Code</th>
                                        <th className="px-6 py-4 text-center">Tình trạng</th>
                                        <th className="px-6 py-4">Vấn đề trọng tâm</th>
                                        <th className="px-6 py-4 text-right">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-md-outline/5">
                                    {(dashboard?.riskPatients ?? []).map((patient: any, idx: number) => (
                                        <RiskRow key={idx} patient={patient} index={idx} />
                                    ))}
                                    {isLoading && (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <Loader2 className="size-10 animate-spin text-md-primary mx-auto mb-4" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-md-on-surface-variant animate-pulse italic">Synchronizing Neural Data...</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Vertical Schedule / Action Column */}
                <div className="lg:col-span-1 flex flex-col gap-10">
                    <div className="bg-md-on-surface text-white p-10 rounded-[3.5rem] shadow-elevation-4 relative overflow-hidden group border border-white/10 flex-1 flex flex-col gap-10">
                        <div className="absolute -top-10 -right-10 size-48 bg-md-primary/20 blur-3xl rounded-full transition-transform group-hover:scale-150 duration-1000" />
                        
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight">Today Schedule</h3>
                                <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1 italic">Triage & Interventions</p>
                            </div>
                            <div className="size-14 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/10 shadow-lg">
                                <Calendar size={24} className="text-md-primary" />
                            </div>
                        </div>

                        <div className="relative z-10 space-y-4">
                            {(dashboard?.upcomingAppointments ?? []).map((apt: any, idx: number) => (
                                <AppointmentRow key={idx} apt={apt} index={idx} />
                            ))}
                        </div>

                        <button 
                             onClick={() => navigate('/doctor/risk-analysis')} 
                             className="relative z-10 w-full h-18 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 backdrop-blur-md group"
                        >
                            Risk Predictive Analytics <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color, trend, index }: any) {
    const colorStyles: any = {
        primary: 'bg-md-primary/10 text-md-primary',
        error: 'bg-md-error-container text-md-on-error-container',
        secondary: 'bg-md-secondary-container text-md-on-secondary-container',
        success: 'bg-emerald-50 text-emerald-600'
    }
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-md-surface-container-lowest p-6 rounded-[2.5rem] border border-md-outline/10 shadow-sm flex items-center gap-6 group hover:translate-y-[-4px] hover:shadow-elevation-2 transition-all cursor-default"
        >
            <div className={`size-16 rounded-[1.5rem] flex items-center justify-center border border-md-outline/5 transition-transform group-hover:rotate-12 ${colorStyles[color]}`}>
                <Icon size={28} />
            </div>
            <div>
                 <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-40 italic font-sans leading-none">{label}</p>
                 <div className="flex items-center gap-3 mt-1">
                    <h4 className="text-3xl font-black text-md-on-surface tracking-tighter">{value}</h4>
                    <span className="text-[10px] font-black text-md-primary opacity-60">{trend}</span>
                 </div>
            </div>
        </motion.div>
    )
}

function RiskRow({ patient, index }: any) {
    const isCritical = patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL'
    return (
        <motion.tr 
             initial={{ opacity: 0, x: -10 }} 
             animate={{ opacity: 1, x: 0 }} 
             transition={{ delay: index * 0.03 }}
             className="group hover:bg-md-primary/5 transition-colors"
        >
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-md-surface-container-low border border-md-outline/5 flex items-center justify-center font-black text-sm text-md-on-surface group-hover:scale-110 transition-transform">
                        {patient.patientName?.charAt(0) || patient.fullNameVi?.charAt(0) || 'P'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-md-on-surface group-hover:text-md-primary transition-colors">{patient.patientName || patient.fullNameVi}</span>
                        <span className="text-[10px] text-md-on-surface-variant opacity-40 italic mt-0.5 tracking-tighter uppercase">{patient.patientId.substring(0,8)}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5 text-center px-4">
                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${isCritical ? 'bg-md-error-container text-md-on-error-container border-md-error/10' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                    <div className={`size-1.5 rounded-full ${isCritical ? 'bg-md-error animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{patient.riskLevel}</span>
                 </div>
            </td>
            <td className="px-6 py-5 text-xs font-bold text-md-on-surface opacity-60">
                <span className="italic line-clamp-1 max-w-[200px]">{patient.reason || 'Cảnh báo tự động từ hệ thống'}</span>
            </td>
            <td className="px-6 py-5 text-right">
                <ArrowRight size={18} className="text-md-outline opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all cursor-pointer inline-block" />
            </td>
        </motion.tr>
    )
}

function AppointmentRow({ apt, index }: any) {
    return (
        <motion.div 
             initial={{ opacity: 0, scale: 0.95 }} 
             whileHover={{ scale: 1.02 }}
             animate={{ opacity: 1, scale: 1 }} 
             transition={{ delay: index * 0.05 }}
             className="p-5 bg-white/10 rounded-[2rem] border border-white/5 group-hover:border-white/20 transition-all flex items-center gap-5 cursor-default hover:bg-white/20 shadow-inner"
        >
            <div className="p-3 bg-white/10 rounded-[1.2rem] text-sm font-black text-md-primary flex flex-col items-center">
                 <Clock size={16} />
                 <span className="mt-1 text-[9px]">{apt.startTime}</span>
            </div>
            <div className="flex-1">
                <h5 className="text-sm font-bold text-white group-hover:text-md-primary transition-colors">{apt.patientName}</h5>
                <p className="text-[10px] text-white/40 italic font-medium leading-tight mt-1 line-clamp-1">{apt.notes || 'Khám định kỳ (Scheduled)'}</p>
            </div>
            <ArrowRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
        </motion.div>
    )
}
