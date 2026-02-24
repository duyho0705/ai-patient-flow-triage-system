import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getPatientCrmInsights } from '@/api/patients'
import { X, Heart, ShieldAlert, TrendingDown, Bell, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PatientDto } from '@/types/api'

export function PatientCrmModal({
    patient,
    onClose
}: {
    patient: PatientDto,
    onClose: () => void
}) {
    const { headers } = useTenant()
    const { data: insight, isLoading } = useQuery({
        queryKey: ['patient-crm', patient.id],
        queryFn: () => getPatientCrmInsights(patient.id, headers),
        enabled: !!patient.id && !!headers
    })

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                <Heart className="w-8 h-8 text-rose-500 fill-rose-50" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{patient.fullNameVi}</h2>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Patient Clinical Journey Insight</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-sm rounded-2xl transition-all">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI đang phân tích dữ liệu gắn kết...</p>
                            </div>
                        ) : insight ? (
                            <>
                                {/* Top Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden group">
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chỉ số Tuân thủ</p>
                                            <h4 className="text-4xl font-black text-slate-900 mb-2">{insight.adherenceScore}%</h4>
                                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${insight.adherenceScore}%` }}
                                                    className="h-full bg-blue-600 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden group">
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tình trạng Sức khỏe</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${insight.healthScoreLabel === 'STABLE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                    }`}>
                                                    {insight.healthScoreLabel}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-500 mt-4 leading-relaxed">{insight.aiSummary}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden group">
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rủi ro Rời bỏ (Retention)</p>
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-2xl font-black ${insight.retentionRisk === 'LOW' ? 'text-emerald-500' : insight.retentionRisk === 'MEDIUM' ? 'text-amber-500' : 'text-rose-500'
                                                    }`}>
                                                    {insight.retentionRisk}
                                                </h4>
                                                {insight.retentionRisk !== 'LOW' && <TrendingDown className="w-6 h-6 text-rose-500" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Care Gaps Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">Các lỗ hổng trong chăm sóc (Care Gaps)</h3>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {insight.careGaps?.map((gap: any, i: number) => (
                                            <div key={i} className="flex gap-4 p-6 bg-white border border-slate-100 rounded-3xl hover:border-amber-200 transition-all shadow-sm">
                                                <div className="shrink-0 w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{gap.title}</p>
                                                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{gap.description}</p>
                                                    <div className="pt-2 flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-amber-600 uppercase">Khuyên nghị:</span>
                                                        <p className="text-[10px] font-bold text-slate-700">{gap.recommendation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Next Best Action */}
                                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
                                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 blur-[60px]" />
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-blue-400" />
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Next Best Action for CS/Nurses</p>
                                            </div>
                                            <h4 className="text-xl font-black">{insight.nextBestAction}</h4>
                                        </div>
                                        <button className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all shadow-lg flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Xác nhận thực hiện
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                Không thể tải thông tin Insight lúc này.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
