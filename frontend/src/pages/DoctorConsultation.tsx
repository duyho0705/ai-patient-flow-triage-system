import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getConsultation, updateConsultation, completeConsultation, getPatientHistory } from '@/api/clinical'
import { getPatient } from '@/api/patients'
import { ArrowLeft, Save, CheckCircle, Activity, FileText, History as HistoryIcon, Stethoscope, Clock } from 'lucide-react'
import { toastService } from '@/services/toast'

export function DoctorConsultation() {
    const { consultationId } = useParams<{ consultationId: string }>()
    const navigate = useNavigate()
    const { headers } = useTenant()
    const queryClient = useQueryClient()

    const [activeTab, setActiveTab] = useState<'evaluation' | 'history'>('evaluation')
    const [diagnosis, setDiagnosis] = useState('')
    const [prescription, setPrescription] = useState('')

    const { data: consultation, isLoading } = useQuery({
        queryKey: ['consultation', consultationId],
        queryFn: () => getConsultation(consultationId!, headers),
        enabled: !!consultationId && !!headers?.tenantId,
    })

    const { data: patient } = useQuery({
        queryKey: ['patient', consultation?.patientId],
        queryFn: () => getPatient(consultation!.patientId, headers),
        enabled: !!consultation?.patientId && !!headers?.tenantId,
    })

    const { data: history } = useQuery({
        queryKey: ['patient-history', consultation?.patientId],
        queryFn: () => getPatientHistory(consultation!.patientId, headers),
        enabled: !!consultation?.patientId && activeTab === 'history',
    })

    useEffect(() => {
        if (consultation) {
            setDiagnosis(consultation.diagnosisNotes || '')
            setPrescription(consultation.prescriptionNotes || '')
        }
    }, [consultation])

    const saveMutation = useMutation({
        mutationFn: () =>
            updateConsultation(
                consultationId!,
                { diagnosisNotes: diagnosis, prescriptionNotes: prescription },
                headers
            ),
        onSuccess: () => {
            toastService.success('💾 Đã lưu nháp thành công')
            queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] })
        },
        onError: (e: Error) => toastService.error(e.message),
    })

    const completeMutation = useMutation({
        mutationFn: () => completeConsultation(consultationId!, headers),
        onSuccess: () => {
            toastService.success('✅ Hoàn tất khám bệnh thành công!')
            navigate('/queue')
        },
        onError: (e: Error) => toastService.error(e.message),
    })

    if (isLoading) return <div className="p-8">Đang tải hồ sơ bệnh án...</div>
    if (!consultation) return <div className="p-8">Không tìm thấy phiếu khám.</div>

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-20">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/queue')} className="text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Phiếu Khám Bệnh</h1>
                        <p className="text-xs text-slate-500">Mã phiếu: {consultation.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${consultation.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {consultation.status === 'COMPLETED' ? 'HOÀN TẤT' : 'ĐANG KHÁM'}
                    </span>
                </div>
            </header>



            <div className="mx-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Cột trái: Thông tin bệnh nhân & Triage */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Thông tin Hành chính */}
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <FileText className="h-4 w-4" />
                            </span>
                            Hành chính
                        </h3>
                        {patient ? (
                            <div className="space-y-2 text-sm">
                                <p><span className="text-slate-500">Họ tên:</span> <span className="font-semibold">{patient.fullNameVi}</span></p>
                                <p><span className="text-slate-500">Ngày sinh:</span> {patient.dateOfBirth}</p>
                                <p><span className="text-slate-500">Giới tính:</span> {patient.gender}</p>
                                <p><span className="text-slate-500">SĐT:</span> {patient.phone}</p>
                                <p><span className="text-slate-500">Địa chỉ:</span> {patient.addressLine}</p>
                            </div>
                        ) : (
                            <p>Đang tải...</p>
                        )}
                    </section>

                    {/* Thông tin Phân loại (Triage) */}
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                <Activity className="h-4 w-4" />
                            </span>
                            Thông tin Phân loại
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                                <span className="text-slate-500">Mức ưu tiên</span>
                                <span className="text-lg font-bold text-red-600 border border-red-200 bg-white px-3 rounded">{consultation.acuityLevel || '—'}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 mb-1">Lý do khám / Triệu chứng:</span>
                                <p className="font-medium text-slate-900 bg-slate-50 p-2 rounded-lg">{consultation.chiefComplaintSummary || '—'}</p>
                            </div>
                            {/* Nếu muốn hiển thị vitals chi tiết, cần fetch thêm TriageSession */}
                        </div>
                    </section>

                    {/* AI Insights */}
                    {consultation.aiExplanation && (
                        <section className="rounded-xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
                            <h3 className="mb-3 flex items-center gap-2 font-bold text-purple-900">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                    🧠
                                </span>
                                Phân tích AI
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="flex justify-between text-purple-700 font-medium mb-1">
                                        <span>Độ tin cậy</span>
                                        <span>{consultation.aiConfidenceScore ? (consultation.aiConfidenceScore * 100).toFixed(0) + '%' : '—'}</span>
                                    </div>
                                    <div className="w-full bg-purple-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(consultation.aiConfidenceScore || 0) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-purple-700 font-medium mb-1">Lý do đề xuất:</span>
                                    <p className="text-purple-900 bg-purple-100/50 p-3 rounded-lg border border-purple-200 text-sm leading-relaxed">
                                        {consultation.aiExplanation}
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Cột phải: Khu vực làm việc của Bác sĩ */}
                <div className="space-y-6 lg:col-span-2">
                    <section className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
                        <div className="mb-6 flex border-b border-slate-200">
                            <button
                                className={`flex items-center gap-2 border-b-2 px-6 py-3 font-medium transition ${activeTab === 'evaluation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                onClick={() => setActiveTab('evaluation')}
                            >
                                <Stethoscope className="h-5 w-5" />
                                Khám bệnh
                            </button>
                            <button
                                className={`flex items-center gap-2 border-b-2 px-6 py-3 font-medium transition ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                onClick={() => setActiveTab('history')}
                            >
                                <HistoryIcon className="h-5 w-5" />
                                Lịch sử khám
                            </button>
                        </div>

                        {activeTab === 'evaluation' ? (
                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="mb-2 block font-semibold text-slate-700">Chẩn đoán / Bệnh án</label>
                                    <textarea
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 min-h-[150px]"
                                        placeholder="Nhập chẩn đoán bệnh..."
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-semibold text-slate-700">Hướng xử trí / Toa thuốc</label>
                                    <textarea
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 min-h-[150px]"
                                        placeholder="Kê toa thuốc hoặc chỉ định cận lâm sàng..."
                                        value={prescription}
                                        onChange={(e) => setPrescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history?.map((h) => (
                                    <div key={h.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                                <span className="font-medium text-slate-900">
                                                    {new Date(h.startedAt).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                            <span className="rounded-full bg-slate-200 px-2 py-1 text-xs">{h.status === 'COMPLETED' ? 'Hoàn tất' : 'Chưa xong'}</span>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            <strong>BS:</strong> {h.doctorName || '—'}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            <strong>Chẩn đoán:</strong> {h.diagnosisNotes || '—'}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            <strong>Toa thuốc:</strong> {h.prescriptionNotes || '—'}
                                        </p>
                                    </div>
                                ))}
                                {!history?.length && <p className="text-slate-500">Chưa có lịch sử khám bệnh.</p>}
                            </div>
                        )}

                        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                            <button
                                onClick={() => saveMutation.mutate()}
                                disabled={saveMutation.isPending || consultation.status === 'COMPLETED'}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <Save className="h-5 w-5" />
                                {saveMutation.isPending ? 'Đang lưu...' : 'Lưu Nháp'}
                            </button>

                            <button
                                onClick={() => completeMutation.mutate()}
                                disabled={completeMutation.isPending || consultation.status === 'COMPLETED'}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
                            >
                                <CheckCircle className="h-5 w-5" />
                                {completeMutation.isPending ? 'Đang xử lý...' : 'Hoàn Tất Khám'}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
