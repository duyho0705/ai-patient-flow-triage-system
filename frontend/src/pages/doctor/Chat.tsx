import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    Send,
    Search,
    Video,
    MoreVertical,
    Loader2,
    Paperclip,
    Image as ImageIcon,
    FileText,
    History as HistoryIcon,
    TrendingUp,
    Activity,
    Pill,
    ArrowLeft,
    AlertTriangle,
    ChevronRight,
    Sparkles
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getDoctorChatConversations } from '@/api/doctorChat'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { useFirebaseChat } from '@/hooks/useFirebaseChat'
import toast from 'react-hot-toast'
import type { PatientChatConversationDto, PatientChatMessageDto } from '@/types/api'
import VideoCall from '@/components/VideoCall'
import { Link } from 'react-router-dom'

interface ExtendedConversation extends PatientChatConversationDto {
    risk?: 'HIGH' | 'WARNING' | 'NORMAL';
    avatarUrl?: string;
    isOnline?: boolean;
    unreadCount?: number;
}

const mockConversations: ExtendedConversation[] = [
    {
        id: 'conv-001',
        patientId: 'pat-001',
        patientName: 'Nguyễn Văn A',
        lastMessage: 'Bác sĩ ơi, chỉ số huyết áp...',
        lastMessageAt: new Date().toISOString(),
        status: 'ACTIVE',
        risk: 'HIGH',
        unreadCount: 2,
        isOnline: true,
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoRl8NTd68SRL_B98uIoSixtoSFJ_WzA_ARggqrddikGEZU5TvmSR2m3O5T1qeyIddTDbGEQsvKPHA9OaIHqdKNbaEb5u1y6Z7lJWYLA551IOrhSYBeCp6TvkUP0oZmg2-z7exCQilm2RhKk0JK8sQVbBkzugjOEBNCgSHCs-VPqtPnPKKBpqqAOzq715qm4QoA0LGmVrHKy2xEvxEK6dE-Oul3-ud2Yg-oRnIg92B1uE_UK7HuaIQHwfRC0N3gSrAxqZqnfedqwU'
    },
    {
        id: 'conv-002',
        patientId: 'pat-002',
        patientName: 'Trần Thị B',
        lastMessage: 'Vâng, tôi đã nhận được đơn thuốc.',
        lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'ACTIVE',
        risk: 'NORMAL',
        isOnline: false,
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBhD6WWkEmCMteDAhlg1khjJmteYcqGR_yWPtw7M8cvkR3Pz1-1ppF9o5AMWC6HaT2f-5pYOc8QcYtyOYqIwns5BwN129P-TJ0KCcF__-O9EC29r_C_OwDHLBNK4gPhThgBbxZTnZh6_65fKk1BuXOPABOf5XFyVqBB3elRY41Rw1LVHLJb67lK83eFMaCHBlpb8wxLmEDLfeNEowQbIJP7cHp5YfLb_9os0KnEGIqfCwFAk7CcH4yVH_nP5tWbnE2ExIYImKwspU'
    },
    {
        id: 'conv-003',
        patientId: 'pat-003',
        patientName: 'Lê Văn C',
        lastMessage: 'Cảm ơn bác sĩ nhiều lắm!',
        lastMessageAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'ACTIVE',
        risk: 'NORMAL',
        isOnline: true,
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc-MU_mpYw71RWBRumDqWQSpX2jT6lqY_yymf4_8OwEvcAeGZzV7l3yAxJ5MF7jROH6_6fdNdNvtucQdPatsAfzP-B49W4vIFviX6tGN97yhtJTuP3BrvS6YgON1wqQxZEmplohMDKvuNYebXLrTKsq0q12FH8pdkhC93H4v8cZNbJLFkBV_JVSSRhTFssTOzM27hXOpef5uBaFNc9JV_YDbeJBtL4rMTTD0AGoZ3LRXHFIL1qr8Avgse8OBgMCCLHYBPdo6QmmNo'
    }
]

