import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPublicQueueStatus } from '@/api/queues'
import { useTenant } from '@/context/TenantContext'
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

export default function PublicQueue() {
    const { branchId, headers } = useTenant()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isMuted, setIsMuted] = useState(false)
    const prevCalledIds = useRef<string[]>([])

    const { data: status } = useQuery({
        queryKey: ['public-queue', branchId],
        queryFn: () => getPublicQueueStatus(branchId || '', headers),
        enabled: !!branchId && !!headers?.tenantId,
        refetchInterval: 5000, // Sync every 5s
    })

    // Clock update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Voice Notification
    useEffect(() => {
        if (!status?.calledEntries || isMuted) return

        const currentIds = status.calledEntries.map(e => e.id)
        const newEntries = status.calledEntries.filter(e => !prevCalledIds.current.includes(e.id))

        if (newEntries.length > 0) {
            newEntries.forEach(entry => {
                const text = `Mời bệnh nhân ${entry.patientName} đến ${entry.queueName}`
                const utterance = new SpeechSynthesisUtterance(text)
                utterance.lang = 'vi-VN'
                utterance.rate = 0.9
                window.speechSynthesis.speak(utterance)
            })
        }
        prevCalledIds.current = currentIds
    }, [status?.calledEntries, isMuted])

    if (!branchId) return (
        <div className="h-screen bg-slate-900 flex items-center justify-center text-white p-10">
            <div className="text-center space-y-4">
                <Monitor className="w-20 h-20 mx-auto text-slate-700 animate-pulse" />
                <h1 className="text-3xl font-black italic tracking-tighter">SCREEN_OFFLINE_NO_BRANCH</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Vui lòng chọn chi nhánh trong hệ thống</p>
            </div>
        </div>
    )

    return (
        <div className="h-screen bg-slate-900 text-white overflow-hidden flex flex-col font-sans">
            {/* Massive Header */}
            <header className="flex items-center justify-between p-8 bg-black/40 border-b border-white/5 backdrop-blur-3xl shrink-0">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20">
                        <Monitor className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tightest">
                            {status?.branchName || 'HỆ THỐNG ĐIỀU PHỐI'}
                        </h1>
                        <p className="text-blue-500 font-black uppercase tracking-widest text-xs">
                            TRẠNG THÁI HÀNG CHỜ - {status?.branchName ? 'THỜI GIAN THỰC' : 'ĐANG KẾT NỐI...'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Thời gian hiện tại</p>
                        <div className="text-4xl font-black tracking-tighter tabular-nums flex items-center gap-3">
                            <Clock className="w-6 h-6 text-blue-500" />
                            {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            <span className="text-slate-700">:</span>
                            <span className="text-xl text-slate-500">{currentTime.toLocaleTimeString('vi-VN', { second: '2-digit' })}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-5 rounded-3xl border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-slate-400'}`}
                    >
                        {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                    </button>
                </div>
            </header>

            {/* Main Display Grid */}
            <main className="flex-1 overflow-hidden p-8 grid grid-cols-12 gap-8 bg-gradient-to-b from-slate-900 to-black">

                {/* Current Serving Section (Large) */}
                <div className="col-span-8 flex flex-col gap-6">
                    <div className="flex items-center gap-3 px-4">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <h2 className="text-xl font-black text-white/50 uppercase tracking-widest">ĐANG GỌI VÀO KHÁM</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-6 pb-20">
                        <AnimatePresence>
                            {status?.calledEntries.map((entry, idx) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, scale: 0.9, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    className="bg-slate-800/50 backdrop-blur-xl border border-white/10 p-10 rounded-[4rem] relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                                        <Stethoscope className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10 space-y-6">
                                        <div>
                                            <span className="inline-block bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full mb-3 uppercase tracking-tighter">PHÒNG {idx + 1}</span>
                                            <h3 className="text-5xl font-black text-blue-500 tracking-tighter leading-none">{entry.patientName}</h3>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nội dung</p>
                                                <p className="text-xl font-bold uppercase">{entry.queueName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">STT</p>
                                                <p className="text-3xl font-black text-white">#{idx + 101}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(!status?.calledEntries || status.calledEntries.length === 0) && (
                            <div className="col-span-2 h-full flex items-center justify-center p-20 bg-white/2 rounded-[4rem] border border-dashed border-white/5">
                                <p className="text-slate-600 font-bold uppercase tracking-[0.3em]">Hệ thống đang sẵn sàng</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Queue List Section (Sidebar) */}
                <div className="col-span-4 flex flex-col gap-6 bg-black/30 rounded-[3.5rem] p-8 border border-white/5">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-lg font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            CHUẨN BỊ ĐẾN LƯỢT
                        </h2>
                        <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-full">{status?.waitingEntries.length || 0}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                        {status?.waitingEntries.map((entry, idx) => (
                            <motion.div
                                key={entry.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 font-black text-xl group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-colors">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-lg font-black tracking-tight">{entry.patientName}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{entry.queueName}</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer Stats */}
                    <div className="p-6 bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-500/20">
                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Tổng bệnh nhân đang đợi</p>
                        <p className="text-3xl font-black text-white">{status?.waitingEntries.length || 0} người</p>
                        <div className="mt-4 flex gap-1">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-white' : 'bg-white/30'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* News Ticker / Footer Footer */}
            <div className="bg-blue-900/40 border-t border-white/5 p-4 overflow-hidden relative backdrop-blur-md">
                <div className="flex gap-10 whitespace-nowrap whitespace-nowrap text-xs font-black uppercase tracking-widest text-blue-400 animate-marquee">
                    <span>• CHÚC BẠN NHIỀU SỨC KHỎE • VUI LÒNG GIỮ TRẬT TỰ TẠI KHU VỰC CHỜ • HỆ THỐNG PHÂN LOẠI THÔNG MINH ĐÃ SẴN SÀNG • LIÊN HỆ QUẦY TIẾP ĐÓN NẾU CẦN HỖ TRỢ KHẨN CẤP • </span>
                    <span>• CHÚC BẠN NHIỀU SỨC KHỎE • VUI LÒNG GIỮ TRẬT TỰ TẠI KHU VỰC CHỜ • HỆ THỐNG PHÂN LOẠI THÔNG MINH ĐÃ SẴN SÀNG • LIÊN HỆ QUẦY TIẾP ĐÓN NẾU CẦN HỖ TRỢ KHẨN CẤP • </span>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: inline-flex;
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    )
}
