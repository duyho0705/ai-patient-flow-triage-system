import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    Send,
    Search,
    Video,
    MoreVertical,
    Loader2,
    CheckCircle2,
    Paperclip,
    Image as ImageIcon,
    Smile,
    PlusSquare,
    FileText,
    History,
    TrendingUp,
    Activity,
    Pill,
    ArrowLeft,
    AlertTriangle,
    Download as DownloadIcon,
    FileIcon
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDoctorChatConversations, getDoctorChatHistory, sendDoctorChatMessage } from '@/api/doctorChat'
import { useTenant } from '@/context/TenantContext'
import toast from 'react-hot-toast'
import type { PatientChatConversationDto, PatientChatMessageDto } from '@/types/api'
import VideoCall from '@/components/VideoCall'

interface ExtendedConversation extends PatientChatConversationDto {
    risk?: 'HIGH' | 'WARNING' | 'NORMAL';
    avatarUrl?: string;
}

const mockConversations: ExtendedConversation[] = [
    {
        id: 'conv-001',
        patientId: 'pat-001',
        patientName: 'Lê Văn Hùng',
        lastMessage: 'Chỉ số đường huyết sáng nay là 12.5...',
        status: 'ACTIVE',
        risk: 'HIGH',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwlApZfkfYPzzyRpMjQsXgktqCAO2nGDdkuNxdL8kbN9kG11vyIjIuUNG_hTj9HsztQwzOgC7CjQ2SxzWzf9XB0xMur-0k_vvh86pr2p_25SzFmnrjZoxTRWVFfIHN__kzGQYnL7pEavSKETPRF4x8RKJd6C_dFQclBAiF0NTHcDQeWg7Gn1Wp0o3e-DYOSohh6DLGJrNXIzPQjwtnFrQzAxQ7vS54x_GKA_GdPXekdkt_LrA_Dd10tbezU8WuwVs4enZBkfx5mwM'
    },
    {
        id: 'conv-002',
        patientId: 'pat-002',
        patientName: 'Trần Thị Bích',
        lastMessage: 'Cảm ơn bác sĩ, tôi sẽ uống thuốc đúng giờ.',
        status: 'ACTIVE',
        risk: 'NORMAL',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE_cXLngDHiXtWP_mhDxc5VxLTAXLU1GnJ1UMJ1sAvqPI5FexnYm6aIXLibW16ZNjlnSqa9jDykyKW1HIEB70U-hUw48NtRCY00AnAiGsfK8SSTjMUiA1NUaLnZFJEipdCBYNlZ1TWkJ-Upu2Jx_wp7eI_EyRiSEMUp3CvDKUnBijSOoxhF39v2rk7eNSJuRZjqIN5PjrJicb18L6DrbwKyFmV7G_mn3iUD2QGq9Rp7VFhZ6E0QbbNrJQQOov4tMWX4AMrglZi9DM'
    },
    {
        id: 'conv-003',
        patientId: 'pat-003',
        patientName: 'Phạm Minh Tuấn',
        lastMessage: 'Huyết áp đo lúc nãy là 145/95...',
        status: 'INACTIVE',
        risk: 'WARNING',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvKWhiac5S_8l9-3q0KVL2I5n6ZdFTIKVk0Xa-nv2IrigZlnHEBRiSjN5ZnISBBZ0DQqXnr6uEokD49vk4gdBSOJBVsVfs9cfkiXMuANV7t5lpr9J-m-quhCPu6Vk3U_mDyNAReMYaMy67USWPxZTne4gIzIQ_gHfZ3QJnCXQiJQIF4hpG8s-2OlWxbpg4obkN53JOma0NP1wdfwHSBrhakDB9FrD3ae56Zb4DTGvD3LTVY1b0f6s7PmVdjDujqValhnfpAtRd0g0'
    },
    {
        id: 'conv-004',
        patientId: 'pat-004',
        patientName: 'Nguyễn Hoàng Oanh',
        lastMessage: 'Bác sĩ cho em hỏi về tác dụng phụ...',
        status: 'ACTIVE',
        risk: 'NORMAL',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4YJ7a0SfDkR1euglM30Iyl1lu76F8Sa2nCcW0D6mu2jJ5xeZieBqlktui3vb5Wi6qrKHVHzbD_nNrxnkOGKRDT0YucBdQ-e3LvB5K_cJ3fqp19QqhgScdLCYyXK8pYFfEpvLkvqcPaYtAV5GcaFdix-5TI76apkCcQfKVTELS7I13wVATMjEyrjzkIaaRDn08L1kZuOPeuDqpRDxe72zX_QIdE3Thx2_5fR1dvymZteUwGzVOC4M_BKOdZ5rhJ_Z8ZuDH1aFI68I'
    }
]

