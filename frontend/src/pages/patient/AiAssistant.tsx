import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Sparkles,
    Send,
    Bot,
    User,
    Loader2,
    BrainCircuit,
    History as HistoryIcon,
    MessageSquare,
    Activity,
    Stethoscope,
    AlertCircle
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { getAiAssistantResponse } from '@/api/aiChat'
import type { AiChatMessage } from '@/api/aiChat'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'

export default function AiAssistant() {
    const { headers } = useTenant()
    const { user } = useAuth()
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<AiChatMessage[]>([
        {
            role: 'assistant',
            content: `Xin chào ${user?.fullNameVi || 'bạn'}! Tôi là PatientFlow AI Assistant. Tôi có quyền truy cập vào hồ sơ y tế của bạn và có thể hỗ trợ các thông tin về sức khỏe, lịch hẹn hoặc giải thích đơn thuốc. Tôi có thể giúp gì cho bạn hôm nay?`
        }
    ])
    const [suggestions, setSuggestions] = useState<string[]>([
        "Tóm tắt sức khỏe của tôi",
        "Tôi có lịch hẹn nào sắp tới không?",
        "Giải thích đơn thuốc mới nhất",
        "Tôi bị đau đầu, nên làm gì?"
    ])

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const chatMutation = useMutation({
        mutationFn: (text: string) => {
            const history = messages.slice(-10) // Send last 10 messages for context
            return getAiAssistantResponse({ message: text, history }, headers)
        },
        onSuccess: (data) => {
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
            if (data.suggestions && data.suggestions.length > 0) {
                setSuggestions(data.suggestions)
            }
        },
        onError: () => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Rất tiếc, hệ thống AI đang gặp sự cố kết nối. Vui lòng thử lại sau giây lát."
            }])
        }
    })

    const handleSend = (text: string) => {
        if (!text.trim() || chatMutation.isPending) return

        setMessages(prev => [...prev, { role: 'user', content: text }])
        setInput('')
        chatMutation.mutate(text)
    }

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                        <BrainCircuit className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Trợ lý AI Hỗ trợ
                            <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-blue-100">Pro</span>
                        </h1>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Đang trực tuyến • Sẵn sàng hỗ trợ 24/7
                        </p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <div className="bg-white border border-slate-100 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest underline decoration-dotted">Dữ liệu cá nhân hóa</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                {/* Main Chat Area */}
                <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/20 flex flex-col overflow-hidden relative">
                    {/* Glassmorphism Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -ml-32 -mb-32 pointer-events-none" />

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar scroll-smooth"
                    >
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${msg.role === 'user' ? 'bg-slate-900 border border-slate-700' : 'bg-blue-600 text-white'
                                        }`}>
                                        {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5" />}
                                    </div>
                                    <div className={`space-y-2`}>
                                        <div className={`p-5 md:p-6 rounded-[2.5rem] text-sm md:text-base leading-relaxed ${msg.role === 'user'
                                            ? 'bg-slate-900 text-white rounded-tr-none font-medium'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                                            }`}>
                                            {msg.content}
                                        </div>
                                        <div className={`flex items-center gap-2 text-[10px] font-bold text-slate-300 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                            {msg.role === 'assistant' ? 'PatientFlow AI' : 'Bệnh nhân'} • Vừa xong
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {chatMutation.isPending && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                </div>
                                <div className="p-5 bg-white border border-slate-100 rounded-[2rem] rounded-tl-none shadow-sm">
                                    <div className="flex gap-1.5 h-2 items-center px-2">
                                        <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Suggestions Area */}
                    <div className="px-6 md:px-10 pb-4 overflow-x-auto flex gap-3 no-scrollbar shrink-0">
                        {suggestions.map((s, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSend(s)}
                                className="px-5 py-2.5 bg-blue-50/50 hover:bg-blue-600 hover:text-white text-blue-600 text-[11px] font-black uppercase tracking-wider rounded-full border border-blue-100 transition-all whitespace-nowrap"
                            >
                                {s}
                            </motion.button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 md:p-8 bg-white border-t border-slate-50 relative z-10 shrink-0">
                        <div className="flex items-center gap-4 bg-slate-50 rounded-[2.5rem] p-3 pl-8 focus-within:bg-white focus-within:ring-8 focus-within:ring-blue-500/5 focus-within:border-blue-500 border border-transparent transition-all shadow-inner">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                                placeholder="Hỏi tôi về triệu chứng, đơn thuốc hoặc lịch hẹn..."
                                className="flex-1 bg-transparent py-4 text-sm md:text-base font-bold outline-none text-slate-700 placeholder:text-slate-300"
                            />
                            <button
                                onClick={() => handleSend(input)}
                                disabled={!input.trim() || chatMutation.isPending}
                                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-300 active:scale-90 transition-all disabled:opacity-50"
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="mt-4 text-center text-[10px] font-bold text-slate-400 flex items-center justify-center gap-2 uppercase tracking-[0.2em]">
                            <Sparkles className="w-3 h-3 text-blue-400" />
                            Dịch vụ AI chỉ mang tính chất tham khảo
                        </p>
                    </div>
                </div>

                {/* Sidebar: Information/Stats */}
                <aside className="w-[320px] hidden lg:flex flex-col gap-6 shrink-0 h-full overflow-y-auto no-scrollbar">
                    {/* Patient Context Summary Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                            <BrainCircuit className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Insights</span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight leading-tight">Hỗ trợ dựa trên dữ liệu của bạn</h3>
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-4 group/item">
                                    <div className="w-1 h-1 rounded-full bg-blue-500 group-hover/item:scale-[4] transition-transform" />
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tiền sử bệnh</p>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="w-1 h-1 rounded-full bg-blue-500 group-hover/item:scale-[4] transition-transform" />
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đơn thuốc hiện tại</p>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="w-1 h-1 rounded-full bg-blue-500 group-hover/item:scale-[4] transition-transform" />
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chỉ số sinh hiệu (Vitals)</p>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="w-1 h-1 rounded-full bg-blue-500 group-hover/item:scale-[4] transition-transform" />
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kết quả xét nghiệm</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 flex flex-col">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Công cụ nhanh</h4>
                            <HistoryIcon className="w-4 h-4 text-slate-200" />
                        </div>

                        <div className="space-y-3 flex-1">
                            <button className="w-full text-left p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-500 hover:bg-white transition-all group">
                                <Stethoscope className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-black text-slate-900 mb-1">Kiểm tra triệu chứng</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lập tức phân loại</p>
                            </button>

                            <button className="w-full text-left p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-500 hover:bg-white transition-all group">
                                <MessageSquare className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-black text-slate-900 mb-1">Ý kiến bác sĩ</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gửi yêu cầu bác sĩ</p>
                            </button>
                        </div>

                        {/* Emergency Note */}
                        <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                            <div className="flex items-center gap-3 mb-2 text-rose-600">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Khẩn cấp</span>
                            </div>
                            <p className="text-[10px] font-bold text-rose-500 leading-relaxed uppercase tracking-tight">
                                Nếu bạn có các triệu chứng đe dọa tính mạng, vui lòng gọi cấp cứu trực tiếp tại quầy hoặc hotline.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
