import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { getPortalHistoryDetail, seedMedicalData } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import {
    ChevronLeft,
    Calendar,
    Activity,
    Clipboard,
    FileText,
    Receipt,
    Printer,
    Download,
    CheckCircle2,
    Clock3,
    ShieldCheck,
    Droplets,
    Beaker,
    Image as ImageIcon,
    AlertCircle,
    Check,
    Thermometer,
    Heart,
    Wind,
    Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-hot-toast'

export default function PatientHistoryDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { headers } = useTenant()
    const queryClient = useQueryClient()

    const { data: detail, isLoading } = useQuery({
        queryKey: ['portal-history-detail', id],
        queryFn: () => getPortalHistoryDetail(id!, headers),
        enabled: !!id && !!headers?.tenantId
    })

    const handleDownload = () => {
        if (!detail) return
        const doc = new jsPDF()

        doc.setFontSize(22)
        doc.text('HO SO SUC KHOE DIEN TU', 105, 20, { align: 'center' })

        doc.setFontSize(12)
        doc.text(`Benh nhan: ${detail.consultation.patientName || 'N/A'}`, 14, 40)
        doc.text(`Bac si: ${detail.consultation.doctorName || 'N/A'}`, 14, 50)
        doc.text(`Ngay kham: ${new Date(detail.consultation.startedAt).toLocaleDateString()}`, 14, 60)
        doc.text(`Chan doan: ${detail.consultation.diagnosisNotes || 'N/A'}`, 14, 70)

        let lastY = 80;

        if (detail.labResults && detail.labResults.length > 0) {
            doc.setFontSize(14)
            doc.text('KET QUA XET NGHIEM', 14, lastY)
            autoTable(doc, {
                startY: lastY + 5,
                head: [['Ten xet nghiem', 'Ket qua', 'Don vi', 'CS Tham chieu']],
                body: detail.labResults.map(lab => [
                    lab.testName,
                    lab.value,
                    lab.unit,
                    lab.referenceRange
                ]),
            })
            lastY = (doc as any).lastAutoTable.finalY + 20;
        }

        if (detail.prescription) {
            doc.setFontSize(14)
            doc.text('DON THUOC', 14, lastY)
            autoTable(doc, {
                startY: lastY + 5,
                head: [['Ten thuoc', 'SL', 'Cach dung']],
                body: detail.prescription.items.map(item => [
                    item.productName || '',
                    item.quantity || 0,
                    item.dosageInstruction || ''
                ]),
            })
        }

        doc.save(`digital-health-passport-${id}.pdf`)
    }

    if (isLoading) return <div className="p-12 text-center text-slate-400 font-bold">Đang tải chi tiết...</div>
    if (!detail) return <div className="p-12 text-center text-red-400 font-bold">Không tìm thấy thông tin ca khám.</div>

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all"
            >
                <ChevronLeft className="w-5 h-5" />
                Quay lại
            </button>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">KẾT QUẢ KHÁM</span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                            <Calendar className="w-4 h-4" />
                            {new Date(detail.consultation.startedAt).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        {detail.consultation.diagnosisNotes || 'Chưa cập nhật bộ chẩn đoán'}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            try {
                                await seedMedicalData(headers);
                                queryClient.invalidateQueries({ queryKey: ['portal-history-detail', id] });
                                toast.success('Đã làm mới dữ liệu y tế mẫu');
                            } catch (e) {
                                toast.error('Lỗi khi tạo dữ liệu');
                            }
                        }}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-100 transition-all border border-blue-100"
                    >
                        <Sparkles className="w-4 h-4" />
                        Tạo dữ liệu mẫu
                    </button>
                    <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Printer className="w-4 h-4" />
                        In KQ
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                    >
                        <Download className="w-4 h-4" />
                        Đơn thuốc
                    </button>
                </div>
            </header>

            {/* Visit Journey Timeline */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20"
            >
                <div className="flex items-center gap-3 mb-8">
                    <Clock3 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Hành trình thăm khám</h3>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
                    {/* Progress Bar (Desktop) */}
                    <div className="hidden md:block absolute top-[1.125rem] left-0 right-0 h-0.5 bg-slate-100" />

                    {[
                        { label: 'Tiếp nhận', status: 'completed', icon: CheckCircle2 },
                        { label: 'Phân loại', status: detail.consultation.triageSessionId ? 'completed' : 'pending', icon: CheckCircle2 },
                        { label: 'Thăm khám', status: detail.consultation.status === 'COMPLETED' ? 'completed' : 'active', icon: CheckCircle2 },
                        { label: 'Thanh toán', status: detail.invoice?.status === 'PAID' ? 'completed' : 'pending', icon: CheckCircle2 },
                        { label: 'Nhận thuốc', status: detail.invoice?.status === 'PAID' ? 'active' : 'pending', icon: CheckCircle2 }
                    ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-4 relative z-10 group">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${step.status === 'completed'
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200'
                                : step.status === 'active'
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse'
                                    : 'bg-white border-slate-200 text-slate-300'
                                }`}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${step.status === 'completed' ? 'text-emerald-600' :
                                step.status === 'active' ? 'text-blue-600' : 'text-slate-400'
                                }`}>{step.label}</span>
                        </div>
                    ))}
                </div>
            </motion.section>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Diagnosis & Notes */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8"
                    >
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Clipboard className="w-4 h-4" />
                                Chi tiết Chẩn đoán
                            </h3>
                            <p className="text-lg font-bold text-slate-700 leading-relaxed whitespace-pre-line">
                                {detail.consultation.diagnosisNotes || 'Không có ghi chú.'}
                            </p>
                        </div>

                        <div className="h-px bg-slate-50" />

                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Lời dặn Bác sĩ
                            </h3>
                            <p className="text-lg font-bold text-slate-700 leading-relaxed whitespace-pre-line">
                                {detail.consultation.prescriptionNotes || 'Tuân thủ theo đơn thuốc đính kèm.'}
                            </p>
                        </div>
                    </motion.section>

                    {/* Prescription */}
                    {detail.prescription && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-emerald-50/50 rounded-[2.5rem] p-8 md:p-10 border border-emerald-100/50"
                        >
                            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                                <Activity className="w-5 h-5" />
                                Đơn thuốc đính kèm
                            </h3>
                            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-emerald-50/50">
                                            <th className="px-6 py-4 text-xs font-black text-emerald-900 uppercase tracking-widest">Tên thuốc</th>
                                            <th className="px-6 py-4 text-xs font-black text-emerald-900 uppercase tracking-widest text-center">SL</th>
                                            <th className="px-6 py-4 text-xs font-black text-emerald-900 uppercase tracking-widest">Cách dùng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-50">
                                        {detail.prescription.items.map(item => (
                                            <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 text-sm">{item.productName}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black">{item.quantity}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-medium text-slate-500 italic">{item.dosageInstruction}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.section>
                    )}
                    {/* Lab Results */}
                    {detail.labResults && detail.labResults.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Beaker className="w-5 h-5" />
                                    Kết quả Xét nghiệm
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">{detail.labResults.length} Chỉ số</span>
                            </div>

                            <div className="space-y-4">
                                {detail.labResults.map((lab, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900">{lab.testName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CS Tham chiếu: {lab.referenceRange}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className={`text-xl font-black ${lab.status === 'NORMAL' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {lab.value} <span className="text-xs font-bold text-slate-400">{lab.unit}</span>
                                                </p>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {lab.status === 'NORMAL' ? (
                                                        <Check className="w-3 h-3 text-emerald-500" />
                                                    ) : (
                                                        <AlertCircle className="w-3 h-3 text-rose-500" />
                                                    )}
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${lab.status === 'NORMAL' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {lab.status === 'NORMAL' ? 'Bình thường' : 'Bất thường'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Diagnostic Imaging */}
                    {detail.diagnosticImages && detail.diagnosticImages.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-5">
                                <ImageIcon className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                                    <ImageIcon className="w-5 h-5" />
                                    Chẩn đoán hình ảnh
                                </h3>

                                <div className="grid sm:grid-cols-2 gap-8">
                                    {detail.diagnosticImages.map((img, i) => (
                                        <div key={i} className="space-y-4">
                                            <div className="aspect-video rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl group relative pointer-events-auto cursor-zoom-in">
                                                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
                                                    <p className="font-black text-sm">{img.title}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Kết luận:</p>
                                                <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                                                    "{img.description}"
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.section>
                    )}
                </div>

                {/* Right: Sidebar Detail */}
                <div className="space-y-8">
                    {/* Doctor Info */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg shadow-slate-200/30">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Bác sĩ phụ trách</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black">
                                {detail.consultation.doctorName?.slice(0, 1)}
                            </div>
                            <div>
                                <p className="font-black text-slate-900">BS. {detail.consultation.doctorName}</p>
                                <p className="text-xs font-bold text-slate-400">Chuyên khoa Nội</p>
                            </div>
                        </div>
                    </div>

                    {/* Vitals */}
                    {detail.vitals && detail.vitals.length > 0 && (
                        <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative shadow-xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Activity className="w-20 h-20" />
                            </div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 relative z-10">Chỉ số sinh hiệu</h3>
                            <div className="space-y-5 relative z-10">
                                {detail.vitals.map(v => {
                                    const getIcon = (type: string) => {
                                        const t = type.toLowerCase();
                                        if (t.includes('temp')) return <Thermometer className="w-5 h-5 text-orange-400" />;
                                        if (t.includes('heart') || t.includes('pulse')) return <Heart className="w-5 h-5 text-red-400" />;
                                        if (t.includes('oxygen') || t.includes('spo2')) return <Wind className="w-5 h-5 text-blue-400" />;
                                        if (t.includes('bp') || t.includes('pressure')) return <Droplets className="w-5 h-5 text-rose-400" />;
                                        return <Activity className="w-5 h-5 text-slate-400" />;
                                    }

                                    return (
                                        <div key={v.id} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all border border-white/5">
                                            <div className="flex items-center gap-3">
                                                {getIcon(v.vitalType)}
                                                <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{v.vitalType}</span>
                                            </div>
                                            <div className="flex items-end gap-1">
                                                <span className="text-xl font-black">{v.valueNumeric}</span>
                                                <span className="text-[10px] font-bold text-slate-500 pb-1">{v.unit}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* AI Insight Card */}
                    {detail.consultation.aiExplanation && (
                        <div className="bg-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/30">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <ShieldCheck className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-xs font-black uppercase tracking-widest text-blue-100 mb-4">Ghi chú AI (Triage)</h4>
                                <p className="text-sm font-medium leading-relaxed italic mb-4">
                                    "{detail.consultation.aiExplanation}"
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-100 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Độ tin cậy: {(detail.consultation.aiConfidenceScore || 0) * 100}%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invoice Card */}
                    {detail.invoice && (
                        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Thanh toán</h3>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${detail.invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {detail.invoice.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">{detail.invoice.finalAmount.toLocaleString('vi-VN')} đ</p>
                                    <p className="text-[10px] font-bold text-slate-400">Hóa đơn #{detail.invoice.invoiceNumber.toUpperCase()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/patient/billing')}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                            >
                                Xem chi tiết & Thanh toán
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
