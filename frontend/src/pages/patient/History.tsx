import { useQuery } from '@tanstack/react-query'
import { getPortalHistory } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import {
    Stethoscope,
    ChevronRight,
    Calendar,
    Search,
    Filter,
    History as HistoryIcon,
    AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PatientHistory() {
    const { headers } = useTenant()
    const [searchTerm, setSearchTerm] = useState('')

    const { data: history, isLoading } = useQuery({
        queryKey: ['portal-history'],
        queryFn: () => getPortalHistory(headers),
        enabled: !!headers?.tenantId
    })

    const filteredHistory = history?.filter(h =>
        h.diagnosisNotes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lịch sử Khám bệnh</h1>
                <p className="text-slate-500 font-medium mt-1">Nơi tập trung toàn bộ dữ liệu y tế cá nhân của bạn.</p>
            </header>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm theo bác sĩ hoặc chẩn đoán..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 p-4 bg-white border border-slate-100 rounded-[1.5rem] text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-white rounded-[2.5rem] animate-pulse" />
                    ))
                ) : (filteredHistory && filteredHistory.length > 0) ? (
                    filteredHistory.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link
                                to={`/patient/history/${item.id}`}
                                className="group block bg-white border border-slate-50 rounded-[2.5rem] p-6 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-sm">
                                            <Stethoscope className="w-7 h-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {item.status === 'COMPLETED' ? 'Hoàn tất' : 'Đang khám'}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[10px]">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(item.startedAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {item.diagnosisNotes || 'Kết quả đang được cập nhật...'}
                                            </h4>
                                            {item.chiefComplaintSummary && (
                                                <p className="text-sm font-medium text-slate-500 line-clamp-1 italic">
                                                    "{item.chiefComplaintSummary}"
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 pt-1">
                                                <p className="text-xs font-medium text-slate-400">
                                                    BS. <span className="text-slate-700 font-bold">{item.doctorName}</span>
                                                </p>
                                                {item.acuityLevel && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${item.acuityLevel === '1' ? 'bg-red-500 animate-pulse' :
                                                            item.acuityLevel === '2' ? 'bg-orange-500' :
                                                                item.acuityLevel === '3' ? 'bg-yellow-500' :
                                                                    'bg-blue-500'
                                                            }`} />
                                                        <span className="text-[10px] font-black uppercase text-slate-400">Priority {item.acuityLevel}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end md:justify-start gap-4">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Mã phiên</p>
                                            <p className="text-xs font-bold text-slate-500">#{item.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))
                ) : (
                    <div className="bg-white rounded-[3rem] py-24 text-center border border-slate-100 border-dashed">
                        <HistoryIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-900">Không tìm thấy dữ liệu</h3>
                        <p className="text-slate-400 font-medium">Bạn chưa thực hiện ca khám nào tại hệ thống của chúng tôi.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
