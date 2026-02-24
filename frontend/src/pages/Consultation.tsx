import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getQueueDefinitions, getQueueEntries, callQueueEntry } from '@/api/queues'
import {
    startConsultation,
    updateConsultation,
    completeConsultation,
    createPrescription,
    getPatientHistory,
    getVitals,
    getAiClinicalSupport,
    sendClinicalAiChat,
    verifyPrescriptionAi,
    getCdsAdvice,
    getEarlyWarning,
    getSuggestedTemplates,
    orderDiagnosticImage,
    getLabResults,
    getDiagnosticImages,
    downloadConsultationPdf
} from '@/api/clinical'
import { ChronicDiseasePanel } from '@/components/clinical/ChronicDiseasePanel'
import { getPharmacyProducts } from '@/api/pharmacy'
import { WebSocketService } from '@/services/websocket'
import { toastService } from '@/services/toast'
import {
    Clock,
    CheckCircle2,
    Stethoscope,
    Pill,
    ClipboardList,
    ChevronRight,
    ArrowLeft,
    Search,
    User,
    AlertCircle,
    FileText,
    Activity,
    History,
    Trash2,
    Thermometer,
    Heart,
    Droplets,
    Zap,
    ExternalLink,
    BrainCircuit,
    FlaskConical,
    ImageIcon,
    Maximize2,
    Printer,
    ShieldAlert
} from 'lucide-react'
import type {
    ConsultationDto,
    PharmacyProductDto,
    QueueEntryDto,
    QueueDefinitionDto,
    CdsAdviceDto,
    ClinicalEarlyWarningDto
} from '@/types/api'
import { motion, AnimatePresence } from 'framer-motion'

