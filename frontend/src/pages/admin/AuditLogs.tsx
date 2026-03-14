import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/api/admin'
import { listTenants } from '@/api/tenants'
import { CustomSelect } from '@/components/CustomSelect'
import {
    History,
    ChevronLeft, ChevronRight,
    User, Activity, Clock, Globe, Info, X, ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuditLogDto } from '@/types/api'

const PAGE_SIZE = 20

export function AuditLogs() {
    const [page, setPage] = useState(0)
    const [tenantFilter, setTenantFilter] = useState<string>('')
    const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null)

    const { data: tenants = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: listTenants,
    })

    const { data, isLoading } = useQuery({
        queryKey: ['admin-audit-logs', tenantFilter || null, page],
        queryFn: () => getAuditLogs({
            tenantId: tenantFilter || undefined,
            page,
            size: PAGE_SIZE,
        }),
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nhật ký Hệ thống</h1>
                    <p className="text-slate-500 font-medium text-sm">Theo dõi các hoạt động quan trọng, thay đổi dữ liệu và truy cập.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Dòng thời gian hoạt động</h2>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-80">
                        <CustomSelect
                            options={[{ id: '', name: 'Tất cả cơ sở' }, ...tenants.map(t => ({ id: t.id, name: `${t.nameVi}` }))]}
                            value={tenantFilter}
                            onChange={(val) => {
                                setTenantFilter(val)
                                setPage(0)
                            }}
                            labelKey="name"
                            valueKey="id"
                            placeholder="Lọc theo Phòng khám..."
                            size="sm"
                            className="flex-1"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-20 text-center">
                        <Activity className="w-10 h-10 text-slate-200 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải nhật ký...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Người thực hiện</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Đối tượng</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Truy cập</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(data?.content ?? []).map((log: AuditLogDto, idx: number) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.01 }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                    <span className="text-xs font-bold text-slate-500">{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 tracking-tight">{log.userEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-600' :
                                                    log.action.includes('UPDATE') || log.action.includes('SET') ? 'bg-amber-50 text-amber-600' :
                                                        log.action.includes('DELETE') ? 'bg-rose-50 text-rose-600' :
                                                            'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-700 tracking-tight uppercase">{log.entityName}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 font-mono truncate max-w-[120px]">{log.entityId}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-3.5 h-3.5 text-slate-300" />
                                                    <span className="text-[10px] font-mono font-bold text-slate-500">{log.ipAddress || 'Unknown IP'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Info className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {data && data.totalPages > 1 && (
                            <div className="p-8 border-t border-slate-50 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Trang {data.page + 1} / {data.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={data.first}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        disabled={data.last}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Chi tiết Nhật ký</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedLog.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời điểm</p>
                                        <p className="text-sm font-bold text-slate-900">{new Date(selectedLog.timestamp).toLocaleString('vi-VN')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</p>
                                        <p className="text-sm font-bold text-slate-900 font-mono">{selectedLog.ipAddress || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</p>
                                        <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">{selectedLog.status}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả hành động</p>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600">
                                        {selectedLog.details}
                                    </div>
                                </div>

                                {(selectedLog.oldValue || selectedLog.newValue) && (
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thay đổi dữ liệu</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Trước (Old Value)</span>
                                                <div className="p-5 bg-rose-50/30 border border-rose-100 rounded-2xl max-h-[300px] overflow-auto">
                                                    <pre className="text-[11px] font-mono whitespace-pre-wrap text-rose-700">
                                                        {selectedLog.oldValue ? JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2) : 'No data'}
                                                    </pre>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Sau (New Value)</span>
                                                <div className="p-5 bg-emerald-50/30 border border-emerald-100 rounded-2xl max-h-[300px] overflow-auto relative group">
                                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white border border-slate-100 rounded-full shadow-sm hidden md:block">
                                                        <ArrowRight className="w-3 h-3 text-slate-300" />
                                                    </div>
                                                    <pre className="text-[11px] font-mono whitespace-pre-wrap text-emerald-700">
                                                        {selectedLog.newValue ? JSON.stringify(JSON.parse(selectedLog.newValue), null, 2) : 'No data'}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Agent</p>
                                    <div className="p-4 bg-slate-100/50 rounded-xl text-[10px] font-mono text-slate-400 break-all">
                                        {selectedLog.userAgent || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