const mockChatHistory: PatientChatMessageDto[] = [
    {
        id: 'msg-001',
        senderType: 'PATIENT',
        content: 'Bác sĩ ơi, chỉ số huyết áp của tôi sáng nay đo là 160/95 mmHg. Tôi cảm thấy hơi chóng mặt, có cần điều chỉnh thuốc không ạ?',
        sentAt: new Date(Date.now() - 180000).toISOString()
    },
    {
        id: 'msg-002',
        senderType: 'DOCTOR',
        content: 'Chào anh A, chỉ số 160/95 là khá cao. Anh hãy nghỉ ngơi tại chỗ trong 15-20 phút, tránh vận động mạnh và đo lại nhé.',
        sentAt: new Date(Date.now() - 120000).toISOString()
    },
    {
        id: 'msg-003',
        senderType: 'PATIENT',
        content: 'Vâng, tôi đang nằm nghỉ rồi ạ. Tôi có nên uống thêm liều thuốc hạ áp dự phòng không?',
        sentAt: new Date(Date.now() - 60000).toISOString()
    }
]


export default function DoctorChat() {
    const { headers } = useTenant()
    // 1. Fetch Conversations
    const { data: realConversations, isLoading: loadingConvs } = useQuery({
        queryKey: ['doctor-chat-conversations'],
        queryFn: () => getDoctorChatConversations(headers),
        enabled: !!headers?.tenantId,
        refetchInterval: 10000
    })

    const conversations: ExtendedConversation[] = realConversations?.length ? (realConversations as ExtendedConversation[]) : mockConversations

    const { user } = useAuth()
    const doctorId = user?.id || 'd-01' // Fallback to map with mock patient chat ui

    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(conversations[0]?.patientId || null)
    const [message, setMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
    const [isSending, setIsSending] = useState(false)

    // 2. Fetch Chat History (Realtime)
    const { messages: firebaseHistory, loading: loadingHistory, sendMessage } = useFirebaseChat(
        headers?.tenantId,
        selectedPatientId,
        doctorId
    )

    const chatHistory = firebaseHistory?.length ? firebaseHistory : (selectedPatientId === 'pat-001' ? mockChatHistory : [])

    const handleSend = async () => {
        if (!message.trim() || isSending || !selectedPatientId || !doctorId) return

        setIsSending(true)
        try {
            await sendMessage(message, doctorId, 'DOCTOR')
            setMessage('')
        } catch (error) {
            toast.error('Không thể gửi tin nhắn.')
        } finally {
            setIsSending(false)
        }
    }

    const filteredConversations = conversations?.filter(c =>
        c.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedConv = conversations?.find(c => c.patientId === selectedPatientId)

    // Mock data for UI aesthetics (as requested "thiết kế i chang")
    const mockVitals: any[] = []
    const mockMeds: any[] = []
    console.log(mockVitals, mockMeds) // Keep to avoid unused variable warning if needed, or just remove


    const quickResponses = [
        { label: 'Gửi khuyến nghị', icon: Activity, color: 'bg-primary/10 text-primary' },
        { label: 'Gửi cảnh báo', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
        { label: 'Đơn thuốc mới', icon: Pill, color: 'bg-blue-100 text-blue-600' },
    ]

    if (loadingConvs) {
        return (
            <div className="h-[calc(100vh-120px)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Đang tải trung tâm tin nhắn...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden font-display bg-white dark:bg-slate-900">
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1e5d9; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>

            {/* Left Column: Contact List */}
            <aside className={`w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900/50 shrink-0 ${selectedPatientId ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bệnh nhân..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="flex border-b border-slate-200 dark:border-slate-800">
                    <button className="flex-1 py-3 text-sm font-bold text-primary border-b-2 border-primary">Tất cả</button>
                    <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Chưa đọc</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-2 space-y-1">
                        {filteredConversations?.map((conv) => {
                            const isSelected = selectedPatientId === conv.patientId;
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedPatientId(conv.patientId)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected
                                        ? 'bg-primary/10 border border-primary/20'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <div className="size-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm bg-slate-100">
                                            {conv.avatarUrl ? (
                                                <img src={conv.avatarUrl} alt={conv.patientName} className="size-full object-cover" />
                                            ) : (
                                                <div className="size-full flex items-center justify-center font-black text-xs text-slate-400">
                                                    {conv.patientName.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`absolute bottom-0 right-0 size-3 border-2 border-white dark:border-slate-900 rounded-full ${conv.isOnline !== false ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{conv.patientName}</h3>
                                            <span className="text-[10px] text-slate-400">10:45</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate opacity-80">{conv.lastMessage || 'Bắt đầu trò chuyện'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-black uppercase tracking-wider ${conv.risk === 'HIGH' ? 'bg-red-100 text-red-600' : conv.risk === 'WARNING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                {conv.risk === 'HIGH' ? 'Nguy cơ cao' : conv.risk === 'WARNING' ? 'Theo dõi' : 'Bình thường'}
                                            </span>
                                        </div>
                                    </div>
                                    {conv.unreadCount ? (
                                        <div className="size-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-slate-900 font-black shadow-sm shadow-primary/20">{conv.unreadCount}</div>
                                    ) : isSelected && (
                                        <div className="size-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-slate-900 font-black shadow-sm shadow-primary/20">2</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* Middle Column: Chat Window */}
            <main className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/20 overflow-hidden relative">
                {selectedPatientId ? (
                    <>
                        {/* Chat Header */}
                        <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0 z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedPatientId(null)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-all">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="size-10 rounded-full bg-slate-100 overflow-hidden border-2 border-primary/20 shadow-sm relative">
                                    {selectedConv?.avatarUrl ? (
                                        <img className="w-full h-full object-cover" src={selectedConv.avatarUrl} alt={selectedConv.patientName} />
                                    ) : (
                                        <div className="size-full flex items-center justify-center font-black text-xs text-slate-400 bg-slate-50">
                                            {selectedConv?.patientName.charAt(0)}
                                        </div>
                                    )}
                                    <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold leading-none text-slate-900 dark:text-white uppercase tracking-tight">{selectedConv?.patientName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Đang trực tuyến</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsVideoCallOpen(true)} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group active:scale-95">
                                    <Video className="w-5 h-5 group-hover:text-primary" />
                                </button>
                                <button className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group">
                                    <MoreVertical className="w-5 h-5 group-hover:text-primary" />
                                </button>
                            </div>
                        </header>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
                            <div className="flex justify-center">
                                <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-full text-slate-500 font-black uppercase tracking-[0.2em]">Hôm nay, 24 Tháng 5</span>
                            </div>

                            <AnimatePresence>
                                {loadingHistory ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    </div>
                                ) : chatHistory?.map((m, i) => {
                                    const isSelf = m.senderType === 'DOCTOR';
                                    const isSystem = m.senderType === 'SYSTEM';

                                    if (isSystem) {
                                        return (
                                            <div key={i} className="flex justify-center">
                                                <span className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 px-4 py-1.5 rounded-xl flex items-center gap-2 text-[10px] text-red-700 dark:text-red-400 font-black uppercase tracking-wider">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    {m.content}
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 max-w-[85%] ${isSelf ? 'flex-row-reverse ml-auto' : ''}`}
                                        >
                                            {!isSelf && (
                                                <div className="size-8 rounded-full overflow-hidden self-end mb-4 border border-slate-200 shadow-sm bg-slate-100">
                                                    {selectedConv?.avatarUrl ? (
                                                        <img src={selectedConv.avatarUrl} alt="" className="size-full object-cover" />
                                                    ) : (
                                                        <div className="size-full flex items-center justify-center font-black text-[10px] text-slate-400">{selectedConv?.patientName.charAt(0)}</div>
                                                    )}
                                                </div>
                                            )}
                                            <div className={`space-y-1 ${isSelf ? 'items-end' : 'items-start'}`}>
                                                <div className={`p-4 rounded-2xl shadow-sm border ${isSelf
                                                    ? 'bg-primary text-slate-900 rounded-br-none border-primary shadow-lg shadow-primary/20'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border-slate-100 dark:border-slate-700'
                                                    }`}>
                                                    <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                                                    <span className={`text-[9px] mt-1.5 block font-bold uppercase tracking-tight opacity-70 ${isSelf ? 'text-right' : ''}`}>
                                                        {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Message Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar whitespace-nowrap">
                                {quickResponses.map((qr, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setMessage(qr.label)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-sm ${qr.color}`}
                                    >
                                        <qr.icon className="w-4 h-4" />
                                        {qr.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-end gap-3">
                                <div className="flex gap-1 mb-2 shrink-0">
                                    <button className="p-2.5 text-slate-400 hover:text-primary transition-all rounded-xl hover:bg-slate-50">
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                    <button className="p-2.5 text-slate-400 hover:text-primary transition-all rounded-xl hover:bg-slate-50">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 flex items-end shadow-inner">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold resize-none py-2 px-3 placeholder:text-slate-400 min-h-[44px] max-h-32 custom-scrollbar"
                                        placeholder="Nhập tin nhắn tư vấn..."
                                        rows={1}
                                    />
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim() || isSending}
                                    className="bg-primary hover:bg-primary/90 text-slate-900 p-3.5 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-110 active:scale-95 disabled:opacity-30 flex items-center justify-center shrink-0"
                                >
                                    {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
                        <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center shadow-inner animate-pulse">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Trung tâm Tư vấn Thông minh</h3>
                            <p className="text-sm font-bold text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">Chọn một bệnh nhân từ danh sách bên trái để bắt đầu hỗ trợ điều trị 24/7.</p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <span className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border border-slate-100 dark:border-slate-700">Mã hóa đầu cuối</span>
                            <span className="px-5 py-2.5 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.1em] border border-primary/20">Thời gian thực</span>
                        </div>
                    </div>
                )}
            </main>

            {/* Right Column: Patient Summary */}
            {selectedPatientId && (
                <aside className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col p-5 overflow-y-auto custom-scrollbar hidden xl:flex shrink-0">
                    <div className="text-center mb-10">
                        <div className="size-20 mx-auto rounded-full border-4 border-primary/20 p-1 mb-3 ring-4 ring-primary/5 shadow-2xl">
                            {selectedConv?.avatarUrl ? (
                                <img
                                    src={selectedConv.avatarUrl}
                                    alt="Large Profile"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="size-full flex items-center justify-center bg-slate-100 rounded-full font-black text-2xl text-slate-400">
                                    {selectedConv?.patientName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight">{selectedConv?.patientName}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Nam • 58 tuổi</p>
                    </div>

                    <div className="space-y-8">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">CHỈ SỐ SINH TỒN</h4>
                                <span className="text-[10px] text-primary font-bold uppercase">
                                    Cập nhật 1h trước
                                </span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Huyết áp</span>
                                    </div>
                                    <span className="text-sm font-black text-red-500">160/95</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Nhịp tim</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">82 bpm</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                                            <Pill className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Đường huyết</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">6.8 mmol/L</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lối tắt hành động</h4>
                            <Link to={`/patients/${selectedPatientId}/ehr`} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">Hồ sơ đầy đủ</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link to="/staff/prescriptions" className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Pill className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">Kê đơn thuốc</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                                <div className="flex items-center gap-3">
                                    <HistoryIcon className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">Lịch sử khám</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                            </button>
                        </div>

                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform duration-500">
                                <Sparkles className="w-12 h-12 text-primary" />
                            </div>
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <h5 className="text-[10px] font-black text-primary uppercase tracking-widest">Ghi chú AI</h5>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 italic font-medium leading-relaxed relative z-10">"Bệnh nhân có tiền sử cao huyết áp mãn tính, cần theo dõi sát sao vào buổi sáng."</p>
                        </div>
                    </div>
                </aside>
            )}

            {isVideoCallOpen && (
                <VideoCall
                    roomID="telehealth-room"
                    userID={`doctor-${Math.floor(Math.random() * 10000)}`}
                    userName="Bác sĩ"
                    onClose={() => setIsVideoCallOpen(false)}
                />
            )}
        </div>
    );
}
