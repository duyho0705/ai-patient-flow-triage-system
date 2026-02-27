import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    Send,
    Search,
    Video,
    Phone,
    PlusCircle,
    Image as ImageIcon,
    Smile,
    Info,
    Star,
    Verified,
    Shield,
    MapPin,
    Clock,
    Calendar,
    ZoomIn,
    Loader2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPortalChatDoctors, getPortalChatHistory, sendPortalChatMessage, sendPortalChatFile } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import toast from 'react-hot-toast'

export default function PatientChatDoctor() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
    const [message, setMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
    const { data: chatHistory } = useQuery({
        queryKey: ['portal-chat-history', selectedDoctor?.id],
        queryFn: () => getPortalChatHistory(selectedDoctor.id, headers),
        enabled: !!selectedDoctor && !!headers?.tenantId,
        refetchInterval: 3000 // Poll for new messages
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

    const fileMutation = useMutation({
        mutationFn: (file: File) => sendPortalChatFile(selectedDoctor.id, file, message || undefined, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-chat-history', selectedDoctor?.id] })
            setMessage('')
            setSelectedFile(null)
            toast.success('Đã gửi file thành công!')
        },
        onError: () => {
            toast.error('Không thể gửi file.')
        }
    })

    const handleSend = () => {
        if (sendMutation.isPending || fileMutation.isPending) return
        if (selectedFile) {
            fileMutation.mutate(selectedFile)
            return
        }
        if (!message.trim()) return
        sendMutation.mutate(message)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File không được vượt quá 10MB')
                return
            }
            setSelectedFile(file)
            // Auto-send the file
            fileMutation.mutate(file)
        }
        e.target.value = '' // Reset input
    }

    const filteredDoctors = doctors?.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    if (loadingDoctors) return (
        <div className="h-[calc(100vh-120px)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-slate-400 font-bold">Đang tìm bác sĩ trực tuyến...</p>
            </div>
        </div>
    )

    return (
        <div className="h-[calc(100vh-80px)] flex gap-0 overflow-hidden -mx-4 lg:-mx-6 -mb-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            {/* 1. Contact List Sidebar */}
            <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Tin nhắn</h2>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                            placeholder="Tìm kiếm bác sĩ..."
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
                    {filteredDoctors.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => setSelectedDoctor(doc)}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all border ${selectedDoctor?.id === doc.id
                                ? 'bg-[#4ade80]/10 border-[#4ade80]/20'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
                                }`}
                        >
                            <div className="relative flex-shrink-0">
                                <img src={doc.avatar} className="w-12 h-12 rounded-full object-cover shadow-sm" alt={doc.name} />
                                {doc.online && (
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4ade80] border-2 border-white dark:border-slate-900 rounded-full" />
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h4 className="font-bold text-sm truncate text-slate-900 dark:text-white">{doc.name}</h4>
                                    <span className="text-[10px] text-slate-400 font-medium">{doc.lastMessageTime || 'mới'}</span>
                                </div>
                                <p className={`text-xs truncate ${selectedDoctor?.id === doc.id ? 'text-[#4ade80]' : 'text-slate-500'}`}>
                                    {doc.lastMessage || doc.specialty}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* 2. Chat Window Area */}
            <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative">
                {selectedDoctor ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={selectedDoctor.avatar} className="w-10 h-10 rounded-full object-cover" alt={selectedDoctor.name} />
                                    {selectedDoctor.online && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4ade80] border-2 border-white dark:border-slate-900 rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{selectedDoctor.name}</h3>
                                    <p className="text-[10px] text-[#4ade80] font-bold uppercase tracking-wider">
                                        {selectedDoctor.online ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
                            <div className="flex justify-center">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] text-slate-500 uppercase font-black tracking-widest">
                                    Hôm nay, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <AnimatePresence>
                                {chatHistory?.map((msg: any, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.senderType === 'PATIENT' ? 'justify-end' : 'justify-start'} items-end gap-3`}
                                    >
                                        {msg.senderType === 'DOCTOR' && (
                                            <img src={selectedDoctor.avatar} className="w-8 h-8 rounded-full border border-slate-100" alt="Dr" />
                                        )}
                                        <div className={`max-w-[80%] flex flex-col ${msg.senderType === 'PATIENT' ? 'items-end' : 'items-start'} gap-1.5`}>
                                            {(msg.isImage || msg.fileUrl) ? (
                                                <div className="bg-[#4ade80]/10 border border-[#4ade80]/20 p-2 rounded-2xl rounded-br-none group cursor-pointer relative">
                                                    <img src={msg.imageUrl || msg.fileUrl} className="rounded-xl w-64 h-40 object-cover" alt="attachment" />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-xl">
                                                        <ZoomIn className="text-white w-6 h-6" />
                                                    </div>
                                                    <p className="text-[10px] mt-2 text-slate-500 px-1 italic">{msg.content || 'File đính kèm'}</p>
                                                </div>
                                            ) : (
                                                <div className={`p-4 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${msg.senderType === 'PATIENT'
                                                    ? 'bg-[#4ade80] text-slate-900 rounded-br-none shadow-[#4ade80]/20'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700/50'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            )}
                                            <span className="text-[9px] text-slate-400 font-bold px-1">
                                                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 rounded-[1.5rem] p-1.5 transition-all focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:bg-white dark:focus-within:bg-slate-800">
                                <input
                                    type="file"
                                    id="chat-file-upload"
                                    className="hidden"
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="chat-file-upload" className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-colors cursor-pointer">
                                    <PlusCircle className="w-5 h-5" />
                                </label>
                                <label htmlFor="chat-file-upload" className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-colors cursor-pointer">
                                    <ImageIcon className="w-5 h-5" />
                                </label>
                                <button className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-colors">
                                    <Smile className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-slate-700 dark:text-slate-200 font-medium"
                                    placeholder="Nhập tin nhắn..."
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={(!message.trim() && !selectedFile) || sendMutation.isPending || fileMutation.isPending}
                                    className="bg-[#4ade80] text-slate-900 p-2.5 rounded-xl shadow-lg shadow-[#4ade80]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {(sendMutation.isPending || fileMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin text-slate-900" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-50">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Chọn bác sĩ để trò chuyện</h3>
                    </div>
                )}
            </main>

            {/* 3. Doctor Details Sidebar (xl only) */}
            <aside className="hidden xl:flex w-80 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-col overflow-y-auto">
                {selectedDoctor && (
                    <>
                        <div className="p-8 text-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                            <div className="relative inline-block mb-6">
                                <img
                                    src={selectedDoctor.avatar}
                                    className="w-32 h-32 rounded-[2rem] object-cover shadow-2xl border-4 border-white dark:border-slate-800 transition-transform hover:scale-105 duration-500"
                                    alt={selectedDoctor.name}
                                />
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-white dark:border-slate-900">
                                    <Verified className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{selectedDoctor.name}</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 px-4">{selectedDoctor.specialty}</p>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="bg-slate-100/50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-700">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Kinh nghiệm</p>
                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{selectedDoctor.experience || '10 năm'}</p>
                                </div>
                                <div className="bg-slate-100/50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-700">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Đánh giá</p>
                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1">
                                        {selectedDoctor.rating || '4.9'} <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            <section>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Giới thiệu</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    Chuyên gia điều trị các bệnh lý mãn tính, đặc biệt là tiểu đường tuýp 2 và cao huyết áp. Tốt nghiệp Đại học Y Dược TP.HCM.
                                </p>
                            </section>

                            <section>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Thông tin liên hệ</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1 p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                                            <MapPin className="text-emerald-500 w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedDoctor.location || 'Phòng khám Quận 1, TP.HCM'}</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="mt-1 p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                                            <Clock className="text-emerald-500 w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedDoctor.schedule || '08:00 - 17:00 (T2 - T7)'}</span>
                                    </li>
                                </ul>
                            </section>

                            <div className="pt-4 space-y-3">
                                <button className="w-full py-4 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Đặt lịch hẹn ngay
                                </button>
                                <button className="w-full py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all">
                                    Xem hồ sơ chi tiết
                                </button>
                            </div>
                        </div>

                        <div className="mt-auto p-6 bg-emerald-50/30 dark:bg-emerald-500/5">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="text-emerald-500 w-4 h-4" />
                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Bảo mật thông tin</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed px-1">
                                Cuộc trò chuyện này được mã hóa đầu cuối để đảm bảo an toàn cho dữ liệu y tế của bạn.
                            </p>
                        </div>
                    </>
                )}
            </aside>
        </div>
    )
}
