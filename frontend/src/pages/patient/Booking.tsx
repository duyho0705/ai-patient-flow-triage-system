import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getPortalBranches,
    getPortalSlots,
    createPortalAppointment,
    getAiPreTriage,
    getPortalFamily,
    getPortalProfile
} from '@/api/portal'
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
    ChevronDown,
    User,
    Users,
    Baby,
    Heart,
    Plus,
    Flower2,
    Ear,
    Smile,
    Eye,
    Sparkles,
    ShieldCheck,
    Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

const SPECIALTIES = [
    { id: 'INTERNAL', name: 'Nội tổng quát', icon: Heart, description: 'Khám các bệnh lý nội khoa, tim dịch, hô hấp...' },
    { id: 'SURGERY', name: 'Ngoại tổng quát', icon: Activity, description: 'Tiểu phẫu, vết thương, các bệnh lý ngoại khoa...' },
    { id: 'PEDIATRICS', name: 'Nhi khoa', icon: Baby, description: 'Khám và điều trị cho trẻ em dưới 16 tuổi.' },
    { id: 'OBGYN', name: 'Sản phụ khoa', icon: Flower2, description: 'Chăm sóc thai sản, khám phụ khoa.' },
    { id: 'ENT', name: 'Tai Mũi Họng', icon: Ear, description: 'Các bệnh lý về tai, mũi, họng, amidan...' },
    { id: 'DENTAL', name: 'Răng Hàm Mặt', icon: Smile, description: 'Lấy cao răng, nhổ răng, điều trị tủy...' },
    { id: 'EYE', name: 'Mắt', icon: Eye, description: 'Đo thị lực, khám các bệnh lý về mắt.' },
    { id: 'DERMATOLOGY', name: 'Da liễu', icon: Sparkles, description: 'Các vấn đề về da, mụn, dị ứng...' }
]