const mockChatHistory: PatientChatMessageDto[] = [
    {
        id: 'msg-001',
        senderType: 'PATIENT',
        content: 'Chào bác sĩ Minh, tôi mới đo đường huyết lúc sáng sau khi ngủ dậy là 12.5 mmol/L. Tôi thấy hơi chóng mặt và mệt mỏi.',
        sentAt: new Date(new Date().setHours(10, 15)).toISOString()
    },
    {
        id: 'msg-002',
        senderType: 'SYSTEM',
        content: 'Cảnh báo: Chỉ số đường huyết vượt ngưỡng an toàn (12.5 > 7.0)',
        sentAt: new Date(new Date().setHours(10, 16)).toISOString()
    },
    {
        id: 'msg-003',
        senderType: 'DOCTOR',
        content: 'Chào ông Hùng, chỉ số này đang ở mức cao. Ông có quên dùng thuốc buổi tối qua không? Hãy uống ngay 200ml nước lọc và nghỉ ngơi nhé.',
        sentAt: new Date(new Date().setHours(10, 20)).toISOString()
    },
    {
        id: 'msg-004',
        senderType: 'DOCTOR',
        content: 'Ông xem thêm tài liệu hướng dẫn xử trí nhanh này nhé.',
        sentAt: new Date(new Date().setHours(10, 22)).toISOString()
    }
]

