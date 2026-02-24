import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, Search, Phone, Video, MoreVertical, Loader2, Clock, CheckCircle2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDoctorChatConversations, getDoctorChatHistory, sendDoctorChatMessage } from '@/api/doctorChat'
import { useTenant } from '@/context/TenantContext'
import toast from 'react-hot-toast'

export default function DoctorChat() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
    const [message, setMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    // 1. Fetch Conversations
    const { data: conversations, isLoading: loadingConvs } = useQuery({
        queryKey: ['doctor-chat-conversations'],
        queryFn: () => getDoctorChatConversations(headers),
        enabled: !!headers?.tenantId,
        refetchInterval: 10000 // Poll every 10s
    })

    // 2. Fetch Chat History
    const { data: chatHistory, isLoading: loadingHistory } = useQuery({
        queryKey: ['doctor-chat-history', selectedPatientId],
        queryFn: () => getDoctorChatHistory(selectedPatientId!, headers),
        enabled: !!selectedPatientId && !!headers?.tenantId,
        refetchInterval: 3000 // Poll every 3s
    })

    const sendMutation = useMutation({
        mutationFn: (content: string) => sendDoctorChatMessage(selectedPatientId!, content, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-chat-history', selectedPatientId] })
            setMessage('')
        },
        onError: () => {
            toast.error('Không thể gửi tin nhắn.')
        }
    })

    const handleSend = () => {
        if (!message.trim() || sendMutation.isPending) return
        sendMutation.mutate(message)
    }

    const filteredConversations = conversations?.filter(c =>
        c.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedConv = conversations?.find(c => c.patientId === selectedPatientId)

    if (loadingConvs) return <div className="p-20 text-center font-black text-slate-400">Đang tải danh sách hội thoại...</div>

    return (
        <div className="max-w-[1400px] mx-auto h-[calc(100vh-180px)] flex gap-6 pb-10 flex-col md:flex-row">
            {/* Sidebar: Patient List */}
            <aside className={`w-full md:w-[380px] bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col overflow-hidden ${selectedPatientId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 border-b border-slate-50 space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tightest">Tin nhắn</h2>
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm bệnh nhân..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 border border-transparent focus:border-blue-500 transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    {filteredConversations?.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedPatientId(conv.patientId)}
                            className={`w-full p-5 rounded-[2.5rem] flex items-center gap-5 transition-all relative group ${selectedPatientId === conv.patientId ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200' : 'hover:bg-slate-50'}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-all ${selectedPatientId === conv.patientId ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                                {conv.patientName.charAt(0)}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className={`text-base font-black truncate ${selectedPatientId === conv.patientId ? 'text-white' : 'text-slate-900'}`}>{conv.patientName}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${selectedPatientId === conv.patientId ? 'text-blue-100/60' : 'text-slate-400'}`}>
                                    {conv.lastMessage || 'Bắt đầu trò chuyện'}
                                </p>
                            </div>
                            {conv.status === 'ACTIVE' && (
                                <div className={`w-2.5 h-2.5 rounded-full ${selectedPatientId === conv.patientId ? 'bg-white' : 'bg-emerald-500'} animate-pulse`} />
                            )}
                        </button>
                    ))}
                    {filteredConversations?.length === 0 && (
                        <div className="p-10 text-center text-slate-400 font-bold italic">Không có cuộc trò chuyện nào.</div>
                    )}
                </div>
            </aside>

            {/* Chat Area */}
            {selectedPatientId ? (
                <main className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/20 flex flex-col overflow-hidden relative">
                    {/* Chat Header */}
                    <header className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-5">
                            <button onClick={() => setSelectedPatientId(null)} className="md:hidden p-3 bg-slate-50 rounded-2xl">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center font-black text-2xl shadow-inner">
                                {selectedConv?.patientName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedConv?.patientName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bệnh nhân đang trực tuyến</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-blue-600">
                                <Phone className="w-5 h-5" />
                            </button>
                            <button className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-blue-600">
                                <Video className="w-5 h-5" />
                            </button>
                            <button className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </header>

                    {/* Messages Panel */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20 flex flex-col no-scrollbar">
                        {loadingHistory ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            </div>
                        ) : chatHistory && chatHistory.length > 0 ? (
                            chatHistory.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${m.senderType === 'DOCTOR' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[65%] space-y-2 flex flex-col ${m.senderType === 'DOCTOR' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-6 rounded-[2.5rem] text-sm font-bold shadow-sm leading-relaxed ${m.senderType === 'DOCTOR'
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200'
                                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                            }`}>
                                            {m.content}
                                        </div>
                                        <div className="flex items-center gap-2 px-3">
                                            <Clock className="w-3 h-3 text-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-400 italic">
                                                {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {m.senderType === 'DOCTOR' && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30">
                                <MessageSquare className="w-20 h-20 mb-6 text-slate-200" />
                                <h4 className="text-xl font-black text-slate-500 uppercase tracking-widest">Chưa có tin nhắn</h4>
                                <p className="text-sm font-bold text-slate-400 mt-2 max-w-xs">Hãy gửi tin nhắn đầu tiên để bắt đầu tư vấn cho bệnh nhân.</p>
                            </div>
                        )}
                    </div>

                    {/* Message Input Interface */}
                    <footer className="p-8 bg-white border-t border-slate-50">
                        <div className="flex items-center gap-5 bg-slate-50 rounded-[2.5rem] p-2.5 pl-8 focus-within:ring-8 focus-within:ring-blue-500/5 focus-within:bg-white focus-within:border-blue-500 border border-transparent transition-all shadow-inner">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Viết phản hồi hoặc tư vấn..."
                                className="flex-1 bg-transparent py-5 text-sm font-bold outline-none text-slate-700 font-sans placeholder:text-slate-300"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!message.trim() || sendMutation.isPending}
                                className="w-16 h-16 bg-blue-600 text-white rounded-[1.8rem] flex items-center justify-center shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                            >
                                {sendMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                            </button>
                        </div>
                    </footer>
                </main>
            ) : (
                <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center p-20 space-y-6">
                    <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-[3rem] flex items-center justify-center shadow-inner">
                        <MessageSquare className="w-14 h-14" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Trung tâm Tư vấn Trực tuyến</h3>
                        <p className="text-base font-bold text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">Chọn một bệnh nhân từ danh sách bên trái để xem yêu cầu tư vấn và trò chuyện trực tiếp.</p>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <div className="px-6 py-3 bg-slate-50 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                            Mã hóa đầu cuối
                        </div>
                        <div className="px-6 py-3 bg-emerald-50 rounded-full text-xs font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                            Realtime
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ArrowLeft({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    )
}
