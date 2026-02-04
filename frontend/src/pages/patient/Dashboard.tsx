import { useQuery } from '@tanstack/react-query'
import { getPortalDashboard, getPortalQueues, getAiChat } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import { usePatientRealtime } from '@/hooks/usePatientRealtime'
import {
    Calendar,
    ArrowRight,
    History as HistoryIcon,
    Activity,
    ChevronRight,
    Users,
    Stethoscope,
    QrCode,
    Wallet,
    ShieldPlus,
    X,
    Send,
    Sparkles,
    Bot,
    MessageCircle,
    BrainCircuit,
    Zap,
    BellRing,
    Clock,
    Pill
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function PatientDashboard() {
    const { headers } = useTenant()

    const { data: dashboard, isLoading: loadingDash } = useQuery({
        queryKey: ['portal-dashboard'],
        queryFn: () => getPortalDashboard(headers),
        enabled: !!headers?.tenantId
    })

    const { data: queues } = useQuery({
        queryKey: ['portal-queues'],
        queryFn: () => getPortalQueues(headers),
        enabled: !!headers?.tenantId
    })

    const [isQrOpen, setIsQrOpen] = useState(false)

    // Enable Real-time updates
    usePatientRealtime(dashboard?.patientId, dashboard?.branchId)

    if (loadingDash) return <div className="p-8 text-center font-bold text-slate-400">Đang tải...</div>

    return (
        <>
            <FloatingAssistant />
            <div className="space-y-10">
                {/* Hero Welcome */}
                <header className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white">
                    <div className="absolute top-0 right-0 p-12 opacity-10 -mr-20 -mt-20">
                        <Activity className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Xin chào, {dashboard?.patientName}!</h2>
                            <p className="text-slate-400 font-medium">Chúc bạn một ngày tốt lành và nhiều sức khỏe.</p>
                        </div>
                        <button
                            onClick={() => setIsQrOpen(true)}
                            className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-3xl flex items-center gap-3 hover:bg-white/20 transition-all group"
                        >
                            <QrCode className="w-6 h-6 text-blue-400" />
                            <div className="text-left">
                                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest leading-none mb-1">Mã Check-in</p>
                                <p className="text-sm font-bold">Quét tại Kiosk</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </header>

                {/* Pending Payment Banner */}
                {dashboard?.pendingInvoice && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-rose-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-rose-200 flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Thanh toán chờ xử lý</h3>
                                <p className="text-rose-100 font-medium opacity-80">Bạn có hóa đơn chưa thanh toán: {dashboard.pendingInvoice.finalAmount.toLocaleString('vi-VN')} đ</p>
                            </div>
                        </div>
                        <Link
                            to="/patient/billing"
                            className="px-10 py-4 bg-white text-rose-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-rose-900/20"
                        >
                            Thanh toán ngay
                        </Link>
                    </motion.div>
                )}

                {/* Active Queues Card */}
                {(queues && queues.length > 0) && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                                Tiến độ Hàng chờ trực tiếp
                            </h3>
                        </div>
                        <div className="grid gap-4">
                            {queues.map(q => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/40 flex items-center justify-between relative overflow-hidden group"
                                >
                                    <div className="absolute inset-y-0 left-0 w-2 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{q.queueName}</p>
                                            <p className="text-lg font-black text-slate-900">{q.status === 'CALLED' ? 'Mời bạn vào khám!' : 'Đang chờ khám'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian chờ dự kiến</p>
                                        <p className="text-2xl font-black text-blue-600">~{q.estimatedWaitMinutes} phút</p>
                                        <p className="text-[10px] font-bold text-slate-400">({q.peopleAhead} người phía trước)</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Health Metrics & Trend Charts */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black text-slate-900">Chỉ số sức khỏe & Xu hướng</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tình trạng ổn định</span>
                            </div>
                        </div>

                        {dashboard?.lastVitals && dashboard.lastVitals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {dashboard.lastVitals.slice(0, 4).map((v, i) => (
                                    <HealthCard
                                        key={i}
                                        vital={v}
                                        history={dashboard.vitalHistory?.filter(h => h.vitalType === v.vitalType) || []}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                                    <Activity className="w-10 h-10 text-slate-200" />
                                </div>
                                <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs">Chưa có dữ liệu sinh hiệu</h4>
                                <p className="text-slate-400 text-sm mt-2 max-w-xs">Các chỉ số sức khỏe của bạn sẽ xuất hiện tại đây sau ca khám đầu tiên.</p>
                            </div>
                        )}
                    </section>

                    {/* Next Appointment */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900 px-2">Lịch hẹn sắp tới</h3>
                        {dashboard?.nextAppointment ? (
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/30">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">
                                            {new Date(dashboard.nextAppointment.appointmentDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                                        </p>
                                        <p className="text-xs font-medium text-slate-400">{dashboard.nextAppointment.startTime} - {dashboard.nextAppointment.endTime}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cơ sở khám</p>
                                    <p className="text-sm font-bold text-slate-700">{dashboard.nextAppointment.branchName}</p>
                                </div>
                                <Link
                                    to="/patient/appointments"
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-tight hover:bg-blue-600 transition-all"
                                >
                                    Chi tiết lịch hẹn
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] p-12 border border-dashed border-slate-200 text-center space-y-4">
                                <p className="text-slate-400 font-bold">Bạn chưa có lịch hẹn nào.</p>
                                <Link
                                    to="/patient/booking"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200"
                                >
                                    Đặt lịch ngay
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Recent Visits */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-slate-900">Lần khám gần đây</h3>
                            <Link to="/patient/history" className="text-xs font-bold text-blue-600 hover:underline">Tất cả</Link>
                        </div>
                        <div className="space-y-3">
                            {dashboard?.recentVisits && dashboard.recentVisits.length > 0 ? (
                                dashboard.recentVisits.map(v => (
                                    <Link
                                        key={v.id}
                                        to={`/patient/history/${v.id}`}
                                        className="group flex items-center justify-between p-5 bg-white border border-slate-50 rounded-3xl hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Stethoscope className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{v.diagnosisNotes || 'Kết quả khám'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    {new Date(v.startedAt).toLocaleDateString('vi-VN')} · BS. {v.doctorName}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </Link>
                                ))
                            ) : (
                                <p className="text-center py-8 text-slate-400 font-medium">Chưa có lịch sử khám.</p>
                            )}
                        </div>
                    </section>

                    {/* AI Symptom Awareness Card */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900 px-2 flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-blue-600" />
                            AI Tư vấn Sức khỏe
                        </h3>
                        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Zap className="w-24 h-24" />
                            </div>
                            <div className="space-y-8">
                                <p className="text-sm font-medium leading-relaxed">Bạn cảm thấy không khỏe? Hãy để AI hỗ trợ phân loại mức độ ưu tiên của bạn ngay bây giờ.</p>
                                <Link
                                    to="/patient/booking"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20"
                                >
                                    Thử ngay AI Checker
                                    <Zap className="w-4 h-4 fill-blue-600" />
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Quick Actions Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Chat với Bác sĩ', icon: MessageCircle, color: 'bg-blue-50 text-blue-600', path: '#' },
                        { label: 'Thanh toán', icon: Wallet, color: 'bg-emerald-50 text-emerald-600', path: '/patient/billing' },
                        { label: 'Bảo hiểm', icon: ShieldPlus, color: 'bg-orange-50 text-orange-600', path: '#' },
                        { label: 'Lịch sử', icon: HistoryIcon, color: 'bg-purple-50 text-purple-600', path: '/patient/history' },
                    ].map((action, idx) => (
                        <Link
                            key={idx}
                            to={action.path}
                            className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col items-center gap-4 group"
                        >
                            <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{action.label}</span>
                        </Link>
                    ))}
                </section>

                {/* QR Scanner Mock Modal */}
                <AnimatePresence>
                    {isQrOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsQrOpen(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-[3rem] p-10 w-full max-w-sm relative z-10 shadow-2xl text-center"
                            >
                                <button
                                    onClick={() => setIsQrOpen(false)}
                                    className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6 text-slate-300" />
                                </button>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mã Check-in của bạn</h3>
                                        <p className="text-slate-400 font-medium text-sm mt-1 mb-8">Dùng mã này tại Kiosk để nhận số thứ tự</p>
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-[2rem] relative group">
                                        <div className="aspect-square bg-white rounded-2xl flex items-center justify-center p-4 shadow-inner">
                                            {/* Simulated QR Code SVG */}
                                            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                                                <rect x="10" y="10" width="25" height="25" fill="currentColor" />
                                                <rect x="65" y="10" width="25" height="25" fill="currentColor" />
                                                <rect x="10" y="65" width="25" height="25" fill="currentColor" />
                                                <rect x="15" y="15" width="15" height="15" fill="white" />
                                                <rect x="70" y="15" width="15" height="15" fill="white" />
                                                <rect x="15" y="70" width="15" height="15" fill="white" />
                                                <rect x="40" y="10" width="10" height="10" fill="currentColor" />
                                                <rect x="55" y="40" width="15" height="20" fill="currentColor" />
                                                <rect x="40" y="55" width="10" height="35" fill="currentColor" />
                                                <rect x="75" y="65" width="15" height="15" fill="currentColor" />
                                            </svg>
                                        </div>
                                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-slate-900 tracking-tight">BỆNH NHÂN: {dashboard?.patientName?.toUpperCase()}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {dashboard?.patientId?.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}

function FloatingAssistant() {
    const { headers } = useTenant()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: 'Chào bạn! Tôi là Trợ lý AI của phòng khám. Tôi có thể giúp bạn kiểm tra lịch khám, xem chỉ số sức khỏe hoặc giải đáp thắc mắc về đơn thuốc. Bạn cần tôi giúp gì không?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>(['Kiểm tra lịch khám', 'Xem chỉ số sức khỏe', 'Hướng dẫn dùng thuốc'])

    const handleSend = async (text: string = input) => {
        if (!text.trim() || loading) return

        const newMsg = { role: 'user' as const, content: text }
        setMessages(prev => [...prev, newMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await getAiChat({ message: text, history: messages }, headers)
            setMessages(prev => [...prev, { role: 'assistant', content: res.response }])
            if (res.suggestions) setSuggestions(res.suggestions)
        } catch (error) {
            toast.error('Không thể kết nối với Trợ lý AI.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm tracking-tight">Trợ lý AI Thông minh</h4>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang trực tuyến</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700'}`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-50 p-4 rounded-2xl flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input & Suggestions */}
                        <div className="p-6 border-t border-slate-50 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s)}
                                        className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-100 rounded-full text-[10px] font-black text-slate-500 transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Nhập câu hỏi của bạn..."
                                    className="w-full p-4 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-white text-slate-900 border border-slate-100' : 'bg-slate-900 text-white'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : (
                    <div className="relative">
                        <Bot className="w-8 h-8" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                            <Sparkles className="w-2.5 h-2.5 text-white" />
                        </motion.div>
                    </div>
                )}
            </motion.button>
        </div>
    )
}

function MedicationCard({ item }: { item: any }) {
    const [reminderEnabled, setReminderEnabled] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    const handleToggleReminder = () => {
        if (!reminderEnabled) {
            // Check for notification permission
            if ("Notification" in window) {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        setReminderEnabled(true)
                        toast.success(`Đã bật nhắc thuốc: ${item.productName}`)
                    } else {
                        toast.error('Vui lòng cấp quyền thông báo để sử dụng tính năng này.')
                    }
                })
            }
        } else {
            setReminderEnabled(false)
            toast('Đã tắt nhắc thuốc.')
        }
    }

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Pill className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 text-sm leading-tight">{item.productName}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số lượng: {item.quantity}</p>
                    </div>
                </div>
                <button
                    onClick={handleToggleReminder}
                    className={`p-2 rounded-lg transition-all ${reminderEnabled ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-300 hover:text-blue-600'}`}
                    title={reminderEnabled ? "Tắt nhắc thuốc" : "Bật nhắc thuốc"}
                >
                    <BellRing className={`w-4 h-4 ${reminderEnabled ? 'animate-bounce' : ''}`} />
                </button>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hướng dẫn dùng</p>
                </div>
                <p className="text-xs font-bold text-slate-600 leading-relaxed italic line-clamp-2">
                    {item.dosageInstruction}
                </p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                            <Clock className="w-2.5 h-2.5 text-blue-600" />
                        </div>
                    ))}
                </div>
                {reminderEnabled && (
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter animate-pulse">
                        Sẽ nhắc qua thông báo
                    </span>
                )}
            </div>

            {/* Background Decoration */}
            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:scale-125 transition-transform">
                <Pill className="w-20 h-20" />
            </div>
        </motion.div>
    )
}

function HealthCard({ vital, history }: { vital: any, history: any[] }) {
    const isCritical = useMemo(() => {
        const val = vital.valueNumeric;
        const type = vital.vitalType.toLowerCase();
        if (type.includes('nhịp tim') || type.includes('heart')) return val > 100 || val < 60;
        if (type.includes('nhiệt độ') || type.includes('temp')) return val > 38 || val < 36;
        if (type.includes('spo2')) return val < 94;
        if (type.includes('huyết áp') || type.includes('bp')) return val > 140 || val < 90;
        return false;
    }, [vital]);

    const advice = useMemo(() => {
        const type = vital.vitalType.toLowerCase();
        if (isCritical) {
            if (type.includes('nhịp tim')) return 'Nhịp tim không bình thường. Vui lòng nghỉ ngơi.';
            if (type.includes('nhiệt độ')) return 'Bạn đang sốt. Hãy uống nhiều nước và theo dõi.';
            if (type.includes('spo2')) return 'Nồng độ Oxy thấp. Cần hỗ trợ y tế ngay.';
            return 'Chỉ số vượt ngưỡng an toàn. Hãy liên hệ bác sĩ.';
        }
        return 'Chỉ số của bạn đang ở mức ổn định.';
    }, [isCritical, vital]);

    const chartData = useMemo(() => {
        return history.slice(-7).map(h => ({
            value: h.valueNumeric,
            time: new Date(h.recordedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        }));
    }, [history]);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden bg-white rounded-[2.5rem] p-6 border transition-all ${isCritical ? 'border-rose-100 shadow-xl shadow-rose-50' : 'border-slate-100 hover:shadow-xl hover:shadow-slate-100'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vital.vitalType}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className={`text-3xl font-black ${isCritical ? 'text-rose-600' : 'text-slate-900'}`}>{vital.valueNumeric}</span>
                        <span className="text-[10px] font-bold text-slate-400">{vital.unit}</span>
                    </div>
                </div>
                <div className={`p-2 rounded-xl ${isCritical ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                    <Activity className="w-5 h-5" />
                </div>
            </div>

            {/* Sparkline Chart */}
            <div className="h-16 w-full -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`color-${vital.vitalType}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isCritical ? "#f43f5e" : "#3b82f6"} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={isCritical ? "#f43f5e" : "#3b82f6"} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={isCritical ? "#f43f5e" : "#3b82f6"}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#color-${vital.vitalType})`}
                            dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50">
                <p className={`text-[10px] font-bold leading-tight ${isCritical ? 'text-rose-500' : 'text-slate-400'}`}>
                    {advice}
                </p>
            </div>

            {isCritical && (
                <div className="absolute top-0 right-0">
                    <div className="bg-rose-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">Cảnh báo</div>
                </div>
            )}
        </motion.div>
    )
}
