import { useQuery } from '@tanstack/react-query'
import { getOperationalHeatmap, getAiAuditLogs } from '@/api/reports'
import { useTenant } from '@/context/TenantContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ShieldAlert, Users, Clock, ShieldCheck } from 'lucide-react'

export function CommandCenter({ fromDate, toDate }: { fromDate: string, toDate: string }) {
    const { headers, branchId } = useTenant()

    const heatmapQuery = useQuery({
        queryKey: ['operational-heatmap', branchId],
        queryFn: () => getOperationalHeatmap(branchId!, headers),
        enabled: !!branchId,
        refetchInterval: 5000 // Real-time update every 5s
    })

    const auditQuery = useQuery({
        queryKey: ['ai-audit-logs', branchId, fromDate, toDate],
        queryFn: () => getAiAuditLogs({ branchId: branchId!, fromDate, toDate }, headers),
        enabled: !!branchId
    })

    const loadData = heatmapQuery.data

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Real-time Load Indicator */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                        <Activity className="w-64 h-64 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mật độ Vận hành Real-time</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Trạng thái trực tiếp các khu vực</p>
                            </div>
                            <div className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 ${loadData?.systemLoadLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-600 animate-pulse' :
                                loadData?.systemLoadLevel === 'HIGH' ? 'bg-amber-100 text-amber-600' :
                                    'bg-emerald-100 text-emerald-600'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${loadData?.systemLoadLevel === 'CRITICAL' ? 'bg-rose-600' :
                                    loadData?.systemLoadLevel === 'HIGH' ? 'bg-amber-600' :
                                        'bg-emerald-600'
                                    }`} />
                                Tải: {loadData?.systemLoadLevel === 'NORMAL' ? 'BÌNH THƯỜNG' : (loadData?.systemLoadLevel || 'ỔN ĐỊNH')}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {Object.entries(loadData?.queueDensity || {}).map(([name, count]: [string, any], idx) => (
                                <motion.div
                                    key={name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl transition-all group/card"
                                >
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 truncate">{name}</p>
                                    <div className="flex items-end justify-between">
                                        <h4 className="text-4xl font-black text-slate-900 leading-none">{count}</h4>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${count > 10 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                            <Users className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((count / 20) * 100, 100)}%` }}
                                            className={`h-full rounded-full ${count > 15 ? 'bg-rose-500' : count > 8 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                            <Activity className="w-7 h-7 text-blue-400" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">Dự báo Vận hành Tự động</h4>
                        <p className="text-sm font-bold leading-relaxed italic text-slate-300">
                            "{loadData?.predictiveInsight || "Đang phân tích dữ liệu vận hành..."}"
                        </p>
                    </div>
                    <div className="relative z-10 mt-10">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tổng đang hoạt động</div>
                        <div className="text-5xl font-black text-white leading-none">{loadData?.totalActivePatients || 0}</div>
                    </div>
                </div>
            </div>

            {/* Quality Audit Detail Table */}
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tightest uppercase">Lịch sử Đối soát Phân loại</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Chi tiết các trường hợp điều chỉnh chuyên môn</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                            {auditQuery.data?.length || 0} Chỉ định được điều chỉnh
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                                <th className="px-10 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Bệnh nhân / Triệu chứng</th>
                                <th className="px-10 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Đánh giá hệ thống</th>
                                <th className="px-10 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Chỉ định chuyên môn</th>
                                <th className="px-10 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Lý do điều chỉnh</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {auditQuery.data?.map((log) => (
                                    <motion.tr
                                        key={log.sessionId}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-slate-300" />
                                                <span className="text-xs font-bold text-slate-600">{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="max-w-md">
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{log.patientName}</p>
                                                <p className="text-xs text-slate-400 line-clamp-1 italic">"{log.symptoms}"</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white ${log.aiSuggestedAcuity === '1' ? 'bg-rose-500' : log.aiSuggestedAcuity === '2' ? 'bg-orange-500' : 'bg-blue-500'
                                                }`}>
                                                {log.aiSuggestedAcuity}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white ${log.humanAcuity === '1' ? 'bg-rose-500' : log.humanAcuity === '2' ? 'bg-orange-500' : 'bg-blue-500'
                                                }`}>
                                                {log.humanAcuity}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">{log.overrideReason}</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {(!auditQuery.data || auditQuery.data.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Hệ thống hoạt động ổn định, không ghi nhận sai lệch chỉ định.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
