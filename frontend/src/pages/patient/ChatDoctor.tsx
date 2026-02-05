import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, User, Bot, Search, Video, Phone, MoreVertical, Paperclip, Smile, ShieldCheck, Clock, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPortalChatDoctors, getPortalChatHistory, sendPortalChatMessage } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import toast from 'react-hot-toast'

export default function PatientChatDoctor() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
    const [message, setMessage] = useState('')

    // Fetch available doctors
    const { data: doctors, isLoading: loadingDoctors } = useQuery({
        queryKey: ['portal-chat-doctors'],
        queryFn: () => getPortalChatDoctors(headers),
        enabled: !!headers?.tenantId
    })

    // Auto-select first doctor
    useEffect(() => {
        if (doctors && doctors.length > 0 && !selectedDoctor) {
            setSelectedDoctor(doctors[0])
        }
    }, [doctors])

    // Fetch chat history for selected doctor
    const { data: chatHistory, isLoading: loadingHistory } = useQuery({
        queryKey: ['portal-chat-history', selectedDoctor?.id],
        queryFn: () => getPortalChatHistory(selectedDoctor.id, headers),
        enabled: !!selectedDoctor && !!headers?.tenantId,
        refetchInterval: 3000 // Poll every 3 seconds for new messages
    })

    const sendMutation = useMutation({
        mutationFn: (content: string) => sendPortalChatMessage(selectedDoctor.id, content, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-chat-history', selectedDoctor?.id] })
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

    if (loadingDoctors) return <div className="p-20 text-center font-black text-slate-400">Đang tìm bác sĩ trực tuyến...</div>

    return (
        <div className="max-w-[1400px] mx-auto h-[calc(100vh-180px)] flex gap-4 md:gap-8 pb-10 flex-col md:flex-row">
            {/* Sidebar: Doctor List */}
            <aside className={`w-full md:w-[350px] bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col overflow-hidden ${selectedDoctor ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 border-b border-slate-50 space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bác sĩ tư vấn</h2>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm bác sĩ, chuyên khoa..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 border border-transparent focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {doctors?.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => setSelectedDoctor(doc)}
                            className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all ${selectedDoctor?.id === doc.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'hover:bg-slate-50'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black relative ${selectedDoctor?.id === doc.id ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                                {doc.avatar}
                                {doc.online && (
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                                )}
                            </div>
                            <div className="text-left">
                                <p className={`text-sm font-black ${selectedDoctor?.id === doc.id ? 'text-white' : 'text-slate-900'}`}>{doc.name}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedDoctor?.id === doc.id ? 'text-blue-100/60' : 'text-slate-400'}`}>{doc.specialty}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-6 bg-slate-900 text-white hidden md:block">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security</p>
                            <p className="text-xs font-bold">Mã hóa đầu cuối</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Chat Area */}
            {selectedDoctor ? (
                <main className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col overflow-hidden relative">
                    {/* Chat Header */}
                    <header className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedDoctor(null)} className="md:hidden p-2 bg-slate-50 rounded-xl">
                                <Search className="w-5 h-5 rotate-90" />
                            </button>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                                {selectedDoctor.avatar}
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900">{selectedDoctor.name}</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedDoctor.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {selectedDoctor.online ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-blue-600">
                                <Phone className="w-5 h-5" />
                            </button>
                            <button className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-blue-600">
                                <Video className="w-5 h-5" />
                            </button>
                        </div>
                    </header>

                    {/* Messages Panel */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 flex flex-col">
                        {loadingHistory ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : chatHistory && chatHistory.length > 0 ? (
                            chatHistory.map((m: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${m.senderType === 'PATIENT' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] space-y-1 flex flex-col ${m.senderType === 'PATIENT' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-5 rounded-[2rem] text-sm font-bold shadow-sm ${m.senderType === 'PATIENT'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                            }`}>
                                            {m.content}
                                        </div>
                                        <div className="flex items-center gap-2 px-2">
                                            <Clock className="w-2.5 h-2.5 text-slate-300" />
                                            <span className="text-[9px] font-bold text-slate-400 italic">
                                                {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-40">
                                <MessageSquare className="w-16 h-16 mb-4 text-slate-200" />
                                <p className="text-sm font-bold text-slate-500">Bắt đầu cuộc trò chuyện với bác sĩ của bạn.</p>
                            </div>
                        )}
                    </div>

                    {/* Message Input Interface */}
                    <footer className="p-6 bg-white border-t border-slate-50">
                        <div className="flex items-center gap-4 bg-slate-50 rounded-3xl p-2 pl-6 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white focus-within:border-blue-500 border border-transparent transition-all">
                            <button className="text-slate-400 hover:text-blue-600 transition-colors">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Nhập nội dung tư vấn..."
                                className="flex-1 bg-transparent py-4 text-xs font-bold outline-none text-slate-700 font-sans"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!message.trim() || sendMutation.isPending}
                                className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </footer>
                </main>
            ) : (
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center p-12 space-y-4">
                    <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center">
                        <MessageSquare className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Chọn bác sĩ để bắt đầu</h3>
                        <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto">Vui lòng chọn một bác sĩ từ danh sách bên trái để nhận tư vấn trực tuyến.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