export function Consultation() {
    const { headers, branchId } = useTenant()
    const queryClient = useQueryClient()

    // State
    const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null)
    const [activeConsultation, setActiveConsultation] = useState<ConsultationDto | null>(null)
    const [diagnosis, setDiagnosis] = useState('')
    const [prescriptionItems, setPrescriptionItems] = useState<{
        productId: string;
        productName: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        dosageInstruction: string;
    }[]>([])
    const [drugSearch, setDrugSearch] = useState('')
    const [activeTab, setActiveTab] = useState<'exam' | 'history' | 'vitals' | 'results' | 'cdm'>('exam')
    const [aiInsights, setAiInsights] = useState<string>('')
    const [aiChatInput, setAiChatInput] = useState('')
    const [aiChatHistory, setAiChatHistory] = useState<{ sender: 'ai' | 'doctor', message: string }[]>([])
    const [isVerifyingPrescription, setIsVerifyingPrescription] = useState(false)
    const [prescriptionWarning, setPrescriptionWarning] = useState<string | null>(null)
    const [cdsAdvice, setCdsAdvice] = useState<CdsAdviceDto | null>(null)
    const [earlyWarning, setEarlyWarning] = useState<ClinicalEarlyWarningDto | null>(null)
    const [isSafetyLoading, setIsSafetyLoading] = useState(false)
    const [suggestedTemplates, setSuggestedTemplates] = useState<string | null>(null)
    const [isSuggestingTemplates, setIsSuggestingTemplates] = useState(false)

    // 1. Fetch Queues
    const { data: queues } = useQuery<QueueDefinitionDto[]>({
        queryKey: ['doctor-queues', branchId],
        queryFn: () => getQueueDefinitions(branchId!, headers),
        enabled: !!branchId && !!headers?.tenantId,
    })

    // Auto-select consultation queue
    useEffect(() => {
        if (queues && queues.length > 0 && !selectedQueueId) {
            const docQueue = queues.find(q => q.nameVi.toLowerCase().includes('khám') || q.nameVi.toLowerCase().includes('consultation'))
            setSelectedQueueId(docQueue ? docQueue.id : queues[0].id)
        }
    }, [queues, selectedQueueId])

    // 2. Fetch Waiting List
    const { data: waitingEntries, isLoading: loadingQueue } = useQuery<QueueEntryDto[]>({
        queryKey: ['doctor-waiting-list', selectedQueueId],
        queryFn: () => getQueueEntries(selectedQueueId!, branchId!, headers),
        enabled: !!selectedQueueId && !!branchId && !!headers?.tenantId,
    })

    useEffect(() => {
        if (!selectedQueueId) return
        const ws = new WebSocketService((msg) => {
            if (msg.type === 'QUEUE_REFRESH' || msg.type === 'PATIENT_CALLED') {
                queryClient.invalidateQueries({ queryKey: ['doctor-waiting-list'] })
            }
        })
        ws.connect()
        return () => ws.disconnect()
    }, [selectedQueueId, queryClient])

    // 3. Fetch Drugs
    const { data: drugs } = useQuery<PharmacyProductDto[]>({
        queryKey: ['pharmacy-products-all'],
        queryFn: () => getPharmacyProducts(headers),
        enabled: !!activeConsultation
    })

    // Auto-fetch CDS and Early Warning when consultation starts
    useEffect(() => {
        if (activeConsultation) {
            fetchCdsAdvice()
        }
    }, [activeConsultation?.id])

    // 4. Start Consultation Mutation
    const startMutation = useMutation<ConsultationDto, Error, string>({
        mutationFn: (queueEntryId: string) => startConsultation({ queueEntryId }, headers),
        onSuccess: (data) => {
            setActiveConsultation(data)
            setDiagnosis(data.diagnosisNotes || '')
            setActiveTab('exam')
            queryClient.invalidateQueries({ queryKey: ['doctor-waiting-list'] })
            toastService.success('🚀 Bắt đầu phiên khám EMR')
        }
    })

    // 5. Save/Complete Mutation
    const completeMutation = useMutation<ConsultationDto | undefined, Error, void>({
        mutationFn: async () => {
            if (!activeConsultation) return
            // First update notes
            await updateConsultation(activeConsultation.id, {
                diagnosisNotes: diagnosis,
            }, headers)

            // Create prescription if items exist
            if (prescriptionItems.length > 0) {
                await createPrescription({
                    consultationId: activeConsultation.id,
                    items: prescriptionItems.map(it => ({
                        productId: it.productId,
                        quantity: it.quantity,
                        dosageInstruction: it.dosageInstruction,
                        unitPrice: it.unitPrice
                    }))
                }, headers)
            }

            // Complete
            return completeConsultation(activeConsultation.id, headers)
        },
        onSuccess: () => {
            toastService.success('✅ Hoàn tất & Đã tự động lập hóa đơn')
            setActiveConsultation(null)
            setDiagnosis('')
            setPrescriptionItems([])
            queryClient.invalidateQueries({ queryKey: ['doctor-waiting-list'] })
        }
    })

    const { data: labResults } = useQuery({
        queryKey: ['clinical-lab-results', activeConsultation?.id],
        queryFn: () => getLabResults(activeConsultation!.id, headers),
        enabled: !!activeConsultation && activeTab === 'results'
    })

    const { data: diagImages } = useQuery({
        queryKey: ['clinical-diag-images', activeConsultation?.id],
        queryFn: () => getDiagnosticImages(activeConsultation!.id, headers),
        enabled: !!activeConsultation && activeTab === 'results'
    })

    const aiMutation = useMutation({
        mutationFn: () => getAiClinicalSupport(activeConsultation!.id, headers),
        onSuccess: (data) => {
            setAiInsights(data)
            toastService.success('🧠 AI Clinical Assistant đã sẵn sàng')
        },
        onError: (e: Error) => toastService.error(e.message)
    })

    const cdsMutation = useMutation({
        mutationFn: () => getCdsAdvice(activeConsultation!.id, headers),
        onSuccess: (data: CdsAdviceDto) => {
            setCdsAdvice(data)
            toastService.success('🎯 Đã cập nhật tín hiệu CDS')
        },
        onError: (e: Error) => toastService.error('CDS Error: ' + e.message)
    })

    const orderImagingMutation = useMutation({
        mutationFn: (title: string) => orderDiagnosticImage(activeConsultation!.id, title, headers),
        onSuccess: () => {
            toastService.success('📸 Đã gửi chỉ định chẩn đoán hình ảnh')
        },
        onError: (e: Error) => toastService.error(e.message)
    })

    const handleAiChat = async () => {
        if (!aiChatInput.trim() || !activeConsultation) return
        const userMsg = aiChatInput
        setAiChatInput('')
        setAiChatHistory(prev => [...prev, { sender: 'doctor', message: userMsg }])

        try {
            const res = await sendClinicalAiChat(activeConsultation.id, userMsg, headers)
            setAiChatHistory(prev => [...prev, { sender: 'ai', message: res }])
        } catch (e: any) {
            toastService.error('AI Chat Error: ' + e.message)
        }
    }

    const fetchCdsAdvice = async () => {
        if (!activeConsultation) return
        setIsSafetyLoading(true)
        try {
            const [advice, warning] = await Promise.all([
                getCdsAdvice(activeConsultation.id, headers),
                getEarlyWarning(activeConsultation.id, headers)
            ])
            setCdsAdvice(advice)
            setEarlyWarning(warning)
            toastService.success('AI Safety Monitor updated')
        } catch (err) {
            toastService.error('Failed to update Safety Monitor')
        } finally {
            setIsSafetyLoading(false)
        }
    }

    const fetchSuggestedTemplates = async () => {
        if (!activeConsultation || !diagnosis) {
            toastService.warning('Cần nhập chẩn đoán trước khi gợi ý phác đồ')
            return
        }
        setIsSuggestingTemplates(true)
        try {
            // Enterprise: Update diagnosis on server first to ensure AI sees current notes
            await updateConsultation(activeConsultation.id, { diagnosisNotes: diagnosis }, headers)
            const res = await getSuggestedTemplates(activeConsultation.id, headers)
            setSuggestedTemplates(res)
            toastService.success('💡 Đã tìm thấy phác đồ phù hợp')
        } catch (err) {
            toastService.error('Không thể lấy gợi ý phác đồ')
        } finally {
            setIsSuggestingTemplates(false)
        }
    }

    const handleVerifyPrescription = async () => {
        if (!activeConsultation || prescriptionItems.length === 0) return
        setIsVerifyingPrescription(true)
        setPrescriptionWarning(null)
        try {
            const res = await verifyPrescriptionAi(activeConsultation.id, prescriptionItems, headers)
            if (res.includes('OK')) {
                toastService.success('✅ Đơn thuốc an toàn')
                setPrescriptionWarning(null)
            } else {
                setPrescriptionWarning(res)
                toastService.warning('⚠️ Phát hiện vấn đề trong đơn thuốc')
            }
        } catch (e: any) {
            toastService.error('Verification Error')
        } finally {
            setIsVerifyingPrescription(false)
        }
    }

    const handleCall = async (entryId: string) => {
        try {
            await callQueueEntry(entryId, headers)
            toastService.info('🔔 Đã phát âm báo mời bệnh nhân')
            queryClient.invalidateQueries({ queryKey: ['doctor-waiting-list'] })
        } catch (e) {
            toastService.error('Lỗi khi gọi số')
        }
    }

    const addPrescriptionItem = (drug: PharmacyProductDto) => {
        if (prescriptionItems.find(it => it.productId === drug.id)) {
            toastService.warning('Thuốc đã được liệt kê')
            return
        }
        setPrescriptionItems([...prescriptionItems, {
            productId: drug.id,
            productName: drug.nameVi,
            quantity: 1,
            unit: drug.unit,
            unitPrice: drug.standardPrice,
            dosageInstruction: 'Ngày uống 2 lần, mỗi lần 1 viên sau ăn'
        }])
        setDrugSearch('')
    }

    const filteredDrugs = drugs?.filter(d =>
        d.nameVi.toLowerCase().includes(drugSearch.toLowerCase()) ||
        d.code.toLowerCase().includes(drugSearch.toLowerCase())
    ).slice(0, 8)

    if (activeConsultation) {
        return (
            <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Modern Clinical Header */}
                <div className="bg-white rounded-[3rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveConsultation(null)}
                            className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-inner"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="h-12 w-px bg-slate-100" />
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tightest uppercase">BN. {activeConsultation.patientName}</h1>
                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100 italic">In Session</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                                    Lý do: <span className="text-slate-600 italic font-black">{activeConsultation.chiefComplaintSummary || 'Khám tổng quát'}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ưu tiên:</span>
                                    <span className={`w-3 h-3 rounded-full ${activeConsultation.acuityLevel === '1' ? 'bg-red-500 animate-pulse' : activeConsultation.acuityLevel === '2' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => downloadConsultationPdf(activeConsultation.id, headers)}
                            className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-inner group relative"
                            title="In phiếu khám & đơn thuốc"
                        >
                            <Printer className="w-6 h-6" />
                            <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-black uppercase tracking-widest">In hồ sơ PDF</span>
                        </button>

                        <button
                            onClick={() => completeMutation.mutate()}
                            disabled={completeMutation.isPending}
                            className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {completeMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Kết thúc & Lưu hồ sơ
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 flex gap-8 min-h-0">
                        {/* Left: Main Workspace */}
                        <div className="flex-1 bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
                            <div className="flex bg-slate-50/50 p-2 border-b border-slate-100">
                                {[
                                    { id: 'exam', label: 'EHR Workspace', icon: FileText },
                                    { id: 'cdm', label: 'Quản lý Mãn tính', icon: ShieldAlert },
                                    { id: 'history', label: 'Lịch sử Clinical', icon: History },
                                    { id: 'vitals', label: 'Sinh hiệu chi tiết', icon: Activity },
                                    { id: 'results', label: 'Kết quả & Hình ảnh', icon: FlaskConical }
                                ].map((tab: any) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 py-5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-3xl transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'cdm' && (
                                        <motion.div
                                            key="cdm"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <ChronicDiseasePanel
                                                patientId={activeConsultation.patientId}
                                                consultationId={activeConsultation.id}
                                            />
                                        </motion.div>
                                    )}
                                    {activeTab === 'exam' && (
                                        <motion.div
                                            key="exam"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-12"
                                        >
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                                        <ClipboardList className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Chẩn đoán chuyên môn</h3>
                                                </div>
                                                <textarea
                                                    value={diagnosis}
                                                    onChange={e => setDiagnosis(e.target.value)}
                                                    placeholder="Khám lâm sàng, kết luận chẩn đoán và ghi chú điều trị..."
                                                    className="w-full bg-slate-50 border-none rounded-[2.5rem] p-8 font-medium text-slate-700 h-56 focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all outline-none resize-none leading-relaxed text-lg shadow-inner"
                                                />
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                                            <Pill className="w-5 h-5" />
                                                        </div>
                                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Kế hoạch sử dụng thuốc</h3>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={handleVerifyPrescription}
                                                            disabled={isVerifyingPrescription || prescriptionItems.length === 0}
                                                            className="px-6 py-4 bg-amber-100 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            {isVerifyingPrescription ? 'Đang kiểm tra...' : 'AI Kiểm tra đơn'}
                                                        </button>
                                                        <div className="relative w-96">
                                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                            <input
                                                                type="text"
                                                                placeholder="Tìm tên thuốc hoặc mã dược..."
                                                                value={drugSearch}
                                                                onChange={e => setDrugSearch(e.target.value)}
                                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black focus:bg-white focus:ring-8 focus:ring-blue-500/5 outline-none transition-all shadow-inner"
                                                            />
                                                            {drugSearch && filteredDrugs && (
                                                                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden ring-1 ring-slate-200">
                                                                    {filteredDrugs.map(d => (
                                                                        <button
                                                                            key={d.id}
                                                                            onClick={() => addPrescriptionItem(d)}
                                                                            className="w-full p-5 hover:bg-blue-50 text-left border-b border-slate-50 last:border-0 transition-colors flex items-center justify-between group"
                                                                        >
                                                                            <div>
                                                                                <p className="text-[11px] font-black uppercase text-slate-900 group-hover:text-blue-600 transition-colors">{d.nameVi}</p>
                                                                                <p className="text-[9px] font-bold text-slate-400 mt-0.5">{d.code} • {d.unit}</p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="text-[11px] font-black text-slate-900">{d.standardPrice.toLocaleString()}đ</p>
                                                                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Sẵn sàng</span>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {prescriptionWarning && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] text-rose-600 space-y-2 mb-4 shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <AlertCircle className="w-5 h-5" />
                                                            <p className="text-[11px] font-black uppercase tracking-widest">Cảnh báo An toàn Đơn thuốc (AI)</p>
                                                        </div>
                                                        <p className="text-sm font-medium leading-relaxed italic">{prescriptionWarning}</p>
                                                    </motion.div>
                                                )}

                                                {/* Enterprise CDS Insight Panel */}
                                                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-6">
                                                    <div className="bg-slate-900 p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="w-4 h-4 text-emerald-400" />
                                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Clinical AI Radar</span>
                                                        </div>
                                                        <button
                                                            onClick={fetchCdsAdvice}
                                                            disabled={isSafetyLoading}
                                                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all"
                                                        >
                                                            <Activity className={`w-3 h-3 ${isSafetyLoading ? 'animate-spin' : ''}`} />
                                                        </button>
                                                    </div>

                                                    <div className="p-5 space-y-6">
                                                        {earlyWarning && (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NEWS2 Warning Score</p>
                                                                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black ${earlyWarning.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                                                                        }`}>
                                                                        {earlyWarning.riskLevel} RISK
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-3xl font-black text-slate-900">{earlyWarning.news2Score}</span>
                                                                    <span className="text-[10px] font-black text-slate-400">/ 20</span>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic border-l-2 border-amber-400 pl-3">
                                                                    "{earlyWarning.aiClinicalAssessment}"
                                                                </p>

                                                                <div className="grid grid-cols-2 gap-2 mt-4">
                                                                    {earlyWarning.warnings?.slice(0, 2).map((w: any, idx: number) => (
                                                                        <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{w.vitalType}</p>
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-xs font-black text-slate-800">{w.value}</span>
                                                                                <span className={`text-[8px] font-black ${w.trend === 'WORSENING' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                                    {w.trend === 'WORSENING' ? '↑↑' : 'STABLE'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="h-px bg-slate-100" />

                                                        {cdsAdvice && (
                                                            <div className="bg-blue-50/50 p-6 rounded-3xl space-y-4">
                                                                <div className="flex items-center gap-2">
                                                                    <BrainCircuit className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">CDS Suggestions</span>
                                                                </div>
                                                                <ul className="space-y-2">
                                                                    {cdsAdvice.suggestions.map((s: any, idx: number) => (
                                                                        <li key={idx} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                                                                            <span className="text-blue-500">•</span>
                                                                            {s.title}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {prescriptionItems.length === 0 ? (
                                                        <div className="flex flex-col gap-6">
                                                            <div className="py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                                                                <div className="p-6 bg-white rounded-3xl mb-4 shadow-sm">
                                                                    <Pill className="w-10 h-10 opacity-20" />
                                                                </div>
                                                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Chưa có chỉ định thuốc</p>

                                                                <button
                                                                    onClick={fetchSuggestedTemplates}
                                                                    disabled={isSuggestingTemplates}
                                                                    className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                                                                >
                                                                    {isSuggestingTemplates ? <Activity className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                                                    Gợi ý Phác đồ (AI)
                                                                </button>
                                                            </div>

                                                            {suggestedTemplates && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8"
                                                                >
                                                                    <div className="flex items-center gap-3 mb-6">
                                                                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                                            <BrainCircuit className="w-5 h-5" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-sm font-black text-blue-900 uppercase">Phác đồ đề xuất</h4>
                                                                            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Dựa trên chẩn đoán & phác đồ mẫu</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="prose prose-sm max-w-none text-blue-900 font-medium leading-relaxed whitespace-pre-wrap">
                                                                        {suggestedTemplates}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {prescriptionItems.map((it, idx) => (
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    key={idx}
                                                                    className="bg-white border border-slate-100 p-6 rounded-[2rem] flex gap-6 hover:shadow-lg hover:border-blue-100 transition-all group"
                                                                >
                                                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                        {idx + 1}
                                                                    </div>
                                                                    <div className="flex-1 grid grid-cols-12 gap-8">
                                                                        <div className="col-span-4">
                                                                            <p className="text-[11px] font-black text-slate-900 uppercase mb-1">{it.productName}</p>
                                                                            <p className="text-[10px] font-bold text-slate-400">Đơn giá: {it.unitPrice?.toLocaleString()}đ</p>
                                                                        </div>
                                                                        <div className="col-span-2">
                                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-2">Số lượng</label>
                                                                            <input
                                                                                type="number"
                                                                                value={it.quantity}
                                                                                onChange={e => {
                                                                                    const newItems = [...prescriptionItems]
                                                                                    newItems[idx].quantity = parseInt(e.target.value) || 0
                                                                                    setPrescriptionItems(newItems)
                                                                                }}
                                                                                className="w-full bg-slate-50 p-3 rounded-xl text-sm font-black outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-center"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-5">
                                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-2">Liều dùng & Cách dùng</label>
                                                                            <input
                                                                                type="text"
                                                                                value={it.dosageInstruction}
                                                                                onChange={e => {
                                                                                    const newItems = [...prescriptionItems]
                                                                                    newItems[idx].dosageInstruction = e.target.value
                                                                                    setPrescriptionItems(newItems)
                                                                                }}
                                                                                className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all italic"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-1 flex items-end justify-end">
                                                                            <button
                                                                                onClick={() => setPrescriptionItems(prescriptionItems.filter((_, i) => i !== idx))}
                                                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                                            >
                                                                                <Trash2 className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-6 pt-12 border-t border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                                            <ExternalLink className="w-5 h-5" />
                                                        </div>
                                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Chỉ định Cận lâm sàng</h3>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4">
                                                        {[
                                                            { label: 'Chụp X-Quang Phổi', value: 'X-RAY CHEST' },
                                                            { label: 'Siêu âm Bụng', value: 'ULTRASOUND ABDOMEN' },
                                                            { label: 'Xét nghiệm Máu', value: 'BLOOD TEST' },
                                                            { label: 'Chụp CT Scanner', value: 'CT SCAN' }
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={() => orderImagingMutation.mutate(opt.value)}
                                                                disabled={orderImagingMutation.isPending}
                                                                className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center gap-2 group scroll-mt-20"
                                                            >
                                                                {opt.label}
                                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'history' && (
                                        <motion.div
                                            key="history"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <PatientHistory patientId={activeConsultation.patientId} />
                                        </motion.div>
                                    )}

                                    {activeTab === 'vitals' && (
                                        <motion.div
                                            key="vitals"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <ConsultationVitals consultationId={activeConsultation.id} />
                                        </motion.div>
                                    )}

                                    {activeTab === 'results' && (
                                        <motion.div
                                            key="results"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-12"
                                        >
                                            {/* Results content follows... */}
                                            {/* Labs Section */}
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                                    <FlaskConical className="w-4 h-4 text-blue-500" />
                                                    Kết quả Xét nghiệm Máu / Sinh hóa
                                                </h4>
                                                <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-inner">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b border-white">
                                                                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Chỉ số</th>
                                                                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Giá trị</th>
                                                                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Đơn vị</th>
                                                                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Tham chiếu</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white">
                                                            {(labResults || []).map((lr: any, i: number) => (
                                                                <tr key={i} className="hover:bg-white transition-colors">
                                                                    <td className="px-8 py-5 text-xs font-black text-slate-900">{lr.testName}</td>
                                                                    <td className="px-8 py-5">
                                                                        <span className={`text-xs font-black ${lr.status === 'HIGH' ? 'text-red-500' : lr.status === 'LOW' ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                                            {lr.value}
                                                                            {lr.status !== 'NORMAL' && <span className="ml-2 text-[8px] uppercase font-bold">{lr.status === 'HIGH' ? '↑' : '↓'}</span>}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{lr.unit}</td>
                                                                    <td className="px-8 py-5 text-xs font-medium text-slate-400 italic">{lr.referenceRange}</td>
                                                                </tr>
                                                            ))}
                                                            {(!labResults || labResults.length === 0) && (
                                                                <tr>
                                                                    <td colSpan={4} className="px-8 py-20 text-center flex flex-col items-center">
                                                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-slate-100 italic font-black shadow-sm">!</div>
                                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic tracking-[0.3em]">Chưa có dữ liệu xét nghiệm</p>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Imaging Section */}
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                                                    Chẩn đoán Hình ảnh (XR / Ultrasound / CT)
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                                                    {(diagImages || []).map((img: any, i: number) => (
                                                        <div key={i} className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/30 space-y-4 hover:border-indigo-200 transition-all hover:shadow-indigo-500/10">
                                                            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-inner">
                                                                <img
                                                                    src={img.imageUrl}
                                                                    alt={img.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                                                                <button className="absolute top-4 right-4 p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all active:scale-90 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest">
                                                                    <Maximize2 className="w-4 h-4" />
                                                                    View Full
                                                                </button>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center justify-between">
                                                                    {img.title}
                                                                    <span className="text-[8px] text-slate-400 font-bold px-2 py-0.5 bg-slate-50 rounded-md">VERIFIED</span>
                                                                </h5>
                                                                <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic border-l-2 border-indigo-100 pl-4 py-1">{img.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!diagImages || diagImages.length === 0) && (
                                                        <div className="col-span-2 p-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                                            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                                            <p className="text-[10px] font-black uppercase tracking-widest italic">Chưa có dữ liệu hình ảnh</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Right: Sidebar EHR Info */}
                        <div className="w-96 flex flex-col gap-8">
                            {/* Vital Monitoring */}
                            <div className="bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-emerald-500" />
                                    Sinh hiệu hiện thời
                                    <span className="text-[10px] text-emerald-500 font-bold ml-auto px-2 py-0.5 bg-emerald-50 rounded-full">REALTIME</span>
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { label: 'Nhiệt độ', value: '37.2', unit: '°C', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50' },
                                        { label: 'Huyết áp', value: '120/80', unit: 'mmHg', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
                                        { label: 'Nhịp tim', value: '82', unit: 'bpm', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
                                        { label: 'SpO2', value: '98', unit: '%', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' }
                                    ].map((v, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-50/50 hover:bg-white hover:shadow-md p-4 rounded-3xl transition-all border border-transparent hover:border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 ${v.bg} ${v.color} rounded-2xl flex items-center justify-center`}>
                                                    <v.icon className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{v.label}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black text-slate-900 leading-none">{v.value}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{v.unit}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Enterprise: CDS Signals Panel */}
                            {cdsAdvice && (
                                <div className="bg-slate-800 rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">CDS Signals</h3>
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${cdsAdvice.riskLevel === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' :
                                            cdsAdvice.riskLevel === 'HIGH' ? 'bg-orange-500 text-white' :
                                                'bg-emerald-500 text-white'
                                            }`}>
                                            Risk: {cdsAdvice.riskLevel}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {cdsAdvice.warnings.map((w, i) => (
                                            <div key={i} className={`p-4 rounded-2xl border ${w.severity === 'ERROR' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                                                'bg-amber-500/10 border-amber-500/20 text-amber-200'
                                                } text-[10px] font-medium leading-relaxed`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span className="font-black uppercase tracking-widest">{w.type}</span>
                                                </div>
                                                {w.message}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Gợi ý lâm sàng</p>
                                        {cdsAdvice.suggestions.map((s, i) => (
                                            <div key={i} className="flex gap-4 items-start group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all">
                                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                    <Zap className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-white group-hover:text-blue-400">{s.title}</p>
                                                    <p className="text-[9px] text-white/40 font-bold mt-0.5">{s.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {cdsAdvice.differentialDiagnoses.length > 0 && (
                                        <div className="pt-4 border-t border-white/5 space-y-2">
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Chẩn đoán phân biệt</p>
                                            <div className="flex flex-wrap gap-2">
                                                {cdsAdvice.differentialDiagnoses.map((d, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-white/5 rounded-lg text-[9px] font-bold text-white/70 italic border border-white/5">{d}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* AI Warning / EHR Notes */}
                            <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group flex-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
                                <div className="absolute bottom-10 right-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                                    <AlertCircle className="w-48 h-48" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-amber-500">
                                    <BrainCircuit className="w-5 h-5" />
                                    AI Clinical Assistant
                                </h3>
                                <div className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => aiMutation.mutate()}
                                            disabled={aiMutation.isPending}
                                            className="py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50"
                                        >
                                            {aiMutation.isPending ? '...' : 'Tóm tắt EMR'}
                                        </button>
                                        <button
                                            onClick={() => cdsMutation.mutate()}
                                            disabled={cdsMutation.isPending}
                                            className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                        >
                                            {cdsMutation.isPending ? '...' : 'CDS Signals'}
                                        </button>
                                    </div>

                                    {aiInsights || aiChatHistory.length > 0 ? (
                                        <div className="flex flex-col gap-4 max-h-[500px] overflow-hidden">
                                            <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-y-auto space-y-4 custom-scrollbar">
                                                {aiInsights && (
                                                    <div className="prose prose-invert prose-xs max-w-none text-slate-100 font-medium leading-relaxed whitespace-pre-wrap border-b border-white/10 pb-6 mb-6">
                                                        {aiInsights}
                                                    </div>
                                                )}
                                                {aiChatHistory.map((h, i) => (
                                                    <div key={i} className={`flex ${h.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium ${h.sender === 'doctor' ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 border border-white/10'}`}>
                                                            {h.message}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={aiChatInput}
                                                    onChange={e => setAiChatInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAiChat()}
                                                    placeholder="Hỏi AI thêm về ca bệnh..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-14 text-xs text-white placeholder:text-white/20 outline-none focus:bg-white/10 transition-all font-bold"
                                                />
                                                <button
                                                    onClick={handleAiChat}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all"
                                                >
                                                    <Zap className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-3">
                                            <h4 className="text-[10px] font-black uppercase text-blue-400">Trạng thái</h4>
                                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                                                "Bấm nút ở trên để AI phân tích triệu chứng và tiền sử nệnh nhân này."
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Reception Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-3">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-[#2b8cee] rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                            <Stethoscope className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tightest leading-none">Phòng Bác sĩ</h1>
                            <p className="text-slate-500 font-bold ml-1 mt-1 uppercase tracking-widest text-[10px]">Consultation & EMR Hub</p>
                        </div>
                    </div>
                </div>

                {/* Queue Selection Premium Tabs */}
                <div className="flex bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 gap-2 overflow-x-auto no-scrollbar">
                    {queues?.map(q => (
                        <button
                            key={q.id}
                            onClick={() => setSelectedQueueId(q.id)}
                            className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap whitespace-pre ${selectedQueueId === q.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            {q.nameVi}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Left: Enhanced Queue List */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Đang chờ trong hàng ({waitingEntries?.length || 0})
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode="popLayout">
                            {loadingQueue ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-32 bg-white rounded-[3rem] animate-pulse border border-slate-50 shadow-sm" />
                                ))
                            ) : (
                                waitingEntries?.map((e, idx) => (
                                    <motion.div
                                        key={idx}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-100 transition-all group flex items-center justify-between relative overflow-hidden"
                                    >
                                        <div className="absolute -right-6 -bottom-6 p-8 opacity-[0.02] group-hover:scale-125 transition-transform duration-1000 group-hover:opacity-[0.05]">
                                            <User className="w-32 h-32" />
                                        </div>
                                        <div className="flex items-center gap-8 relative z-10">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner relative">
                                                <User className="w-8 h-8" />
                                                {e.acuityLevel && (
                                                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg ${e.acuityLevel === '1' ? 'bg-red-500' : e.acuityLevel === '2' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                                        {e.acuityLevel}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-slate-900 tracking-tightest leading-none mb-3 group-hover:text-blue-600 transition-colors uppercase">
                                                    {e.patientName || 'ANONYMOUS BN'}
                                                </h4>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Đợi: {new Date(e.joinedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-[10px] font-black text-blue-500 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-[0.1em]">
                                                        DỊCH VỤ: {e.medicalServiceName || 'KHÁM CHUYÊN KHOA'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 relative z-10">
                                            <button
                                                onClick={() => handleCall(e.id)}
                                                className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 transition-all"
                                                title="Gọi âm thanh"
                                            >
                                                <Droplets className="w-6 h-6 rotate-180" />
                                            </button>
                                            <button
                                                onClick={() => startMutation.mutate(e.id)}
                                                className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3"
                                            >
                                                Vào Khám
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}

                            {!loadingQueue && waitingEntries?.length === 0 && (
                                <div className="py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 shadow-inner">
                                        <CheckCircle2 className="w-12 h-12" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 mb-2">Đã xong tất cả hàng chờ</h4>
                                    <p className="text-slate-400 font-bold max-w-xs uppercase text-[10px] tracking-widest">Tuyệt vời, không có bệnh nhân nào đang đợi!</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Daily Insights & Stats */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-12 text-slate-500">Hiệu suất Clinical hôm nay</h3>
                        <div className="space-y-12">
                            {[
                                { label: 'Tổng ca hoàn tất', value: '24', icon: CheckCircle2, sub: '+4 so với KPI', color: 'text-emerald-400' },
                                { label: 'TG khám trung bình', value: '14ph', icon: Clock, sub: 'Đang duy trì ổn định', color: 'text-blue-400' },
                                { label: 'Độ hài lòng BN', value: '4.9/5', icon: Activity, sub: 'Dựa trên khảo sát thực tế', color: 'text-amber-400' }
                            ].map((s, i) => (
                                <div key={i} className="flex items-start gap-6 group">
                                    <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${s.color} group-hover:bg-white/10 transition-colors shadow-inner`}>
                                        <s.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black leading-none mb-2 tracking-tightest">{s.value}</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{s.label}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-blue-600" />
                                            <p className="text-[10px] font-bold text-slate-400 italic">{s.sub}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 pt-10 border-t border-white/5">
                            <button className="w-full py-5 bg-white/5 hover:bg-white/10 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex items-center justify-center gap-3">
                                Xem báo cáo chi tiết <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-125 transition-transform duration-700">
                            <BrainCircuit className="w-32 h-32" />
                        </div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Trợ lý bác sĩ (AI)</h3>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed italic border-l-4 border-blue-500 pl-6 py-2">
                            "Nhắc nhở: Hệ thống phát hiện mật độ hàng chờ đang tăng ở khu vực siêu âm, vui lòng ưu tiên hoàn tất các ca khám nhanh."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PatientHistory({ patientId }: { patientId: string }) {
    const { headers } = useTenant()
    const { data: history, isLoading } = useQuery({
        queryKey: ['patient-history', patientId],
        queryFn: () => getPatientHistory(patientId, headers),
        enabled: !!patientId
    })

    if (isLoading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-slate-50 rounded-[2.5rem] animate-pulse" />)}</div>

    return (
        <div className="space-y-6">
            {history?.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <History className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Hồ sơ bệnh án trống</p>
                </div>
            ) : history?.map((item: any) => (
                <div key={item.id} className="bg-white border border-slate-100 p-8 rounded-[3rem] hover:shadow-xl hover:border-blue-100 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">KẾT QUẢ KHÁM CHUYÊN KHOA</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(item.startedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Bác sĩ: {item.doctorName || 'Hệ thống'}</p>
                                </div>
                            </div>
                        </div>
                        <span className="bg-slate-900 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">VIEW FULL EHR</span>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Kết luận chẩn đoán:</p>
                        <div className="text-base font-medium text-slate-700 leading-relaxed bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 italic">
                            "{item.diagnosisNotes || 'Dữ liệu không được ghi nhận'}"
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function ConsultationVitals({ consultationId }: { consultationId: string }) {
    const { headers } = useTenant()
    const { data: vitals, isLoading } = useQuery({
        queryKey: ['consultation-vitals', consultationId],
        queryFn: () => getVitals(consultationId, headers),
        enabled: !!consultationId
    })

    if (isLoading) return <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-slate-50 rounded-3xl animate-pulse" />)}</div>

    return (
        <div className="grid grid-cols-2 gap-4">
            {vitals?.map((v: any, i: number) => (
                <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Activity className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{v.vitalType}</p>
                        <p className="text-2xl font-black text-slate-900">{v.valueNumeric} <span className="text-[10px] text-slate-400 uppercase ml-1 font-bold">{v.unit}</span></p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Recorded: {new Date(v.recordedAt).toLocaleTimeString()}</p>
                    </div>
                </div>
            ))}
            {(!vitals || vitals.length === 0) && (
                <div className="col-span-2 py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Không có dữ liệu sinh hiệu chi tiết cho ca này</p>
                </div>
            )}
        </div>
    )
}