export default function DoctorChat() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    // 1. Fetch Conversations
    const { data: realConversations, isLoading: loadingConvs } = useQuery({
        queryKey: ['doctor-chat-conversations'],
        queryFn: () => getDoctorChatConversations(headers),
        enabled: !!headers?.tenantId,
        refetchInterval: 10000
    })

    const conversations: ExtendedConversation[] = realConversations?.length ? (realConversations as ExtendedConversation[]) : mockConversations

    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(conversations[0]?.patientId || null)
    const [message, setMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)

    // 2. Fetch Chat History
    const { data: realChatHistory, isLoading: loadingHistory } = useQuery({
        queryKey: ['doctor-chat-history', selectedPatientId],
        queryFn: () => getDoctorChatHistory(selectedPatientId!, headers),
        enabled: !!selectedPatientId && !!headers?.tenantId,
        refetchInterval: 3000
    })

    const chatHistory = realChatHistory?.length ? realChatHistory : (selectedPatientId === 'pat-001' ? mockChatHistory : [])

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

    // Mock data for UI aesthetics (as requested "thiết kế i chang")
    const mockVitals = [
        { label: 'Đường huyết (Đói)', value: '12.5', unit: 'mmol/L', trend: 'up', status: 'danger', time: '10 phút trước' },
        { label: 'Huyết áp', value: '140/90', unit: 'mmHg', trend: 'stable', status: 'warning', time: '2 giờ trước' }
    ]

    const mockMeds = [
        { name: 'Metformin 500mg', schedule: 'Sáng/Tối - Sau ăn' },
        { name: 'Amlodipine 5mg', schedule: 'Sáng - Trước ăn' }
    ]

    const quickResponses = [
        { label: 'Khuyên: Nghỉ ngơi & uống nước', type: 'normal' },
        { label: 'Nhắc: Dùng thuốc', type: 'normal' },
        { label: 'CẢNH BÁO: Nhập viện khẩn cấp', type: 'danger' },
        { label: 'Hẹn: Khám lại ngày mai', type: 'normal' }
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
        <div className="flex-1 flex overflow-hidden bg-white dark:bg-slate-900 border-none shadow-none">
            {/* Sidebar: Conversation List */}
            <aside className={`w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50 shrink-0 ${selectedPatientId ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-6 space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Tin nhắn</h2>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bệnh nhân..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-none rounded-full text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {/* High Risk Section Header */}
                    <div className="px-4 py-2 bg-red-50 dark:bg-red-900/10 border-y border-red-100 dark:border-red-900/20 sticky top-0 z-10">
                        <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Rủi ro cao</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredConversations?.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedPatientId(conv.patientId)}
                                className={`w-full p-4 flex gap-3 transition-all cursor-pointer relative ${selectedPatientId === conv.patientId
                                    ? 'bg-white dark:bg-slate-800 border-l-4 border-l-red-500 shadow-sm'
                                    : 'hover:bg-white/50 dark:hover:bg-slate-800/30'
                                    } ${conv.risk === 'HIGH' ? 'border-l-4 border-l-red-500 bg-red-50/20' : conv.risk === 'WARNING' ? 'border-l-4 border-l-orange-500 bg-orange-50/10' : ''}`}
                            >
                                <div className="relative shrink-0">
                                    {conv.avatarUrl ? (
                                        <img
                                            src={conv.avatarUrl}
                                            alt={conv.patientName}
                                            className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${conv.risk === 'HIGH' ? 'border-red-200' : conv.risk === 'WARNING' ? 'border-orange-200' : 'border-white'}`}
                                        />
                                    ) : (
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xs border ${conv.risk === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100 shadow-sm' : conv.risk === 'WARNING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {conv.patientName.charAt(0)}
                                        </div>
                                    )}
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-[13px] truncate text-slate-900 dark:text-white">{conv.patientName}</p>
                                        <span className="text-[10px] text-slate-400 font-medium">10:24</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 font-medium opacity-80">
                                        {conv.lastMessage || 'Bắt đầu trò chuyện'}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className={`${conv.risk === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200' : conv.risk === 'WARNING' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border`}>
                                            {conv.risk === 'HIGH' ? 'High Risk' : conv.risk === 'WARNING' ? 'Theo dõi thêm' : 'Ổn định'}
                                        </span>
                                        {selectedPatientId === conv.patientId && (
                                            <span className="bg-emerald-400 text-slate-900 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-lg shadow-emerald-500/20">2</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 relative">
                {selectedPatientId ? (
                    <>
                        {/* Chat Header */}
                        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedPatientId(null)} className="lg:hidden p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 rounded-full transition-all">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    {selectedConv?.avatarUrl ? (
                                        <img
                                            src={selectedConv.avatarUrl}
                                            alt={selectedConv.patientName}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                                            {selectedConv?.patientName.charAt(0)}
                                        </div>
                                    )}
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{selectedConv?.patientName}</h3>
                                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Đang trực tuyến</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsVideoCallOpen(true)} className="flex items-center gap-2 bg-emerald-400 text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-400/20 active:scale-95">
                                    <Video className="w-3.5 h-3.5" />
                                    Gọi khám
                                </button>
                                <button className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-slate-400 hover:text-emerald-500 transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900 no-scrollbar">
                            <div className="flex justify-center">
                                <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 text-[9px] px-3 py-1 rounded-full uppercase font-black tracking-[0.2em]">Hôm nay, 24 Tháng 5</span>
                            </div>

                            <AnimatePresence>
                                {loadingHistory ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                    </div>
                                ) : chatHistory?.map((m, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${m.senderType === 'DOCTOR' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {m.senderType === 'SYSTEM' ? (
                                            <div className="w-full h-px relative my-2">
                                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                    <div className="w-full border-t border-red-200/50 dark:border-red-900/30"></div>
                                                </div>
                                                <div className="relative flex justify-center">
                                                    <span className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 px-4 py-1.5 rounded-lg flex items-center gap-2 text-[10px] text-red-700 dark:text-red-400 font-black uppercase">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                        {m.content}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {m.senderType !== 'DOCTOR' && (
                                                    <div className="shrink-0 mt-auto">
                                                        {selectedConv?.avatarUrl ? (
                                                            <img
                                                                src={selectedConv.avatarUrl}
                                                                alt={selectedConv.patientName}
                                                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-500">
                                                                {selectedConv?.patientName.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className={`max-w-[75%] space-y-1 ${m.senderType === 'DOCTOR' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`p-4 rounded-2xl shadow-sm border ${m.senderType === 'DOCTOR'
                                                        ? 'bg-emerald-400 text-slate-900 rounded-br-none border-emerald-500'
                                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border-slate-100 dark:border-slate-700'
                                                        }`}>
                                                        {m.content.includes('.pdf') ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-700/50 p-3 rounded-xl mb-2">
                                                                    <div className="bg-white/20 p-2 rounded-lg">
                                                                        <FileIcon className="w-6 h-6" />
                                                                    </div>
                                                                    <div className="flex-1 overflow-hidden">
                                                                        <p className="text-xs font-bold truncate">Huong-dan-xu-tri-tai-nha.pdf</p>
                                                                        <p className="text-[9px] opacity-70 uppercase tracking-tighter">1.2 MB • PDF Document</p>
                                                                    </div>
                                                                    <DownloadIcon className="w-4 h-4 cursor-pointer hover:scale-110 transition-transform" />
                                                                </div>
                                                                <p className="text-sm leading-relaxed">{m.content}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm leading-relaxed font-medium">{m.content}</p>
                                                        )}
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-2 ${m.senderType === 'DOCTOR' ? 'justify-end' : 'justify-start'}`}>
                                                        {m.senderType === 'DOCTOR' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Typing Indicator */}
                            <div className="flex gap-3 items-center">
                                <div className="bg-slate-200 dark:bg-slate-800 px-3 py-2 rounded-full flex gap-1 items-center">
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Responses */}
                        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar bg-slate-50 dark:bg-slate-900 whitespace-nowrap">
                            <span className="text-[9px] font-black text-slate-400 uppercase flex items-center shrink-0 tracking-widest">Gợi ý phản hồi:</span>
                            {quickResponses.map((qr, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMessage(qr.label.split(': ').pop() || '')}
                                    className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold border transition-all shadow-sm ${qr.type === 'danger'
                                        ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                                        }`}
                                >
                                    {qr.label}
                                </button>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <footer className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex items-end gap-3">
                                <div className="flex gap-1 mb-1">
                                    <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 flex items-end shadow-inner">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold resize-none py-2 px-3 placeholder:text-slate-300"
                                        placeholder="Nhập nội dung tư vấn..."
                                        rows={1}
                                    />
                                    <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim() || sendMutation.isPending}
                                    className="bg-emerald-400 text-slate-900 p-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                                >
                                    {sendMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
                        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Trung tâm Tư vấn Thông minh</h3>
                            <p className="text-sm font-bold text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">Chọn một bệnh nhân từ danh sách bên trái để xem yêu cầu tư vấn và theo dõi chỉ số sức khỏe.</p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <span className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-700">Mã hóa đầu cuối</span>
                            <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">Tiếp cận 24/7</span>
                        </div>
                    </div>
                )}
            </main>

            {/* Right Sidebar: Patient Profile (Optional/Desktop Only) */}
            {selectedPatientId && (
                <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto no-scrollbar hidden xl:block shrink-0">
                    <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative inline-block">
                            <img
                                alt="Large Profile"
                                className="w-24 h-24 rounded-full mx-auto border-4 border-white dark:border-slate-700 shadow-xl object-cover"
                                src={selectedPatientId === 'pat-001'
                                    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBxZb0i6fSxv7zXRP-bKi4E8c8bIqXsBUndL8VUu8M_cLiVjivnt9I2jA73J38ylYlGW_lF-sBvirOxEACFeQFBt9t4koxwsO60mn0P02c08UtHC_gvqYNWXjUeeuQn-OHblwxBwSKQ4t5rWtMrlmDr8xn4GDjEo_ioSM5kbdnkCASfxBU3JL2tbtPe5-ynH_zgFLBLSn6l_CDSgNbSJ-Ed-ZwzCNgyoOxyc6QLMmouHzVVaDI2gh071hspTZAtz-eKgZRX5UvEWog"
                                    : "https://lh3.googleusercontent.com/aida-public/AB6AXuCE_cXLngDHiXtWP_mhDxc5VxLTAXLU1GnJ1UMJ1sAvqPI5FexnYm6aIXLibW16ZNjlnSqa9jDykyKW1HIEB70U-hUw48NtRCY00AnAiGsfK8SSTjMUiA1NUaLnZFJEipdCBYNlZ1TWkJ-Upu2Jx_wp7eI_EyRiSEMUp3CvDKUnBijSOoxhF39v2rk7eNSJuRZjqIN5PjrJicb18L6DrbwKyFmV7G_mn3iUD2QGq9Rp7VFhZ6E0QbbNrJQQOov4tMWX4AMrglZi9DM"
                                }
                            />
                            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></span>
                        </div>
                        <h4 className="mt-4 font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">{selectedConv?.patientName}</h4>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">68 tuổi</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Nam</span>
                        </div>
                        <div className="mt-4 inline-block bg-emerald-400/10 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                            Tiểu đường Type 2
                        </div>
                    </div>

                    <div className="px-6 space-y-6 pb-8">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chỉ số gần đây</h5>
                                <History className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div className="space-y-3">
                                {mockVitals.map((v, i) => (
                                    <div key={i} className={`p-3 rounded-xl border ${v.status === 'danger' ? 'bg-red-50 dark:bg-red-900/10 border-red-100' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-100'}`}>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-[10px] font-black uppercase tracking-tighter ${v.status === 'danger' ? 'text-red-600' : 'text-orange-600'}`}>{v.label}</p>
                                            {v.status === 'danger' ? <TrendingUp className="w-3.5 h-3.5 text-red-500" /> : <Activity className="w-3.5 h-3.5 text-orange-500" />}
                                        </div>
                                        <p className={`text-lg font-black mt-1 ${v.status === 'danger' ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'}`}>
                                            {v.value} <span className="text-[10px] font-bold opacity-60 uppercase">{v.unit}</span>
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Cập nhật: {v.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Đơn thuốc hiện tại</h5>
                            <div className="space-y-2">
                                {mockMeds.map((m, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                                            <Pill className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-black truncate text-slate-700 dark:text-slate-200 uppercase">{m.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{m.schedule}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button className="w-full bg-emerald-400 text-slate-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                <PlusSquare className="w-4 h-4" />
                                Tạo đơn thuốc mới
                            </button>
                            <button className="w-full border-2 border-slate-100 dark:border-slate-800 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/10 dark:hover:border-emerald-900/30 transition-all text-slate-600 dark:text-slate-400">
                                <FileText className="w-4 h-4" />
                                Xem hồ sơ bệnh án
                            </button>
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
    )
}
