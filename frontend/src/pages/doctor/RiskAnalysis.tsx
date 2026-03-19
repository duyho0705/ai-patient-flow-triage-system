import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
    AlertTriangle,
    BellRing,
    ShieldCheck,
    AlertCircle,
    Send,
    PhoneCall,
    ClipboardList,
    BarChart3,
    Sparkles,
    Brain,
    Pill,
    TrendingUp,
    TrendingDown,
    LifeBuoy,
    Video,
    FileText,
    CheckCircle,
    Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { getDoctorRiskAnalysis, exportRiskReportPdf } from '@/api/doctor'
import { useTenant } from '@/context/TenantContext'
import { Loader2 } from 'lucide-react'
import { toastService } from '@/services/toast'
import { useState } from 'react'

export function RiskAnalysis() {
    const { headers, tenantId } = useTenant()
    const [isExporting, setIsExporting] = useState(false)
    
    const { data: dashboard, isLoading } = useQuery({
        queryKey: ['doctor-risk-analysis', tenantId],
        queryFn: () => getDoctorRiskAnalysis(headers),
        enabled: !!tenantId
    })

    const handleExportPdf = async () => {
        setIsExporting(true)
        toastService.info('Đang khởi tạo báo cáo rủi ro...')
        try {
            const blob = await exportRiskReportPdf(headers)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Risk_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            toastService.success('Xuất báo cáo thành công')
        } catch (error) {
            console.error(error)
            toastService.error('Không thể xuất báo cáo rủi ro.')
        } finally {
            setIsExporting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-slate-400 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="font-bold text-sm uppercase tracking-widest">Đang tải phân tích rủi ro...</p>
            </div>
        )
    }

    return (
        <div className="flex-1 p-8 space-y-8 animate-in fade-in duration-700 bg-background-light dark:bg-background-dark font-display min-h-[calc(100vh-80px)]">
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-16 h-16 text-red-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Nguy cơ cao</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{dashboard?.criticalPatientsCount || 0}</span>
                        <span className="text-red-500 text-sm font-bold flex items-center gap-0.5">
                            <TrendingUp className="w-4 h-4" /> +12%
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Bệnh nhân cần can thiệp ngay</p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <BellRing className="w-16 h-16 text-amber-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Cảnh báo 24h</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">+{dashboard?.newAlerts24hCount || 0}</span>
                        <span className="text-amber-500 text-sm font-bold flex items-center gap-0.5">
                            <Activity className="w-4 h-4" /> Mới
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Số ca phát sinh cảnh báo mới</p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-16 h-16 text-emerald-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Tỷ lệ ổn định</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{dashboard?.stablePatientsPercentage || 0}%</span>
                        <span className="text-emerald-500 text-sm font-bold flex items-center gap-0.5">
                            <CheckCircle className="w-4 h-4" /> Tốt
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Bệnh nhân trong ngưỡng an toàn</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Priority List */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500" /> Danh sách ưu tiên can thiệp
                            </h3>
                            <span className="text-[10px] font-black px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md uppercase tracking-wider">
                                Khẩn cấp
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50/30 dark:bg-slate-800/20">
                                        <th className="px-6 py-4">Bệnh nhân</th>
                                        <th className="px-6 py-4">Chỉ số bất thường</th>
                                        <th className="px-6 py-4 text-center">Xu hướng</th>
                                        <th className="px-6 py-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {dashboard?.priorityList && dashboard.priorityList.length > 0 ? (
                                        dashboard.priorityList.slice(0, 5).map((patient: any, idx: number) => {
                                            const isCritical = patient.riskLevel === 'CRITICAL'
                                            return (
                                            <tr key={patient.patientId || idx} className={`hover:bg-${isCritical ? 'red' : 'amber'}-50/30 dark:hover:bg-${isCritical ? 'red' : 'amber'}-900/5 transition-colors group ${!isCritical ? 'border-l-4 border-amber-400' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-[10px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-600 dark:text-slate-400">
                                                            {patient.patientName?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-900 dark:text-white">{patient.patientName}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">BN-{patient.patientId?.substring(0, 5) || 'UNKNOWN'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className={`${isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'} font-bold text-sm truncate max-w-[200px]`}>
                                                            {patient.reason || 'Cần theo dõi sát'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center justify-center ${isCritical ? 'text-red-500' : 'text-amber-500'} font-black gap-1`}>
                                                        {patient.lastVitalTrend?.includes('xấu đi') ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                        <span className="text-sm truncate max-w-[100px]">{patient.lastVitalTrend || 'Không biến động'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            title="Gửi cảnh báo"
                                                            className="p-2 rounded-[10px] text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            title="Gọi khẩn cấp"
                                                            className="p-2 rounded-[10px] text-red-500 hover:bg-red-500/10 dark:hover:bg-slate-800 transition-all"
                                                        >
                                                            <PhoneCall className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            title="Sửa đơn thuốc"
                                                            className="p-2 rounded-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                        >
                                                            <ClipboardList className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )})
                                    ) : (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">Không có bệnh nhân trong danh sách ưu tiên.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
                            <button className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:text-emerald-700 transition-all">
                                Xem tất cả bệnh nhân rủi ro
                            </button>
                        </div>
                    </section>

                    {/* Risk Trend Chart */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-emerald-600" /> Xu hướng nguy cơ (7 ngày qua)
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Nguy cấp</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600/20 shadow-sm"></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Khác</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={(dashboard?.riskTrend7Days || []).map((v, i) => ({
                                        day: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i],
                                        value: v
                                    }))}
                                    margin={{ top: 10, right: 10, left: -40, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }}
                                    />
                                    <YAxis hide domain={[0, 'dataMax + 2']} />
                                    <RechartsTooltip 
                                        cursor={{ fill: '#F1F5F9', opacity: 0.5 }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {(dashboard?.riskTrend7Days || []).map((_entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={index === 6 ? '#10b981' : '#ef4444'} 
                                                fillOpacity={index === 6 ? 1 : 0.6}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                {/* Sidebar: AI Insights & Quick Actions */}
                <div className="flex flex-col gap-8">
                    {/* AI Insights */}
                    <section className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-8 flex flex-col gap-6 relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl transition-all group-hover:scale-110"></div>

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="p-2 bg-emerald-400 rounded-[10px] shadow-lg shadow-emerald-400/20">
                                <Sparkles className="w-5 h-5 text-slate-900" />
                            </div>
                            <h3 className="font-bold text-emerald-600 tracking-tight">AI Insights</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {dashboard?.aiInsights && dashboard.aiInsights.length > 0 ? (
                                dashboard.aiInsights.map((insight: any, idx: number) => {
                                    let Icon = Brain;
                                    let colorClass = 'text-amber-500';
                                    if (insight.type === 'CRITICAL') { Icon = AlertTriangle; colorClass = 'text-red-500'; }
                                    if (insight.type === 'WARNING') { Icon = Pill; colorClass = 'text-amber-500'; }
                                    if (insight.type === 'POSITIVE') { Icon = TrendingDown; colorClass = 'text-emerald-500'; }

                                    return (
                                        <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex gap-4">
                                                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colorClass}`} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{insight.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{insight.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center text-sm text-slate-500 border border-dashed border-emerald-200/50 p-6 rounded-2xl">
                                    Không có Insights nào lúc này.
                                </div>
                            )}
                        </div>

                        <button className="w-full mt-2 py-3 bg-primary text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 relative z-10 active:scale-95">
                            Gửi tất cả thông báo AI
                        </button>
                    </section>

                    {/* Quick Actions */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Phím tắt khẩn cấp</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-100 dark:border-red-900/30 hover:bg-red-100/50 transition-all group scale-100 active:scale-95">
                                <LifeBuoy className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Cấp cứu</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100/50 transition-all group scale-100 active:scale-95">
                                <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Tele-Health</span>
                            </button>
                            <button 
                                onClick={handleExportPdf}
                                disabled={isExporting}
                                className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all col-span-2 group scale-100 active:scale-95 disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    {isExporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isExporting ? 'Đang chuẩn bị...' : 'Xuất báo cáo rủi ro (.pdf)'}</span>
                                </div>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
