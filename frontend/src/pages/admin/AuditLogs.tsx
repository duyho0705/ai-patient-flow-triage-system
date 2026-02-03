import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/api/admin'
import { listTenants } from '@/api/tenants'
import { CustomSelect } from '@/components/CustomSelect'
import {
    History,
    ChevronLeft, ChevronRight,
    User, Activity, Database, Clock
} from 'lucide-react'
import { motion } from 'framer-motion'

const PAGE_SIZE = 20

export function AuditLogs() {
    const [page, setPage] = useState(0)
    const [tenantFilter, setTenantFilter] = useState<string>('')

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
                            options={[{ id: '', name: 'Tất cả Tenant' }, ...tenants.map(t => ({ id: t.id, name: `${t.nameVi}` }))]}
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
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(data?.content ?? []).map((log, idx) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                    <span className="text-xs font-bold text-slate-500">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
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
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600' :
                                                    log.action === 'UPDATE' ? 'bg-amber-50 text-amber-600' :
                                                        log.action === 'DELETE' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Database className="w-3.5 h-3.5 text-slate-300" />
                                                    <span className="text-xs font-bold text-slate-700">{log.resourceType}: {log.resourceId}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-medium text-slate-500 max-w-xs truncate" title={log.details}>
                                                    {log.details}
                                                </p>
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
        </div>
    )
}
