import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getChronicConditions,
    getVitalTargets,
    getMedicationReminders,
    getCarePlan,
    getSuggestedTemplates,
    getVitalHistory,
    downloadCdmReport,
    sendCdmReport,
    getFollowUpSuggestion,
    triggerMedicationReminder,
    getTreatmentEfficacy,
    getComplicationRisk,
    getStandardizedNote
} from '@/api/clinical'
import { post } from '@/api/client'
import { useTenant } from '@/context/TenantContext'
import { ShieldAlert, Pill, CheckCircle2, Brain, FileText, Sparkles, Activity, Download, Mail, Calendar, Clock, Bell, Info, TrendingUp, Zap, AlertTriangle, ClipboardCheck, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toastService } from '@/services/toast'
import { useState } from 'react'
import { VitalTargetVisualization } from './VitalTargetVisualization'

interface ChronicDiseasePanelProps {
    patientId: string;
    consultationId?: string;
}

export function ChronicDiseasePanel({ patientId, consultationId }: ChronicDiseasePanelProps) {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [carePlan, setCarePlan] = useState<string | null>(null)
    const [suggestedTemplates, setSuggestedTemplates] = useState<string | null>(null)

    const carePlanMutation = useMutation({
        mutationFn: () => getCarePlan(consultationId!, headers),
        onSuccess: (data) => {
            setCarePlan(data)
            toastService.success('Đã tạo kế hoạch chăm sóc AI')
        }
    })

    const suggestTemplatesMutation = useMutation({
        mutationFn: () => getSuggestedTemplates(consultationId!, headers),
        onSuccess: (data) => {
            setSuggestedTemplates(data)
            toastService.success('AI đã phân tích các phác đồ phù hợp')
        }
    })

    const recordDoseMutation = useMutation({
        mutationFn: (reminderId: string) => post(`/patient/medication-reminders/${reminderId}/take`, {}, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-medication-reminders'] })
            toastService.success('Đã ghi nhận bệnh nhân uống thuốc')
        }
    })

    const downloadReportMutation = useMutation({
        mutationFn: () => downloadCdmReport(consultationId!, carePlan, headers),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CDM-Report-${consultationId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toastService.success('Đã tải báo cáo CDM');
        },
        onError: () => {
            toastService.error('Lỗi khi tải báo cáo');
        }
    })

    const sendReportMutation = useMutation({
        mutationFn: () => sendCdmReport(consultationId!, carePlan, headers),
        onSuccess: (message) => {
            toastService.success(message);
        },
        onError: (error: any) => {
            toastService.error(error.message || 'Lỗi khi gửi báo cáo');
        }
    })

    const { data: followUpSuggestion } = useQuery({
        queryKey: ['follow-up-suggestion', consultationId],
        queryFn: () => getFollowUpSuggestion(consultationId!, headers),
        enabled: !!consultationId
    })

    const bookAppointmentMutation = useMutation({
        mutationFn: (days: number) => {
            const date = new Date()
            date.setDate(date.getDate() + days)
            return post('/scheduling-appointments', {
                patientId,
                branchId: headers?.branchId, // placeholder
                appointmentDate: date.toISOString().split('T')[0],
                slotStartTime: '08:00',
                status: 'SCHEDULED',
                appointmentType: 'FOLLOW_UP',
                notes: `Tái khám định kỳ CDM (AI đề xuất ${days} ngày)`
            }, headers)
        },
        onSuccess: () => {
            toastService.success('Đã đặt lịch tái khám thành công')
        }
    })

    const triggerReminderMutation = useMutation({
        mutationFn: (reminderId: string) => triggerMedicationReminder(reminderId, headers),
        onSuccess: (message) => {
            toastService.success(message)
        }
    })

    const { data: efficacyData } = useQuery({
        queryKey: ['treatment-efficacy', consultationId],
        queryFn: () => getTreatmentEfficacy(consultationId!, headers),
        enabled: !!consultationId
    })

    const { data: riskData } = useQuery({
        queryKey: ['complication-risk', consultationId],
        queryFn: () => getComplicationRisk(consultationId!, headers),
        enabled: !!consultationId
    })

    const { data: standardizedNote } = useQuery({
        queryKey: ['standardized-note', consultationId],
        queryFn: () => getStandardizedNote(consultationId!, headers),
        enabled: !!consultationId
    })

    const { data: conditions } = useQuery({
        queryKey: ['patient-chronic-conditions', patientId],
        queryFn: () => getChronicConditions(patientId, headers),
        enabled: !!patientId
    })

    const { data: targets } = useQuery({
        queryKey: ['patient-vital-targets', patientId],
        queryFn: () => getVitalTargets(patientId, headers),
        enabled: !!patientId
    })

    const { data: reminders } = useQuery({
        queryKey: ['patient-medication-reminders', patientId],
        queryFn: () => getMedicationReminders(patientId, headers),
        enabled: !!patientId
    })

    const { data: vitalHistory = [] } = useQuery({
        queryKey: ['patient-vital-history', patientId],
        queryFn: () => getVitalHistory(patientId, headers),
        enabled: !!patientId
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Hồ sơ Bệnh mãn tính (CDM)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Conditions Column */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Các chẩn đoán dài hạn</p>
                    <div className="space-y-2">
                        {conditions?.map((c: any) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={c.id}
                                className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:border-rose-200 transition-all"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-black text-slate-900 uppercase">{c.conditionName}</span>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${c.severityLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-600' :
                                        c.severityLevel === 'PROGRESSING' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        {c.severityLevel}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-bold text-slate-400">ICD10: {c.icd10Code}</span>
                                    <span className="text-[9px] font-bold text-slate-400">Từ: {new Date(c.diagnosedAt).toLocaleDateString()}</span>
                                </div>
                                {c.clinicalNotes && (
                                    <p className="mt-2 text-[10px] text-slate-500 italic leading-relaxed">"{c.clinicalNotes}"</p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Targets & Adherence Column */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Ngưỡng & Xu hướng Sinh hiệu</p>
                        <div className="space-y-4">
                            {vitalHistory.length > 0 ? (
                                <VitalTargetVisualization history={vitalHistory} targets={targets || []} />
                            ) : (
                                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6 text-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Chưa có đủ dữ liệu để vẽ biểu đồ xu hướng</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuân thủ điều trị (Adherence)</p>
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                                <Info className="w-2.5 h-2.5" />
                                <span className="text-[8px] font-black uppercase">Omni-channel Active</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {reminders?.map((r: any) => (
                                <div key={r.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                            <Pill className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900">{r.medicineName}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Lần cuối: {r.lastTakenAt ? new Date(r.lastTakenAt).toLocaleString() : 'Chưa uống'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-1">
                                            <span className={`text-[11px] font-black ${(r.adherenceScore || 0) < 50 ? 'text-rose-500' : (r.adherenceScore || 0) < 80 ? 'text-amber-500' : 'text-emerald-500'
                                                }`}>
                                                {r.adherenceScore || 0}%
                                            </span>
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        </div>
                                        <p className="text-[8px] font-black text-slate-300 uppercase">Dose Compliance</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <button
                                                onClick={() => triggerReminderMutation.mutate(r.id)}
                                                disabled={triggerReminderMutation.isPending}
                                                className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-tight hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1"
                                                title="Gửi nhắc nhở ngay (Email/Zalo/SMS)"
                                            >
                                                {triggerReminderMutation.isPending ? '...' : <Bell className="w-2.5 h-2.5" />}
                                                Gửi nhắc nhở
                                            </button>
                                            <button
                                                onClick={() => recordDoseMutation.mutate(r.id)}
                                                disabled={recordDoseMutation.isPending}
                                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                                            >
                                                {recordDoseMutation.isPending ? '...' : 'Đã uống'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Care Plan Management Section */}
            {consultationId && (
                <div className="pt-10 border-t border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <Brain className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Kế hoạch Điều trị & Chăm sóc AI</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Phân tích dựa trên bệnh nền & Adherence</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => sendReportMutation.mutate()}
                                disabled={sendReportMutation.isPending || !carePlan}
                                className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
                            >
                                {sendReportMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-emerald-700/30 border-t-emerald-700 rounded-full animate-spin" />
                                ) : (
                                    <Mail className="w-4 h-4" />
                                )}
                                Gửi Email
                            </button>
                            <button
                                onClick={() => downloadReportMutation.mutate()}
                                disabled={downloadReportMutation.isPending || !carePlan}
                                className="bg-white text-slate-900 border border-slate-200 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
                            >
                                {downloadReportMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                Tải PDF
                            </button>
                            <button
                                onClick={() => carePlanMutation.mutate()}
                                disabled={carePlanMutation.isPending}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:shadow-xl transition-all flex items-center gap-3 disabled:opacity-50 shadow-sm"
                            >
                                {carePlanMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Brain className="w-4 h-4" />
                                )}
                                {carePlan ? 'Cập nhật Kế hoạch' : 'Lập Kế hoạch Chăm sóc AI'}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {carePlan && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[3rem] p-10 shadow-sm"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest italic">Clinical Care Pathway Insight</span>
                                </div>
                                <div className="prose prose-sm max-w-none text-indigo-900 font-medium leading-relaxed whitespace-pre-wrap">
                                    {carePlan}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* AI Suggested Templates Section */}
            {consultationId && (
                <div className="pt-10 border-t border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Gợi ý Phác đồ Phù hợp (AI)</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tìm mẫu đơn thuốc & phác đồ dựa trên chẩn đoán</p>
                            </div>
                        </div>
                        <button
                            onClick={() => suggestTemplatesMutation.mutate()}
                            disabled={suggestTemplatesMutation.isPending}
                            className="bg-amber-100 text-amber-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-200 transition-all flex items-center gap-3 disabled:opacity-50 border border-amber-200"
                        >
                            {suggestTemplatesMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin" />
                            ) : (
                                <Activity className="w-4 h-4" />
                            )}
                            Gợi ý Phác đồ
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {suggestedTemplates && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8"
                            >
                                <div className="prose prose-sm max-w-none text-slate-700 font-bold leading-relaxed whitespace-pre-wrap">
                                    {suggestedTemplates}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* AI Follow-up Recommendation Section */}
            {consultationId && followUpSuggestion && (
                <div className="pt-10 border-t border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Đề xuất Tái khám AI</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Thời điểm tái khám tối ưu dựa trên diễn tiến bệnh</p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${followUpSuggestion.priority === 'URGENT' ? 'bg-rose-100 text-rose-600' :
                                    followUpSuggestion.priority === 'SOON' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    Ưu tiên: {followUpSuggestion.priority}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase">Gợi ý sau {followUpSuggestion.suggestedInDays} ngày</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                {followUpSuggestion.reasoning}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {followUpSuggestion.clinicalGoals?.map((goal: string, idx: number) => (
                                    <span key={idx} className="bg-slate-50 text-slate-500 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-tight">
                                        target: {goal}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-6 flex flex-col items-center justify-center min-w-[200px]">
                            <Clock className="w-8 h-8 text-slate-300 mb-2" />
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest text-center">Dự kiến tái khám</p>
                            <button
                                onClick={() => bookAppointmentMutation.mutate(followUpSuggestion.suggestedInDays)}
                                disabled={bookAppointmentMutation.isPending}
                                className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {bookAppointmentMutation.isPending ? 'Đang đặt lịch...' : 'Đặt lịch Ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Treatment Efficacy Analytics Section */}
            {consultationId && efficacyData && (
                <div className="pt-10 border-t border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Phân tích Hiệu quả Điều trị (AI)</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mối liên quan giữa Tuân thủ & Chỉ số sinh hiệu</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-xl">
                            <div>
                                <Zap className="w-8 h-8 text-amber-400 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Tương quan tuân thủ</p>
                                <h4 className="text-4xl font-black mt-2">{(efficacyData.adherenceCorrelation * 100).toFixed(1)}%</h4>
                            </div>
                            <p className="text-[10px] font-bold opacity-80 mt-6 leading-relaxed">
                                Chỉ số cho thấy mức độ ảnh hưởng của việc uống thuốc đúng giờ đối với sự ổn định của sinh hiệu.
                            </p>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {efficacyData.metricInsights?.map((insight: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[11px] font-black text-slate-900 uppercase">{insight.metricName}</span>
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${insight.trend === 'IMPROVING' ? 'bg-emerald-100 text-emerald-600' :
                                                insight.trend === 'WORSENING' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {insight.trend}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-2xl font-black text-slate-900">{insight.lastValue}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Gần nhất</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                                            "{insight.message}"
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Treatment Verdict</span>
                                </div>
                                <p className="text-sm font-medium leading-relaxed text-slate-300">
                                    {efficacyData.aiAnalysis}
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {efficacyData.recommendations?.map((rec: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl">
                                            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                                            <span className="text-[9px] font-black uppercase text-indigo-100">{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Complication Risk Prediction Section */}
            {consultationId && riskData && (
                <div className="pt-10 border-t border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Dự báo Nguy cơ Biến chứng (AI)</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cảnh báo sớm các nguy cơ cấp cứu & biến chứng dài hạn</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className={`p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-lg ${riskData.riskLevel === 'CRITICAL' || riskData.riskLevel === 'HIGH' ? 'bg-rose-600 text-white' :
                            riskData.riskLevel === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                            }`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Mức độ nguy cơ</p>
                            <h4 className="text-3xl font-black mb-4">{riskData.riskLevel}</h4>
                            <div className="w-24 h-24 rounded-full border-8 border-white/20 flex items-center justify-center relative">
                                <span className="text-2xl font-black">{riskData.riskScore}%</span>
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                        cx="48" cy="48" r="40"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={`${riskData.riskScore * 2.51} 251`}
                                        className="text-white"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="lg:col-span-3 space-y-4">
                            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                                <h5 className="text-[11px] font-black text-slate-900 uppercase mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    Yếu tố nguy cơ chính: {riskData.primaryRiskFactor}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {riskData.detailFactors?.map((f: any, idx: number) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-slate-700 uppercase">{f.factorName}</span>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${f.impact === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    {f.impact} IMPACT
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                                                {f.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-start gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-rose-600 shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-1">AI Urgent Warning</p>
                                    <p className="text-sm font-bold text-rose-700 leading-relaxed">
                                        {riskData.aiWarning}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {riskData.preventiveActions?.map((action: string, idx: number) => (
                                            <span key={idx} className="bg-white text-rose-600 text-[9px] font-black px-3 py-1.5 rounded-lg border border-rose-100 uppercase">
                                                Prevent: {action}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Standardized Note & Billing Section */}
            {consultationId && standardizedNote && (
                <div className="pt-10 border-t border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Hồ sơ Chuẩn hóa & Billing (AI)</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sẵn sàng xuất hồ sơ cho cơ quan bảo hiểm theo chuẩn SOAP</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">SOAP Documentation</span>
                                <div className="space-y-4 text-[11px] font-medium text-slate-700 leading-relaxed">
                                    <div>
                                        <span className="text-blue-600 font-black uppercase">Subjective:</span>
                                        <p className="mt-1">{standardizedNote.soapSubjective}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50">
                                        <span className="text-blue-600 font-black uppercase">Objective:</span>
                                        <p className="mt-1">{standardizedNote.soapObjective}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50">
                                        <span className="text-blue-600 font-black uppercase">Assessment:</span>
                                        <p className="mt-1">{standardizedNote.soapAssessment}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50">
                                        <span className="text-blue-600 font-black uppercase">Plan:</span>
                                        <p className="mt-1">{standardizedNote.soapPlan}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Medical Coding Suggestions</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">CPT codes (Thủ thuật)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {standardizedNote.suggestedCptCodes?.map((c: any, idx: number) => (
                                                <div key={idx} className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl">
                                                    <span className="text-[11px] font-black text-emerald-400">{c.code}</span>
                                                    <p className="text-[9px] text-slate-400">{c.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">ICD-10 codes (Chẩn đoán)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {standardizedNote.suggestedIcd10Codes?.map((c: any, idx: number) => (
                                                <div key={idx} className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl">
                                                    <span className="text-[11px] font-black text-indigo-400">{c.code}</span>
                                                    <p className="text-[9px] text-slate-400">{c.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                                <div className="flex items-center gap-2 mb-2 text-amber-700">
                                    <Info className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Insurance Auditor Memo</span>
                                </div>
                                <p className="text-[11px] font-bold text-amber-900 italic leading-relaxed">
                                    "{standardizedNote.insuranceMemo}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