const EXAM_MODES = [
    { id: 'SERVICE', name: 'Khám Dịch vụ', desc: 'Ưu tiên nhanh, chọn bác sĩ', icon: Zap, color: 'text-blue-600 bg-blue-50' },
    { id: 'INSURANCE', name: 'Khám BHYT', desc: 'Có thẻ Bảo hiểm Y tế', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' }
]

export default function PatientBooking() {
    const { headers } = useTenant()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [searchParams] = useSearchParams()

    // Booking State
    const [step, setStep] = useState(searchParams.get('for') ? 1 : 0)
    const [selectedSubject, setSelectedSubject] = useState<{ id: string | null, fullName: string, type: 'SELF' | 'RELATIVE' } | null>(null)
    const [selectedMode, setSelectedMode] = useState<string>('SERVICE')
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [selectedSlot, setSelectedSlot] = useState<{ start: string, end: string } | null>(null)
    const [notes, setNotes] = useState('')
    const [aiSuggestion, setAiSuggestion] = useState<any>(null)
    const [loadingAi, setLoadingAi] = useState(false)

    // Queries
    const { data: family = [] } = useQuery({
        queryKey: ['portal-family'],
        queryFn: () => getPortalFamily(headers),
        enabled: !!headers?.tenantId
    })

    const { data: profile } = useQuery({
        queryKey: ['portal-profile'],
        queryFn: () => getPortalProfile(headers),
        enabled: !!headers?.tenantId
    })

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

    // Init subject from URL or profile
    useEffect(() => {
        const forName = searchParams.get('for')
        if (forName && family.length > 0) {
            const member = family.find(f => f.fullName === forName)
            if (member) {
                setSelectedSubject({ id: member.id, fullName: member.fullName, type: 'RELATIVE' })
                setStep(1)
            }
        } else if (!selectedSubject && profile && !forName) {
            setSelectedSubject({ id: profile.id, fullName: profile.fullNameVi, type: 'SELF' })
        }
    }, [searchParams, family, profile])

    // Mutation
    const bookingMutation = useMutation({
        mutationFn: (data: any) => createPortalAppointment(data, headers),
        onSuccess: () => {
            toast.success('Đặt lịch thành công!')
            queryClient.invalidateQueries({ queryKey: ['portal-appointments'] })
            setStep(5) // Final UI step
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra khi đặt lịch.')
        }
    })

    const handleBooking = () => {
        if (!selectedBranch || !selectedSlot) return

        const modeName = EXAM_MODES.find(m => m.id === selectedMode)?.name;
        const specialtyName = SPECIALTIES.find(s => s.id === selectedSpecialty)?.name || 'Khám tổng quát';

        const prefix = selectedSubject?.type === 'RELATIVE'
            ? `[ĐẶT CHO: ${selectedSubject.fullName}] [CHẾ ĐỘ: ${modeName}] `
            : `[CHẾ ĐỘ: ${modeName}] `;

        bookingMutation.mutate({
            branchId: selectedBranch,
            patientId: selectedSubject?.id || profile?.id,
            appointmentDate: selectedDate,
            slotStartTime: selectedSlot.start,
            slotEndTime: selectedSlot.end,
            appointmentType: specialtyName,
            notes: prefix + notes,
            status: 'SCHEDULED'
        })
    }

    const runAiAssessment = async () => {
        if (!notes || notes.length < 5) return
        setLoadingAi(true)
        try {
            const result = await getAiPreTriage(notes, headers)
            setAiSuggestion(result)

            // Auto-suggest specialty based on Vietnamese keywords
            const low = notes.toLowerCase()
            if (low.includes('răng') || low.includes('nướu')) setSelectedSpecialty('DENTAL')
            else if (low.includes('mắt') || low.includes('nhìn')) setSelectedSpecialty('EYE')
            else if (low.includes('tai') || low.includes('mũi') || low.includes('họng')) setSelectedSpecialty('ENT')
            else if (low.includes('bé') || low.includes('trẻ')) setSelectedSpecialty('PEDIATRICS')
            else if (low.includes('ngứa') || low.includes('da') || low.includes('mụn')) setSelectedSpecialty('DERMATOLOGY')
            else if (low.includes('thai') || low.includes('bầu')) setSelectedSpecialty('OBGYN')
            else if (low.includes('đau ngực') || low.includes('tim')) setSelectedSpecialty('INTERNAL')
        } catch (err) {
            console.error('AI Assessment failed', err)
        } finally {
            setLoadingAi(false)
        }
    }

    const handleDateChange = (type: 'day' | 'month' | 'year', val: string) => {
        const d = selectedDate ? new Date(selectedDate) : new Date();
        if (type === 'day') d.setDate(parseInt(val));
        if (type === 'month') d.setMonth(parseInt(val) - 1);
        if (type === 'year') d.setFullYear(parseInt(val));

        const dateStr = d.toISOString().split('T')[0];
        setSelectedDate(dateStr);
        setSelectedSlot(null);
    }

    const steps = [
        { id: 0, title: 'Đối tượng', icon: User },
        { id: 1, title: 'Triệu chứng', icon: BrainCircuit },
        { id: 2, title: 'Cơ sở & Khoa', icon: Building2 },
        { id: 3, title: 'Thời gian', icon: Calendar },
        { id: 4, title: 'Xác nhận', icon: CheckCircle2 }
    ]

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                            <CalendarCheck className="w-8 h-8" />
                        </div>
                        Đặt lịch khám
                    </h1>
                    <p className="text-slate-500 font-medium text-lg ml-16 mt-2">Chủ động thời gian, không chờ đợi.</p>
                </div>
                {step < 4 && (
                    <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
                        {steps.map((s, idx) => (
                            <div key={s.id} className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${step >= s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id + 1}
                                </div>
                                <span className={`text-xs font-black uppercase tracking-widest hidden lg:block ${step >= s.id ? 'text-slate-900' : 'text-slate-300'}`}>
                                    {s.title}
                                </span>
                                {idx < steps.length - 1 && <div className="w-6 h-0.5 bg-slate-100 mx-2" />}
                            </div>
                        ))}
                    </div>
                )}
            </header>

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Self Option */}
                            <button
                                onClick={() => {
                                    setSelectedSubject({ id: profile?.id || null, fullName: profile?.fullNameVi || '', type: 'SELF' })
                                    setStep(1)
                                }}
                                className={`text-left p-8 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden ${selectedSubject?.type === 'SELF'
                                    ? 'border-blue-600 bg-blue-50/30'
                                    : 'border-slate-50 bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50'
                                    }`}
                            >
                                <div className="relative z-10 space-y-4">
                                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">Cho bản thân</h3>
                                        <p className="text-sm font-medium text-slate-400 mt-1">{profile?.fullNameVi}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
                                        Tiếp tục đặt lịch
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                                <User className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50/50 -rotate-12 group-hover:rotate-0 transition-transform" />
                            </button>

                            {/* Family Members */}
                            {family.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => {
                                        setSelectedSubject({ id: member.id, fullName: member.fullName, type: 'RELATIVE' })
                                        setStep(1)
                                    }}
                                    className={`text-left p-8 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden ${selectedSubject?.id === member.id
                                        ? 'border-blue-600 bg-blue-50/30'
                                        : 'border-slate-50 bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/50'
                                        }`}
                                >
                                    <div className="relative z-10 space-y-4">
                                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                                            <Users className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">{member.fullName}</h3>
                                            <p className="text-sm font-medium text-slate-400 mt-1">{member.relationship}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
                                            Đặt lịch cho {member.fullName}
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <Heart className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50/50 -rotate-12 group-hover:rotate-0 transition-transform" />
                                </button>
                            ))}

                            {/* Add Relative Prompt */}
                            <button
                                onClick={() => navigate('/patient/family')}
                                className="text-center p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 hover:border-blue-200 transition-all bg-slate-50/50"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-300">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Thêm người thân khác</p>
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left: Symptoms Input */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bạn đang có triệu chứng gì?</label>
                                        <textarea
                                            rows={6}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            onBlur={runAiAssessment}
                                            placeholder="Gõ triệu chứng tại đây (Ví dụ: Tôi bị đau họng và sốt từ sáng nay...)"
                                            className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all resize-none text-lg"
                                        />
                                    </div>

                                    {/* AI Assistant Insight */}
                                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                                        <div className="absolute top-0 right-0 p-6 opacity-10">
                                            <BrainCircuit className="w-20 h-20" />
                                        </div>
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <Zap className="w-5 h-5" />
                                                </div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Trợ lý AI Tư vấn</h4>
                                            </div>

                                            {loadingAi ? (
                                                <div className="flex items-center gap-4 py-4">
                                                    <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                                                    <p className="text-sm font-bold text-slate-500 italic">Đang phân tích triệu chứng...</p>
                                                </div>
                                            ) : aiSuggestion || selectedSpecialty ? (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">GỢI Ý CHUYÊN KHOA:</span>
                                                        <span className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                            {SPECIALTIES.find(s => s.id === selectedSpecialty)?.name || 'Nội tổng quát'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                                                        "{aiSuggestion?.explanation || 'Dựa trên mô tả, bạn có thể đăng ký khám tại chuyên khoa này.'}"
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm font-medium text-slate-500 py-4 italic">
                                                    Hãy mô tả triệu chứng, AI sẽ giúp bạn chọn đúng chuyên khoa phù hợp.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Exam Mode Selection */}
                            <div className="space-y-6">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Chọn chế độ khám</label>
                                <div className="grid gap-4">
                                    {EXAM_MODES.map(mode => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setSelectedMode(mode.id)}
                                            className={`text-left p-6 rounded-[2rem] border-2 transition-all flex items-center gap-6 ${selectedMode === mode.id
                                                ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100'
                                                : 'border-slate-50 bg-white hover:border-blue-100'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${mode.color}`}>
                                                <mode.icon className="w-7 h-7" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-black text-slate-900">{mode.name}</h4>
                                                <p className="text-sm font-bold text-slate-400">{mode.desc}</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMode === mode.id ? 'border-blue-600 bg-blue-600' : 'border-slate-200'}`}>
                                                {selectedMode === mode.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {selectedMode === 'INSURANCE' && (
                                    <div className="p-6 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex items-start gap-4 animate-in fade-in zoom-in-95">
                                        <ShieldCheck className="w-6 h-6 text-emerald-600 mt-1" />
                                        <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                                            Lưu ý: Vui lòng mang theo Thẻ BHYT bản gốc và Giấy CCCD khi đến khám để được hưởng quyền lợi bảo hiểm.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setStep(0)}
                                className="flex items-center gap-2 px-8 py-4 text-slate-400 font-black hover:text-slate-900 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Quay lại
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-tight hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                            >
                                Tiếp tục: Chọn cơ sở
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12"
                    >
                        {/* Branch Selection */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                1. Chọn cơ sở phòng khám
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {loadingBranches ? (
                                    Array.from({ length: 2 }).map((_, i) => (
                                        <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse" />
                                    ))
                                ) : branches?.map(branch => (
                                    <button
                                        key={branch.id}
                                        onClick={() => setSelectedBranch(branch.id)}
                                        className={`text-left p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden ${selectedBranch === branch.id
                                            ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100'
                                            : 'border-slate-50 bg-white hover:border-blue-100'
                                            }`}
                                    >
                                        <div className="relative z-10 flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedBranch === branch.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900">{branch.nameVi}</h4>
                                                <p className="text-xs font-bold text-slate-400">{branch.addressLine}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Specialty Selection */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                                    <Activity className="w-5 h-5" />
                                </div>
                                2. Chọn chuyên khoa khám
                            </h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {SPECIALTIES.map(spec => (
                                    <button
                                        key={spec.id}
                                        onClick={() => setSelectedSpecialty(spec.id)}
                                        className={`text-left p-6 rounded-[2rem] border-2 transition-all group relative overflow-hidden ${selectedSpecialty === spec.id
                                            ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100'
                                            : 'border-slate-50 bg-white hover:border-blue-100'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${selectedSpecialty === spec.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200Scale' : 'bg-slate-50 text-slate-400'}`}>
                                            <spec.icon className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-black text-slate-900 leading-tight">{spec.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 line-clamp-2 uppercase tracking-tight">{spec.description}</p>

                                        {/* AI Tag */}
                                        {selectedSpecialty === spec.id && aiSuggestion && (
                                            <div className="absolute top-4 right-4 animate-bounce">
                                                <div className="bg-blue-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase">AI Gợi ý</div>
                                            </div>
                                        )}
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
                                disabled={!selectedBranch || !selectedSpecialty}
                                onClick={() => setStep(3)}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-tight hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200"
                            >
                                Tiếp tục: Thời gian
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
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                        Chọn ngày & Giờ khám
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest ml-8">Lịch trình khả dụng tại phòng khám</p>
                                </div>
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

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {loadingSlots ? (
                                    Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                                    ))
                                ) : slots?.length === 0 ? (
                                    <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-400 font-bold">Không có slot nào khả dụng trong ngày này.</p>
                                    </div>
                                ) : slots?.map((slot, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!slot.available}
                                        onClick={() => setSelectedSlot({ start: slot.startTime, end: slot.endTime })}
                                        className={`py-5 rounded-2xl font-black text-sm transition-all border-2 ${!slot.available
                                            ? 'bg-slate-50 border-transparent text-slate-300 cursor-not-allowed opacity-50'
                                            : selectedSlot?.start === slot.startTime
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                                : 'bg-white border-slate-50 text-slate-600 hover:border-blue-100 hover:bg-blue-50/30 shadow-sm'
                                            }`}
                                    >
                                        {slot.startTime.substring(0, 5)}
                                    </button>
                                ))}
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
                                disabled={!selectedSlot}
                                onClick={() => setStep(4)}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-tight hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200"
                            >
                                Tiếp tục: Xác nhận lịch
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-10">
                            <div className="flex items-center justify-between flex-wrap gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                        <CalendarCheck className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">Xác nhận thông tin</h3>
                                        <p className="text-sm font-bold text-slate-400">Vui lòng kiểm tra kỹ trước khi hoàn tất</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest ${selectedMode === 'SERVICE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {EXAM_MODES.find(m => m.id === selectedMode)?.name}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12 pt-6">
                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Người khám bệnh</p>
                                            <p className="font-bold text-slate-700 text-lg">{selectedSubject?.fullName}</p>
                                            <p className="text-xs font-bold text-slate-400">{selectedSubject?.type === 'SELF' ? 'Chủ tài khoản' : 'Người thân'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Cơ sở khám</p>
                                            <p className="font-bold text-slate-700 text-lg">{branches?.find(b => b.id === selectedBranch)?.nameVi}</p>
                                            <p className="text-xs font-bold text-slate-400">{branches?.find(b => b.id === selectedBranch)?.addressLine}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                            <Heart className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Chuyên khoa</p>
                                            <p className="font-bold text-slate-700 text-lg">{SPECIALTIES.find(s => s.id === selectedSpecialty)?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Thời gian hẹn</p>
                                            <p className="font-bold text-slate-700 text-lg">
                                                {selectedSlot?.start.substring(0, 5)} · {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Warning / Tip Box */}
                            <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                                <div className="flex items-center gap-3 text-slate-900 font-black text-sm uppercase tracking-tight">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                    Lời khuyên tham khám
                                </div>
                                <ul className="space-y-3">
                                    {selectedMode === 'INSURANCE' && (
                                        <li className="text-xs font-bold text-slate-500 flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                            Mang theo thẻ BHYT bản gốc và CCCD gắn chip (hoặc ứng dụng VNeID mức 2).
                                        </li>
                                    )}
                                    <li className="text-xs font-bold text-slate-500 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        Vui lòng đến trước 15 phút so với giờ hẹn để hoàn tất thủ tục đăng ký tại quầy.
                                    </li>
                                    <li className="text-xs font-bold text-slate-500 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        Nhịn ăn ít nhất 6-8 tiếng nếu bạn có ý định xét nghiệm máu hoặc nội soi dạ dày.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setStep(3)}
                                className="flex items-center gap-2 px-8 py-4 text-slate-400 font-black hover:text-slate-900 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Quay lại
                            </button>
                            <button
                                disabled={bookingMutation.isPending}
                                onClick={handleBooking}
                                className="px-14 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black tracking-tight hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all flex items-center gap-4"
                            >
                                {bookingMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <CalendarCheck className="w-6 h-6" />}
                                <span className="text-lg">Xác nhận và Hoàn tất</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 5 && (
                    <motion.div
                        key="step5"
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
