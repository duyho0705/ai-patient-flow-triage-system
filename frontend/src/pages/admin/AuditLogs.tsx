import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { 
    Activity, AlertCircle, 
    ChevronLeft, ChevronRight, MoreVertical, X, Info,
    Download, Users, ArrowRight, List, Calendar, Filter,
    ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuditLogDto } from '@/types/api'
import { getAuditLogs, getAdminDashboard } from '@/api/admin'
import { listTenants } from '@/api/tenants'
import { CustomSelect } from '@/components/CustomSelect'

const PAGE_SIZE = 20

export function AuditLogs() {
    const [page, setPage] = useState(0)
    const [tenantFilter, setTenantFilter] = useState<string>('')
    const [actionFilter, setActionFilter] = useState<string>('')
    const [daysFilter, setDaysFilter] = useState<number>(0)
    const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null)

    const startDate = useMemo(() => {
        if (daysFilter === 0) {
            return new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
        }
        const d = new Date()
        d.setDate(d.getDate() - daysFilter)
        return d.toISOString()
    }, [daysFilter])

    const { data: tenants = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: listTenants,
    })

    const { data, isLoading } = useQuery({
        queryKey: ['admin-audit-logs', tenantFilter || null, actionFilter || null, startDate, page],
        queryFn: () => getAuditLogs({
            tenantId: tenantFilter || undefined,
            action: actionFilter || undefined,
            startDate,
            page,
            size: PAGE_SIZE,
        }),
    })

    const { data: dashboard } = useQuery({
        queryKey: ['admin-dashboard-audit'],
        queryFn: getAdminDashboard
    })

    return (
        <div className="w-full animate-in fade-in duration-700 font-sans space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-end text-left">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Nhật ký hệ thống</h2>
                    <p className="text-neutral-500">Theo dõi và quản lý mọi hoạt động, thay đổi dữ liệu trong hệ thống Sống Khỏe.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <select 
                            className="appearance-none bg-white border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none cursor-pointer"
                            value={daysFilter}
                            onChange={(e) => {
                                setDaysFilter(parseInt(e.target.value))
                                setPage(0)
                            }}
                        >
                            <option value={0}>Hôm nay</option>
                            <option value={7}>7 ngày qua</option>
                            <option value={30}>30 ngày qua</option>
                            <option value={365}>1 năm qua</option>
                        </select>
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    <button 
                        onClick={() => alert('Chức năng xuất báo cáo đang được phát triển.')}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Quick Filters Area */}
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-wrap items-center gap-4">
                <div className="w-64">
                    <CustomSelect
                        options={[{ id: '', name: 'Tất cả cơ sở' }, ...tenants.map(t => ({ id: t.id, name: `${t.nameVi}` }))]}
                        value={tenantFilter}
                        onChange={(val) => {
                            setTenantFilter(val)
                            setPage(0)
                        }}
                        labelKey="name"
                        valueKey="id"
                        placeholder="Lọc theo Tenant..."
                        size="sm"
                    />
                </div>
                <div className="relative">
                    <select 
                        className="appearance-none bg-white border border-slate-200 rounded-lg pl-10 pr-10 py-2 text-sm focus:ring-primary-500 outline-none cursor-pointer min-w-[200px]"
                        value={actionFilter}
                        onChange={(e) => {
                            setActionFilter(e.target.value)
                            setPage(0)
                        }}
                    >
                        <option value="">Tất cả loại hành động</option>
                        <option value="LOGIN">Đăng nhập</option>
                        <option value="CREATE">Tạo mới</option>
                        <option value="UPDATE">Cập nhật</option>
                        <option value="DELETE">Xóa</option>
                        <option value="SET_PASSWORD">Đổi mật khẩu</option>
                        <option value="VITAL_SIGNS_SUBMIT">Gửi chỉ số</option>
                    </select>
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center relative">
                        <List className="w-6 h-6 fill-current opacity-20 absolute" />
                        <List className="w-6 h-6 relative" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Tổng số log</p>
                        <p className="text-2xl font-bold text-slate-900">{data?.totalElements?.toLocaleString('vi-VN') ?? '0'}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center relative">
                        <AlertCircle className="w-6 h-6 fill-current opacity-20 absolute" />
                        <AlertCircle className="w-6 h-6 relative" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Lỗi hôm nay</p>
                        <p className="text-2xl font-bold text-slate-900">{dashboard?.failedAuditLogs ?? 0}</p>
                    </div>
                    {(dashboard?.failedAuditLogs ?? 0) === 0 && (
                        <div className="absolute top-4 right-4 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Ổn định</div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center relative">
                        <Users className="w-6 h-6 fill-current opacity-20 absolute" />
                        <Users className="w-6 h-6 relative" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Người dùng hoạt động</p>
                        <p className="text-2xl font-bold text-slate-900">{dashboard?.activeUsers?.toLocaleString('vi-VN') ?? '0'}</p>
                    </div>
                </div>
            </div>

            {/* Log Table Container */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-20 text-center">
                        <Activity className="w-10 h-10 text-gray-200 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Đang tải nhật ký...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thời gian</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Địa chỉ IP</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Trạng thái</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(data?.content ?? []).map((log: AuditLogDto, idx: number) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.01 }}
                                            className="hover:bg-gray-50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                                        {log.userEmail?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 leading-none mb-1">
                                                            {log.userEmail?.split('@')[0] || 'Hệ thống'}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 truncate max-w-[150px]">
                                                            {log.userEmail || 'system@songkhoe.vn'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        log.action.includes('CREATE') ? 'bg-emerald-500' :
                                                        log.action.includes('DELETE') ? 'bg-red-500' :
                                                        log.action.includes('UPDATE') ? 'bg-blue-500' : 'bg-amber-500'
                                                    }`} />
                                                    <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                                                        {log.details || log.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <p className="text-sm text-gray-600">{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</p>
                                                    <p className="text-[11px] text-gray-400">{new Date(log.timestamp).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                                {log.ipAddress || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                    log.status === 'SUCCESS' || log.action.includes('SUCCESS') 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {log.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Matching Client.html */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-500">
                                Hiển thị <span className="font-semibold text-gray-900">{(data?.page ?? 0) * PAGE_SIZE + 1}-{Math.min(((data?.page ?? 0) + 1) * PAGE_SIZE, data?.totalElements ?? 0)}</span> trong số <span className="font-semibold text-gray-900">{data?.totalElements?.toLocaleString()}</span> kết quả
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={data?.first}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {/* Show current page and neighbors */}
                                    {Array.from({ length: Math.min(5, data?.totalPages ?? 0) }, (_, i) => {
                                        const pageNum = i + 1;
                                        const isActive = (data?.page ?? 0) + 1 === pageNum;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(i)}
                                                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                                                    isActive 
                                                    ? 'bg-[#0d9488] text-white shadow-md' 
                                                    : 'bg-transparent text-gray-600 hover:bg-white hover:shadow-sm'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    {(data?.totalPages ?? 0) > 5 && (
                                        <>
                                            <span className="px-1 text-gray-400">...</span>
                                            <button 
                                                onClick={() => setPage((data?.totalPages ?? 1) - 1)}
                                                className="w-10 h-10 bg-transparent text-gray-600 hover:bg-white rounded-lg font-medium text-sm"
                                            >
                                                {data?.totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    disabled={data?.last}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-[#0d9488] transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <AnimatePresence>
                {selectedLog && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setSelectedLog(null)}
                        />

                        {/* Modal Container */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col z-10"
                        >
                            <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#0d9488] dark:bg-primary/20 text-white dark:text-primary rounded-xl shadow-lg">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-none font-display">Chi tiết Nhật ký</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{selectedLog.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="p-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Thời điểm</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(selectedLog.timestamp).toLocaleString('vi-VN')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">IP Address</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{selectedLog.ipAddress || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Trạng thái</p>
                                        <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">{selectedLog.status}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mô tả hành động</p>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 italic text-slate-600 dark:text-slate-400">
                                        {selectedLog.details}
                                    </div>
                                </div>

                                {(selectedLog.oldValue || selectedLog.newValue) && (
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Thay đổi dữ liệu</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Trước (Old Value)</span>
                                                <div className="p-5 bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl max-h-[300px] overflow-auto">
                                                    <pre className="text-[11px] font-mono whitespace-pre-wrap text-rose-700 dark:text-rose-400">
                                                        {selectedLog.oldValue ? JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2) : 'No data'}
                                                    </pre>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Sau (New Value)</span>
                                                <div className="p-5 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl max-h-[300px] overflow-auto relative group">
                                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm hidden md:block z-10">
                                                        <ArrowRight className="w-3 h-3 text-slate-300" />
                                                    </div>
                                                    <pre className="text-[11px] font-mono whitespace-pre-wrap text-emerald-700 dark:text-emerald-400">
                                                        {selectedLog.newValue ? JSON.stringify(JSON.parse(selectedLog.newValue), null, 2) : 'No data'}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">User Agent</p>
                                    <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl text-[10px] font-mono text-slate-400 break-all">
                                        {selectedLog.userAgent || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>
        </div>
    )
}
