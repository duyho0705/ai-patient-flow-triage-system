import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPortalBranches, getPortalSlots, createPortalAppointment, getAiPreTriage } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import {
    Calendar,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Building2,
    AlertCircle,
    Loader2,
    CalendarCheck,
    BrainCircuit,
    Zap,
    ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function PatientBooking() {
    const { headers } = useTenant()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [step, setStep] = useState(1)

    // Separate state for internal select logic
    const handleDateChange = (type: 'day' | 'month' | 'year', val: string) => {
        const d = selectedDate ? new Date(selectedDate) : new Date();
        if (type === 'day') d.setDate(parseInt(val));
        if (type === 'month') d.setMonth(parseInt(val) - 1);
        if (type === 'year') d.setFullYear(parseInt(val));

        const dateStr = d.toISOString().split('T')[0];
        setSelectedDate(dateStr);
        setSelectedSlot(null);
    }

    // Booking State
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [selectedSlot, setSelectedSlot] = useState<{ start: string, end: string } | null>(null)
    const [appointmentType, setAppointmentType] = useState('Khám tổng quát')
    const [notes, setNotes] = useState('')
    const [aiSuggestion, setAiSuggestion] = useState<any>(null)
    const [loadingAi, setLoadingAi] = useState(false)

    // Queries
    const { data: branches, isLoading: loadingBranches } = useQuery({
        queryKey: ['portal-branches'],
        queryFn: () => getPortalBranches(headers),
        enabled: !!headers?.tenantId
    })

    const { data: slots, isLoading: loadingSlots } = useQuery({
        queryKey: ['portal-slots', selectedBranch, selectedDate],
        queryFn: () => getPortalSlots(selectedBranch!, selectedDate, headers),
        enabled: !!selectedBranch && !!selectedDate && !!headers?.tenantId
    })

    // Mutation
    const bookingMutation = useMutation({
        mutationFn: (data: any) => createPortalAppointment(data, headers),
        onSuccess: () => {
            toast.success('Đặt lịch thành công!')
            queryClient.invalidateQueries({ queryKey: ['portal-appointments'] })
            setStep(4) // Final step
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra khi đặt lịch.')
        }
    })

    const handleBooking = () => {
        if (!selectedBranch || !selectedSlot) return
        bookingMutation.mutate({
            branchId: selectedBranch,
            appointmentDate: selectedDate,
            slotStartTime: selectedSlot.start,
            slotEndTime: selectedSlot.end,
            appointmentType,
            notes
        })
    }

    const runAiAssessment = async () => {
        if (!notes || notes.length < 10) return
        setLoadingAi(true)
        try {
            const result = await getAiPreTriage(notes, headers)
            setAiSuggestion(result)
        } catch (err) {
            console.error('AI Assessment failed', err)
        } finally {
            setLoadingAi(false)
        }
    }

    const steps = [
        { id: 1, title: 'Chọn cơ sở', icon: Building2 },
        { id: 2, title: 'Thời gian', icon: Calendar },
        { id: 3, title: 'Xác nhận', icon: CheckCircle2 }
    ]

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Đặt lịch khám</h1>
                    <p className="text-slate-500 font-medium mt-1">Chủ động thời gian, không chờ đợi.</p>
                </div>
                {step < 4 && (
                    <div className="flex items-center gap-4">
                        {steps.map((s, idx) => (
                            <div key={s.id} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {s.id}
                                </div>
                                {idx < steps.length - 1 && <div className="w-8 h-0.5 bg-slate-100" />}
                            </div>
                        ))}
                    </div>
                )}
            </header>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid md:grid-cols-2 gap-4"
                    >
                        {loadingBranches ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse" />
                            ))
                        ) : branches?.map(branch => (
                            <button
                                key={branch.id}
                                onClick={() => {
                                    setSelectedBranch(branch.id)
                                    setStep(2)
                                }}
                                className={`text-left p-8 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden ${selectedBranch === branch.id
                                    ? 'border-blue-600 bg-blue-50/30'
                                    : 'border-slate-50 bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50'
                                    }`}
                            >
                                <div className="relative z-10 space-y-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedBranch === branch.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{branch.nameVi}</h3>
                                        <p className="text-sm font-medium text-slate-400 mt-1">{branch.addressLine}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
                                        Chọn cơ sở này
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                                <Building2 className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50/50 -rotate-12 group-hover:rotate-0 transition-transform" />
                            </button>
                        ))}
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Chọn ngày & Giờ khám
                                </h3>
                                <div className="flex gap-2">
                                    <CustomSelect
                                        value={selectedDate ? new Date(selectedDate).getDate().toString() : ''}
                                        onChange={(val: string) => handleDateChange('day', val)}
                                        options={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }))}
                                        placeholder="Ngày"
                                        className="w-24"
                                    />
                                    <CustomSelect
                                        value={selectedDate ? (new Date(selectedDate).getMonth() + 1).toString() : ''}
                                        onChange={(val: string) => handleDateChange('month', val)}
                                        options={Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: `Tháng ${i + 1}` }))}
                                        placeholder="Tháng"
                                        className="w-32"
                                    />
                                    <CustomSelect
                                        value={selectedDate ? new Date(selectedDate).getFullYear().toString() : ''}
                                        onChange={(val: string) => handleDateChange('year', val)}
                                        options={Array.from({ length: 2 }, (_, i) => ({ value: (new Date().getFullYear() + i).toString(), label: (new Date().getFullYear() + i).toString() }))}
                                        placeholder="Năm"
                                        className="w-28"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {loadingSlots ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="h-14 bg-slate-50 rounded-2xl animate-pulse" />
                                    ))
                                ) : slots?.length === 0 ? (
                                    <div className="col-span-full py-12 text-center">
                                        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-bold">Không có slot nào khả dụng trong ngày này.</p>
                                    </div>
                                ) : slots?.map((slot, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!slot.available}
                                        onClick={() => setSelectedSlot({ start: slot.startTime, end: slot.endTime })}
                                        className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${!slot.available
                                            ? 'bg-slate-50 border-transparent text-slate-300 cursor-not-allowed opacity-50'
                                            : selectedSlot?.start === slot.startTime
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                                : 'bg-white border-slate-50 text-slate-600 hover:border-blue-100 hover:bg-blue-50/30'
                                            }`}
                                    >
                                        {slot.startTime.substring(0, 5)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="flex items-center gap-2 px-8 py-4 text-slate-400 font-black hover:text-slate-900 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Quay lại
                            </button>
                            <button
                                disabled={!selectedSlot}
                                onClick={() => setStep(3)}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-tight hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Cơ sở chi tiết</label>
                                        <div className="p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 flex items-center gap-3">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                            {branches?.find(b => b.id === selectedBranch)?.nameVi}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Ngày & Giờ dự kiến</label>
                                        <div className="p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })} · {selectedSlot?.start.substring(0, 5)}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Loại hình dịch vụ</label>
                                        <select
                                            value={appointmentType}
                                            onChange={(e) => setAppointmentType(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none"
                                        >
                                            <option>Khám tổng quát</option>
                                            <option>Khám chuyên khoa Nội</option>
                                            <option>Khám chuyên khoa Ngoại</option>
                                            <option>Tư vấn chuyên sâu</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Ghi chú triệu chứng (Nếu có)</label>
                                        <textarea
                                            rows={5}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            onBlur={runAiAssessment}
                                            placeholder="Ví dụ: Tôi bị đau họng và sốt nhẹ từ tối qua..."
                                            className="w-full p-6 bg-slate-50 border-none rounded-[1.5rem] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all resize-none"
                                        />
                                    </div>

                                    {/* AI Prediction Section */}
                                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                                        <div className="absolute top-0 right-0 p-6 opacity-10">
                                            <BrainCircuit className="w-20 h-20" />
                                        </div>
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <Zap className="w-5 h-5" />
                                                </div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">AI Virtual Assessment</h4>
                                            </div>

                                            {loadingAi ? (
                                                <div className="flex items-center gap-4 py-4">
                                                    <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                                                    <p className="text-xs font-bold text-slate-500 italic">AI đang phân tích triệu chứng của bạn...</p>
                                                </div>
                                            ) : aiSuggestion ? (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">KẾT QUẢ DỰ KIẾN:</span>
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${aiSuggestion.suggestedAcuity === '1' ? 'bg-red-500' : 'bg-blue-600'}`}>
                                                            Priority Level {aiSuggestion.suggestedAcuity}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                                                        "{aiSuggestion.explanation}"
                                                    </p>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-4">
                                                        Hệ thống sẽ ưu tiên xử lý hồ sơ dựa trên mức độ này.
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs font-medium text-slate-500 py-4">
                                                    Nhập triệu chứng cụ thể để AI có thể hỗ trợ đánh giá sơ bộ mức độ ưu tiên của bạn.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setStep(2)}
                                className="flex items-center gap-2 px-8 py-4 text-slate-400 font-black hover:text-slate-900 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Quay lại
                            </button>
                            <button
                                disabled={bookingMutation.isPending}
                                onClick={handleBooking}
                                className="px-14 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black tracking-tight hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all flex items-center gap-3"
                            >
                                {bookingMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <CalendarCheck className="w-6 h-6" />}
                                Xác nhận Đặt lịch
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[3rem] p-16 text-center shadow-2xl shadow-slate-200/50 space-y-8 border border-slate-50"
                    >
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Đặt lịch thành công!</h2>
                            <p className="text-slate-500 font-medium px-12 leading-relaxed">
                                Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Lịch hẹn của bạn đã được ghi nhận và gửi đến cơ sở y tế.
                            </p>
                        </div>
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/patient/appointments')}
                                className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-tight hover:bg-black transition-all"
                            >
                                Xem lịch hẹn của tôi
                            </button>
                            <button
                                onClick={() => navigate('/patient')}
                                className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function CustomSelect({ value, onChange, options, placeholder, className = '' }: {
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    className?: string;
}) {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find(o => o.value === value)

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-transparent rounded-2xl transition-all ${isOpen ? 'bg-white border-blue-400 shadow-lg shadow-blue-400/10' : ''}`}
            >
                <span className={`font-bold text-sm transition-colors ${selectedOption ? 'text-slate-700' : 'text-slate-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-300 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-[70] mt-2 w-full max-h-60 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-y-auto scrollbar-hide py-2"
                        >
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full text-left px-5 py-3 text-sm font-bold transition-all ${value === opt.value ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
