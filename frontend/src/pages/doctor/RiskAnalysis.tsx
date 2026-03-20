import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
    TrendingUp, 
    AlertTriangle, 
    FileText, 
    Download, 
    Search, 
    Filter,
    Brain,
    Info,
    CheckCircle2,
    Loader2
} from 'lucide-react'
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts'
import { getDoctorRiskAnalysis } from '@/api/doctor'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'

export function RiskAnalysis() {
    const navigate = useNavigate()
    const { headers } = useTenant()
    const [searchTerm, setSearchTerm] = useState('')
    const [riskFilter, setRiskFilter] = useState<string>('')

    const { data: dashboard, isLoading } = useQuery({
        queryKey: ['doctor-risk-analysis', headers?.tenantId],
        queryFn: () => getDoctorRiskAnalysis(headers),
        enabled: !!headers?.tenantId
    })

    const filteredPatients = useMemo(() => {
        const list = dashboard?.priorityList || []
        return list.filter((p: any) => {
            const name = p.fullNameVi || p.patientName || ''
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesRisk = riskFilter ? p.riskLevel === riskFilter : true
            return matchesSearch && matchesRisk
        })
    }, [dashboard, searchTerm, riskFilter])

    const chartData = useMemo(() => {
        if (!dashboard?.riskTrend7Days) return []
        return dashboard.riskTrend7Days.map((val, idx) => ({
            date: `D-${7-idx}`,
            level: val
        }))
    }, [dashboard])

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 bg-md-background font-sans space-y-10 pb-20 px-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2 text-left">
                    <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">Risk Analysis & Prediction</h2>
                    <p className="text-md-on-surface-variant font-medium opacity-70">
                        Phân tích đa chiều và dự báo nguy cơ dựa trên các chỉ số sinh hiệu thời gian thực.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 h-14 px-8 bg-md-surface-container-highest text-md-on-surface rounded-full font-bold text-sm shadow-elevation-1 hover:shadow-elevation-2 transition-all active:scale-95 group">
                        <Download className="size-5 group-hover:translate-y-0.5 transition-transform" />
                        <span>Export ML Insights</span>
                    </button>
                    <button className="flex items-center gap-2 h-14 px-8 bg-md-primary text-white rounded-full font-bold text-sm shadow-elevation-2 hover:shadow-elevation-4 transition-all active:scale-95 group">
                        <Brain className="size-5 animate-pulse" />
                        <span>AI Wisdom Re-scan</span>
                    </button>
                </div>
            </div>

            {/* Risk Distribution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <RiskStatCard title="Critical/High" value={dashboard?.criticalPatientsCount || 0} icon={AlertTriangle} color="rose" percentage="+12%" isUp />
                <RiskStatCard title="New Alerts (24h)" value={dashboard?.newAlerts24hCount || 0} icon={TrendingUp} color="amber" percentage="+5%" isUp />
                <RiskStatCard title="Stable Rate" value={`${dashboard?.stablePatientsPercentage || 0}%`} icon={CheckCircle2} color="emerald" percentage="+8.4%" isUp />
                <RiskStatCard title="Total Monitored" value="Syncing..." icon={Info} color="slate" percentage="0%" isUp />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Chart Area */}
                <div className="lg:col-span-2 space-y-8">
                     <div className="bg-md-surface-container-lowest rounded-[3rem] border border-md-outline/10 shadow-sm p-10 flex flex-col gap-10 h-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                             <div>
                                <h3 className="text-xl font-bold text-md-on-surface tracking-tight leading-none mb-2">Cohort Risk Trends</h3>
                                <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-60">Biến động chỉ số rủi ro tổng hợp 7 ngày</p>
                             </div>
                             <div className="flex gap-2">
                                <LegendItem label="Risk Index" color="#fb7185" />
                             </div>
                        </div>
                        <div className="flex-1 min-h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fb7185" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                                    />
                                    <Area type="monotone" dataKey="level" stroke="#fb7185" strokeWidth={4} fillOpacity={1} fill="url(#colorRisk)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                     </div>
                </div>

                {/* AI Insights & Priority */}
                <div className="lg:col-span-1 flex flex-col gap-10">
                     <div className="bg-md-on-surface text-white p-10 rounded-[4rem] shadow-elevation-4 relative overflow-hidden group border border-white/10 flex-1 flex flex-col justify-between">
                         <div className="absolute -top-10 -right-10 size-48 bg-md-primary/20 blur-3xl rounded-full group-hover:scale-150 duration-1000" />
                         <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-[1.2rem] border border-white/10">
                                    <Brain className="size-8 text-md-primary" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight">AI Strategies</h3>
                            </div>
                            <div className="space-y-6">
                                {(dashboard?.aiInsights ?? []).map((insight: any, idx: number) => (
                                    <InsightItem 
                                        key={idx}
                                        text={insight.description || insight.title} 
                                    />
                                ))}
                                {dashboard?.aiInsights?.length === 0 && (
                                     <InsightItem text="Hệ thống đang thu thập thêm dữ liệu để đưa ra các dự báo lâm sàng chính xác hơn." />
                                )}
                            </div>
                         </div>
                         <button className="relative z-10 w-full h-16 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                             View Recommendation Hub
                         </button>
                     </div>
                </div>
            </div>

            {/* Patient Priority Table */}
            <div className="bg-md-surface-container-lowest rounded-[3.5rem] border border-md-outline/10 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-md-surface-container-low/30">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-md-on-surface-variant opacity-40 group-focus-within:text-md-primary group-focus-within:opacity-100 transition-all pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Tìm định danh bệnh nhân trong danh sách ưu tiên..."
                            className="w-full h-14 pl-16 pr-8 bg-white border border-md-outline/5 rounded-2xl text-sm font-bold text-md-on-surface outline-none focus:ring-4 focus:ring-md-primary/10 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-md-on-surface-variant opacity-40 pointer-events-none" />
                            <select 
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                                className="h-14 pl-12 pr-10 bg-white border border-md-outline/5 rounded-2xl text-xs font-black uppercase tracking-widest text-md-on-surface-variant appearance-none cursor-pointer outline-none focus:ring-4 focus:ring-md-primary/10 transition-all min-w-[180px]"
                            >
                                <option value="">Toàn bộ rủi ro</option>
                                <option value="CRITICAL">Critical Risk</option>
                                <option value="HIGH">High Risk</option>
                                <option value="MEDIUM">Medium Risk</option>
                                <option value="LOW">Low Risk</option>
                            </select>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="size-10 animate-spin text-md-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-md-on-surface-variant animate-pulse italic">Tri xuất dữ liệu rủi ro tổng hợp...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-md-outline/5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-40 italic">
                                    <th className="px-10 py-6">Bệnh nhân / Code</th>
                                    <th className="px-10 py-6">Trạng thái rủi ro</th>
                                    <th className="px-10 py-6">Vấn đề trọng tâm</th>
                                    <th className="px-10 py-6">Dự báo lâm sàng</th>
                                    <th className="px-10 py-6 text-right">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-md-outline/5">
                                {filteredPatients.map((patient: any, idx) => (
                                    <motion.tr
                                        key={patient.id || idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-md-primary/5 transition-all group"
                                    >
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-[0.8rem] bg-md-surface-container font-black text-sm flex items-center justify-center text-md-primary group-hover:scale-110 transition-transform">
                                                    {(patient.fullNameVi || patient.patientName || 'P').charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-md-on-surface group-hover:text-md-primary transition-colors">{patient.fullNameVi || patient.patientName}</span>
                                                    <span className="text-[10px] text-md-on-surface-variant opacity-40 italic tracking-tighter uppercase">ID: {patient.patientId?.substring(0,8) || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <RiskBadge level={patient.riskLevel} />
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-xs font-bold text-md-on-surface opacity-70 italic line-clamp-1 max-w-[200px]">
                                                {patient.reason || 'Sự thay đổi về nhịp tim và huyết áp'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex gap-1">
                                                {[1,2,3,4,5].map(i => (
                                                    <div key={i} className={`size-1 rounded-full ${i > 2 ? 'bg-md-primary' : 'bg-md-outline/20'}`} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button 
                                                onClick={() => navigate(`/doctor/patients/${patient.patientId}`)}
                                                className="p-3 text-md-on-surface-variant hover:text-md-primary hover:bg-md-primary/10 rounded-2xl transition-all active:scale-90"
                                            >
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

function RiskStatCard({ title, value, icon: Icon, color, percentage, isUp }: any) {
    const colorStyles: any = {
        slate: 'bg-slate-50 text-slate-500 border-slate-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
    return (
        <div className="bg-md-surface-container-lowest p-6 rounded-[2.5rem] border border-md-outline/10 shadow-sm flex items-center gap-6 group hover:translate-y-[-4px] hover:shadow-elevation-2 transition-all">
            <div className={`size-16 rounded-[1.5rem] flex items-center justify-center border shadow-sm group-hover:rotate-12 transition-transform ${colorStyles[color]}`}>
                <Icon size={28} />
            </div>
            <div className="flex-1 text-left">
                 <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-40 italic leading-none">{title}</p>
                 <div className="flex items-center gap-2 mt-2">
                    <h4 className="text-2xl font-black text-md-on-surface tracking-tighter">{value}</h4>
                    <span className={`text-[10px] font-black ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isUp ? '+' : ''}{percentage}
                    </span>
                 </div>
            </div>
        </div>
    )
}

function RiskBadge({ level }: { level: string }) {
    const isCritical = level === 'CRITICAL' || level === 'HIGH'
    const isMed = level === 'MEDIUM'
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            isCritical ? 'bg-rose-50 text-rose-600 border-rose-100' :
            isMed ? 'bg-amber-50 text-amber-600 border-amber-100' :
            'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
            <div className={`size-1.5 rounded-full animate-pulse ${isCritical ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{level}</span>
        </div>
    )
}

function LegendItem({ label, color }: { label: string, color: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="size-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-60 font-sans">{label}</span>
        </div>
    )
}

function InsightItem({ text }: { text: string }) {
    return (
        <div className="flex gap-4 group/item cursor-default text-left">
            <div className="size-2 rounded-full bg-md-primary mt-2 group-hover/item:scale-150 transition-all shadow-lg shadow-md-primary/40 shrink-0" />
            <p className="text-xs font-medium text-white/70 italic leading-relaxed hover:text-white transition-colors">
                {text}
            </p>
        </div>
    )
}
