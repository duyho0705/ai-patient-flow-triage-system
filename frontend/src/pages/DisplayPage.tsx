import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPublicDisplayData } from '@/api/public'
import { WebSocketService } from '@/services/websocket'
import {
    Clock,
    Monitor,
    Volume2,
    VolumeX,
    Users,
    Stethoscope,
    ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function DisplayPage() {
    const { branchId } = useParams()
    const queryClient = useQueryClient()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isMuted, setIsMuted] = useState(false)
    const prevCalledNames = useRef<string[]>([])

    const { data: status, isLoading } = useQuery({
        queryKey: ['public-display', branchId],
        queryFn: () => getPublicDisplayData(branchId!),
        enabled: !!branchId,
        refetchInterval: 10000, // Backup polling
    })

    // Clock update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // WebSocket for instant updates
    useEffect(() => {
        if (!branchId) return
        const ws = new WebSocketService((msg) => {
            if (msg.type === 'QUEUE_REFRESH' || msg.type === 'PATIENT_CALLED') {
                queryClient.invalidateQueries({ queryKey: ['public-display', branchId] })
            }
        })
        ws.connect()
        return () => ws.disconnect()
    }, [branchId, queryClient])

    // Voice Notification
    useEffect(() => {
        if (!status?.calling || isMuted) return

        const currentNames = status.calling.map(e => e.patientName)
        const newEntries = status.calling.filter(e => !prevCalledNames.current.includes(e.patientName))

        if (newEntries.length > 0) {
            newEntries.forEach(entry => {
                const text = `Mời bệnh nhân ${entry.patientName} đến ${entry.queueName}`
                const utterance = new SpeechSynthesisUtterance(text)
                utterance.lang = 'vi-VN'
                utterance.rate = 0.9
                window.speechSynthesis.speak(utterance)
            })
        }
        prevCalledNames.current = currentNames
    }, [status?.calling, isMuted])

    if (isLoading) return (
        <div className="h-screen bg-[#0f172a] flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-black tracking-widest uppercase text-xs text-slate-500">Đang khởi tạo màn hình...</p>
            </div>
        </div>
    )

    return (
        <div className="h-screen w-screen bg-[#0f172a] text-white flex flex-col overflow-hidden font-sans selection:bg-blue-500">
            {/* Massive Header */}
            <header className="flex items-center justify-between p-8 bg-black/20 border-b border-white/5 backdrop-blur-3xl shrink-0">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/40">
                        <Monitor className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
                            Hệ thống Điều phối
                        </h1>
                        <p className="text-blue-500 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            {status?.branchName || 'Chi nhánh'} <span className="text-slate-700">•</span> REAL-TIME MONITOR
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Thời gian hiện tại</p>
                        <div className="text-4xl font-black tracking-tighter tabular-nums flex items-center gap-3">
                            <Clock className="w-7 h-7 text-blue-500" />
                            {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            <span className="text-slate-700">:</span>
                            <span className="text-xl text-slate-500 tabular-nums">{currentTime.toLocaleTimeString('vi-VN', { second: '2-digit' })}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-5 rounded-3xl border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                    >
                        {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                    </button>
                </div>
            </header>

            {/* Main Display Grid */}
            <main className="flex-1 overflow-hidden p-8 grid grid-cols-12 gap-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black">

                {/* Current Serving Section (Large) */}
                <div className="col-span-8 flex flex-col gap-8">
                    <div className="flex items-center gap-4 px-4">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <h2 className="text-2xl font-black text-white/40 uppercase tracking-[0.2em]">Đang mời khám • NOW CALLING</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-8 pb-10">
                        <AnimatePresence mode="popLayout">
                            {status?.calling?.map((entry, idx) => (
                                <motion.div
                                    key={`${entry.patientName}-${idx}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: 50 }}
                                    className={`bg-slate-800/40 backdrop-blur-3xl border p-12 rounded-[4.5rem] relative overflow-hidden group shadow-2xl ${idx === 0 ? 'border-blue-500/50 bg-blue-600/5 shadow-blue-500/10' : 'border-white/5'}`}
                                >
                                    <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000 group-hover:opacity-[0.08]">
                                        <Stethoscope className="w-64 h-64" />
                                    </div>
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={`inline-block text-[10px] font-black px-5 py-1.5 rounded-full mb-4 uppercase tracking-[0.1em] ${idx === 0 ? 'bg-blue-600' : 'bg-slate-700 text-slate-300'}`}>PHÒNG {idx + 1}</span>
                                                <h3 className="text-6xl font-black text-white tracking-tightest leading-tight">
                                                    {entry.patientName}
                                                </h3>
                                            </div>
                                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5">
                                                <ArrowRight className="w-8 h-8 text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dịch vụ</p>
                                                <p className="text-2xl font-black uppercase text-blue-400 truncate max-w-[250px]">{entry.queueName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Trạng thái</p>
                                                <p className="text-lg font-bold text-emerald-400 uppercase italic">Mời vào</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(!status?.calling || status.calling.length === 0) && (
                            <div className="col-span-2 h-full flex flex-col items-center justify-center p-20 bg-white/[0.02] rounded-[5rem] border-2 border-dashed border-white/5 text-center space-y-6">
                                <div className="p-8 bg-white/5 rounded-full animate-pulse">
                                    <Monitor className="w-20 h-20 text-slate-700" />
                                </div>
                                <p className="text-slate-600 text-2xl font-black uppercase tracking-[0.3em] flex items-center gap-4">
                                    Hệ thống đang sẵn sàng
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Queue List Section (Sidebar) */}
                <div className="col-span-4 flex flex-col gap-8 bg-black/40 rounded-[4rem] p-10 border border-white/5 backdrop-blur-2xl shadow-inner shadow-white/5">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xl font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                            <Users className="w-6 h-6" />
                            Chuẩn bị • UPCOMING
                        </h2>
                        <div className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-500 text-sm font-black tabular-nums">
                            {status?.waiting?.length || 0}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                        {status?.waiting?.map((entry, idx) => (
                            <motion.div
                                key={`${entry.patientName}-${idx}`}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/[0.03] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/10 transition-all cursor-default"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-600 font-black text-2xl group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-xl font-black tracking-tighter text-slate-100">{entry.patientName}</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{entry.queueName}</p>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full blur-[2px] ${entry.acuityLevel === 'RED' ? 'bg-red-500' :
                                    entry.acuityLevel === 'YELLOW' ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                    } shadow-[0_0_10px_currentColor]`} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Info */}
                    <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[3rem] shadow-2xl shadow-blue-500/20 group relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Users className="w-32 h-32" />
                        </div>
                        <p className="text-blue-100 font-black uppercase tracking-widest text-[10px] mb-2">Thông tin sảnh chờ</p>
                        <p className="text-4xl font-black text-white tabular-nums">{status?.waiting?.length || 0} <span className="text-sm font-bold opacity-60 ml-1 uppercase">Đang chờ</span></p>
                        <div className="mt-6 flex gap-1.5 h-1.5">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className={`flex-1 rounded-full ${i <= 3 ? 'bg-white' : 'bg-white/20'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* News Ticker footer */}
            <div className="bg-blue-900/40 border-t border-white/5 py-3 overflow-hidden relative backdrop-blur-md">
                <div className="flex gap-12 whitespace-nowrap text-xs font-black uppercase tracking-[0.2em] text-blue-400/80 animate-marquee">
                    <span>• VUI LÒNG THEO DÕI MÀN HÌNH VÀ CHUẨN BỊ SẴN GIẤY TỜ •</span>
                    <span>• HỆ THỐNG ĐIỀU PHỐI BỆNH NHÂN THÔNG MINH SẴN SÀNG PHỤC VỤ •</span>
                    <span>• CHÚC QUÝ KHÁCH MỘT NGÀY ĐIỀU TRỊ THUẬN LỢI VÀ SỨC KHỎE •</span>
                    <span>• LIÊN HỆ QUẦY TIẾP ĐÓN NẾU CẦN HỖ TRỢ KHẨN CẤP •</span>
                    {/* Double for smooth marquee */}
                    <span>• VUI LÒNG THEO DÕI MÀN HÌNH VÀ CHUẨN BỊ SẴN GIẤY TỜ •</span>
                    <span>• HỆ THỐNG ĐIỀU PHỐI BỆNH NHÂN THÔNG MINH SẴN SÀNG PHỤC VỤ •</span>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: inline-flex;
                    animation: marquee 40s linear infinite;
                }
                .tracking-tightest { letter-spacing: -0.05em; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
