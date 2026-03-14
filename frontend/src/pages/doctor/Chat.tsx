import React, { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Loader2,
    Paperclip,
    Image as ImageIcon
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getDoctorChatConversations, sendDoctorChatFile } from '@/api/doctorChat'
import { getPatientFullProfile } from '@/api/doctor'
import { getPatientHealthMetrics } from '@/api/doctorHealth'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useFirebaseChat } from '@/hooks/useFirebaseChat'
import { toastService } from '@/services/toast'
import type { PatientChatConversationDto } from '@/api-client'
import VideoCall from '@/components/VideoCall'
import { Link } from 'react-router-dom'
import { PrescriptionModal } from '@/components/modals/PrescriptionModal'
import { HistoryModal } from '@/components/modals/HistoryModal'
import { AdviceModal } from '@/components/modals/AdviceModal'

interface ExtendedConversation extends PatientChatConversationDto {
    risk?: 'HIGH' | 'WARNING' | 'NORMAL';
    avatarUrl?: string;
    isOnline?: boolean;
    unreadCount?: number;
}


export default function DoctorChat() {
    const { headers } = useTenant()
    // 1. Fetch Conversations
    const { data: realConversations, isLoading: loadingConvs } = useQuery({
        queryKey: ['doctor-chat-conversations'],
        queryFn: () => getDoctorChatConversations(headers),
        enabled: !!headers?.tenantId,
        refetchInterval: 10000
    })

    const conversations: ExtendedConversation[] = (realConversations as ExtendedConversation[]) || []

    const { user } = useAuth()
    const doctorId = user?.id || ''

    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
    const [message, setMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)

    // Auto-select first conversation when loaded
    if (!selectedPatientId && conversations.length > 0) {
        setSelectedPatientId(conversations[0].patientId || null)
    }

    const { data: patientProfile } = useQuery({
        queryKey: ['patient-profile', selectedPatientId],
        queryFn: () => getPatientFullProfile(selectedPatientId!, headers),
        enabled: !!selectedPatientId && !!headers?.tenantId,
    })

    const { data: healthMetrics } = useQuery({
        queryKey: ['patient-health-metrics', selectedPatientId],
        queryFn: () => getPatientHealthMetrics(selectedPatientId!, headers),
        enabled: !!selectedPatientId && !!headers?.tenantId,
    })

    const calculateAge = (dob?: string) => {
        if (!dob) return '–'
        const birth = new Date(dob)
        const diff = Date.now() - birth.getTime()
        return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
    }

    const latestVitals = useMemo(() => {
        if (!healthMetrics?.length) return null;
        const bpSys = healthMetrics.find(m => m.metricType === 'BLOOD_PRESSURE_SYS');
        const bpDia = healthMetrics.find(m => m.metricType === 'BLOOD_PRESSURE_DIA');
        const hr = healthMetrics.find(m => m.metricType === 'HEART_RATE');
        const bg = healthMetrics.find(m => m.metricType === 'BLOOD_GLUCOSE');
        
        let lastUpdated = healthMetrics[0]?.recordedAt;

        return {
            bp: bpSys && bpDia ? `${bpSys.value}/${bpDia.value}` : '–',
            hr: hr ? `${hr.value} bpm` : '–',
            bg: bg ? `${bg.value} ${bg.unit || 'mmol/L'}` : '–',
            lastUpdated
        }
    }, [healthMetrics])

    // 2. Fetch Chat History (Realtime)
    const { messages: firebaseHistory, loading: loadingHistory, sendMessage } = useFirebaseChat(
        headers?.tenantId,
        selectedPatientId,
        doctorId
    )

    const chatHistory = firebaseHistory || []

    const handleSend = async () => {
        if (!message.trim() || isSending || !selectedPatientId || !doctorId) return

        setIsSending(true)
        try {
            await sendMessage(message, doctorId, 'DOCTOR')
            setMessage('')
        } catch (error) {
            toastService.error('Không thể gửi tin nhắn.')
        } finally {
            setIsSending(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'FILE') => {
        const file = e.target.files?.[0]
        if (!file || !selectedPatientId || !doctorId) return

        setIsSending(true)
        toastService.info('Đang tải tệp lên...')
        try {
            const result = await sendDoctorChatFile(selectedPatientId, file, '', headers)
            if (result.fileUrl) {
                const isImage = type === 'IMAGE' || file.type.startsWith('image/')
                await sendMessage(
                    isImage ? '📷 Hình ảnh' : `📎 ${file.name}`,
                    doctorId,
                    'DOCTOR',
                    isImage ? result.fileUrl : undefined,
                    !isImage ? result.fileUrl : undefined
                )
                toastService.success('Tải tệp thành công')
            }
        } catch (error) {
            console.error(error)
            toastService.error('Không thể tải tệp lên.')
        } finally {
            setIsSending(false)
            if (e.target) e.target.value = ''
        }
    }

    const filteredConversations = conversations?.filter(c =>
        (c.patientName || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedConv = conversations?.find(c => c.patientId === selectedPatientId)




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
        <div className="flex h-full w-full overflow-hidden font-display bg-white dark:bg-slate-900">
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
            <section className={`w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900/50 shrink-0 ${selectedPatientId ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm bệnh nhân..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                <div className="flex border-b border-slate-200 dark:border-slate-800">
                    <button className="flex-1 py-3 text-sm font-bold text-primary border-b-2 border-primary">Tất cả</button>
                    <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Chưa đọc</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-3 space-y-2">
                        {filteredConversations?.map((conv) => {
                            const isSelected = selectedPatientId === conv.patientId;
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedPatientId(conv.patientId || null)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected
                                        ? 'bg-primary/5 border border-primary/20'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <img 
                                            src={conv.avatarUrl || 'https://via.placeholder.com/150'} 
                                            alt={conv.patientName} 
                                            className={`size-12 rounded-full object-cover ${!conv.isOnline && conv.isOnline !== undefined ? 'grayscale' : ''}`} 
                                        />
                                        {conv.isOnline !== false && (
                                            <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className="text-sm font-bold truncate text-slate-900 dark:text-white">{conv.patientName}</h3>
                                            <span className="text-[10px] text-slate-400">10:45</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{conv.lastMessage || 'Bắt đầu trò chuyện'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-bold ${conv.risk === 'HIGH' ? 'bg-red-100 text-red-600' : conv.risk === 'WARNING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                                {conv.risk === 'HIGH' ? 'Nguy cơ cao' : conv.risk === 'WARNING' ? 'Theo dõi' : 'Bình thường'}
                                            </span>
                                        </div>
                                    </div>
                                    {(conv.unreadCount || isSelected) ? (
                                        <div className="size-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">
                                            {conv.unreadCount || 2}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Middle Column: Chat Window */}
            <section className="flex-1 flex flex-col bg-background-light dark:bg-background-dark relative">
                {selectedPatientId ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedPatientId(null)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <div className="size-10 rounded-full bg-slate-200 overflow-hidden">
                                    {selectedConv?.avatarUrl ? (
                                        <img className="w-full h-full object-cover" src={selectedConv.avatarUrl} alt={selectedConv.patientName} />
                                    ) : (
                                        <div className="size-full flex items-center justify-center font-black text-xs text-slate-400 bg-slate-50">
                                            {selectedConv?.patientName?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold leading-none">{selectedConv?.patientName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="size-2 rounded-full bg-green-500"></span>
                                        <span className="text-xs text-slate-500">Đang hoạt động • 10:45 AM</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                    <span className="material-symbols-outlined">call</span>
                                </button>
                                <button onClick={() => setIsVideoCallOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Cuộc gọi video">
                                    <span className="material-symbols-outlined">videocam</span>
                                </button>
                                <button onClick={() => setIsAdviceModalOpen(true)} className="p-2 text-primary hover:bg-primary/10 rounded-lg border border-primary/20" title="Gửi lời khuyên/Cảnh báo">
                                    <span className="material-symbols-outlined">medical_services</span>
                                </button>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <div className="flex justify-center">
                                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500 font-medium">HÔM NAY</span>
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
                                                <span className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 px-4 py-1.5 rounded-xl flex items-center gap-2 text-[10px] text-red-700 dark:text-red-400 font-bold uppercase tracking-wider">
                                                    <span className="material-symbols-outlined text-[10px]">warning</span>
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
                                            className={`flex gap-3 max-w-[80%] ${isSelf ? 'flex-row-reverse ml-auto' : ''}`}
                                        >
                                            {!isSelf && (
                                                <img 
                                                    src={selectedConv?.avatarUrl || 'https://via.placeholder.com/150'} 
                                                    alt="Avatar" 
                                                    className="size-8 rounded-full self-end object-cover" 
                                                />
                                            )}
                                            <div className={`${isSelf 
                                                    ? 'bg-primary text-white p-3 rounded-2xl rounded-br-none shadow-md'
                                                    : 'bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700'
                                                }`}>
                                                {m.imageUrl ? (
                                                    <div className="mb-2">
                                                        <img 
                                                            src={m.imageUrl.startsWith('/') ? `${process.env.VITE_API_BASE_URL || ''}${m.imageUrl}` : m.imageUrl} 
                                                            alt="Chat attachment" 
                                                            className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                                                            onClick={() => window.open(m.imageUrl, '_blank')}
                                                        />
                                                    </div>
                                                ) : m.fileUrl ? (
                                                    <div className="mb-2 flex items-center gap-2 bg-black/10 dark:bg-white/10 p-2 rounded-lg">
                                                        <Paperclip className="w-4 h-4" />
                                                        <a 
                                                            href={m.fileUrl.startsWith('/') ? `${process.env.VITE_API_BASE_URL || ''}${m.fileUrl}` : m.fileUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-bold underline truncate"
                                                        >
                                                            Tệp đính kèm
                                                        </a>
                                                    </div>
                                                ) : null}
                                                <p className="text-sm">{m.content}</p>
                                                <span className={`text-[10px] mt-1 block ${isSelf ? 'opacity-70 text-right' : 'text-slate-400'}`}>
                                                    {new Date(m.sentAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Message Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                                <button
                                    onClick={() => setMessage('Gửi khuyến nghị')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-sm">recommend</span>
                                    Gửi khuyến nghị
                                </button>
                                <button
                                    onClick={() => setMessage('Gửi cảnh báo')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    Gửi cảnh báo
                                </button>
                                <button
                                    onClick={() => setMessage('Đơn thuốc điện tử')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-sm">medication</span>
                                    Đơn thuốc mới
                                </button>
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex gap-1 mb-2">
                                    <input 
                                        type="file" 
                                        ref={imageInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'IMAGE')}
                                    />
                                    <button 
                                        onClick={() => imageInputRef.current?.click()}
                                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>

                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={(e) => handleFileChange(e, 'FILE')}
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 relative">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 resize-none"
                                        placeholder="Nhập tin nhắn..."
                                        rows={1}
                                    />
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim() || isSending}
                                    className="bg-primary hover:bg-primary/90 text-white p-3 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                                >
                                    {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="material-symbols-outlined">send</span>}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
                        <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center shadow-inner animate-pulse">
                            <span className="material-symbols-outlined text-[40px]">forum</span>
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
            </section>

            {/* Right Column: Patient Summary */}
            {selectedPatientId && (
                <section className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col p-5 overflow-y-auto custom-scrollbar hidden xl:flex shrink-0">
                    <div className="text-center mb-6">
                        <div className="size-20 mx-auto rounded-full border-4 border-primary/20 p-1 mb-3">
                            {selectedConv?.avatarUrl ? (
                                <img
                                    src={selectedConv.avatarUrl}
                                    alt="Large Profile"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="size-full flex items-center justify-center bg-slate-100 rounded-full font-black text-2xl text-slate-400">
                                    {patientProfile?.fullNameVi?.charAt(0) || selectedConv?.patientName?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-lg">{patientProfile?.fullNameVi || selectedConv?.patientName}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                            {patientProfile?.gender === 'female' ? 'Nữ' : patientProfile?.gender === 'male' ? 'Nam' : '–'}, {calculateAge(patientProfile?.dateOfBirth)} tuổi
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-slate-500">CHỈ SỐ SINH TỒN</h4>
                                <span className="text-[10px] text-primary font-bold">
                                    {latestVitals?.lastUpdated ? formatDistanceToNow(new Date(latestVitals.lastUpdated), { addSuffix: true, locale: vi }) : 'Chưa có'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500 text-sm">blood_pressure</span>
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Huyết áp</span>
                                    </div>
                                    <span className="text-sm font-bold text-red-500">{latestVitals?.bp || '–'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500 text-sm">favorite</span>
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Nhịp tim</span>
                                    </div>
                                    <span className="text-sm font-bold">{latestVitals?.hr || '–'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-orange-500 text-sm">water_drop</span>
                                        <span className="text-xs text-slate-600 dark:text-slate-400">Đường huyết</span>
                                    </div>
                                    <span className="text-sm font-bold">{latestVitals?.bg || '–'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Lối tắt nhanh</h4>
                            <Link to={`/patients/${selectedPatientId}/ehr`} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">description</span>
                                    <span className="text-sm font-medium">Xem hồ sơ đầy đủ</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                            </Link>
                            <button onClick={() => setIsPrescriptionModalOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">pill</span>
                                    <span className="text-sm font-medium">Kê đơn thuốc</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                            </button>
                            <button onClick={() => setIsHistoryModalOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">history</span>
                                    <span className="text-sm font-medium">Lịch sử khám</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary text-lg">info</span>
                            <h5 className="text-xs font-bold text-primary">Ghi chú nhanh</h5>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                            {patientProfile?.chronicConditions ? `Bệnh nhân có tiền sử: ${patientProfile.chronicConditions}.` : 'Không có ghi chú bệnh lý'}
                        </p>
                    </div>
                </section>
            )}

            {isVideoCallOpen && (
                <VideoCall
                    roomID={`telehealth-${selectedPatientId}`}
                    userID={`doctor-${doctorId}`}
                    userName="Bác sĩ"
                    onClose={() => setIsVideoCallOpen(false)}
                />
            )}

            <PrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                patientId={selectedPatientId!}
                patientName={selectedConv?.patientName}
            />

            <HistoryModal 
                isOpen={isHistoryModalOpen} 
                onClose={() => setIsHistoryModalOpen(false)} 
                patientId={selectedPatientId!}
                patientName={selectedConv?.patientName} 
            />

            <AdviceModal
                isOpen={isAdviceModalOpen}
                onClose={() => setIsAdviceModalOpen(false)}
                patientId={selectedPatientId || ''}
                patientName={selectedConv?.patientName}
            />
        </div>
    );
}
