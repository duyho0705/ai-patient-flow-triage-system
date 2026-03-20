import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { 
    Activity, 
    ChevronLeft, ChevronRight, MoreVertical, X, Info,
    Download, ArrowRight, Calendar, Filter,
    ChevronDown, ShieldAlert, History, Laptop, Globe,
    Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuditLogDto } from '@/types/api'
import { getAuditLogs, getAdminDashboard } from '@/api/admin'
import { listTenants } from '@/api/tenants'
import { CustomSelect } from '@/components/CustomSelect'

const PAGE_SIZE = 15

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
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10 pb-20 bg-md-background font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">Audit Log</h2>
                    <p className="text-md-on-surface-variant font-medium opacity-70">
                        Giám sát tính toàn vẹn và lịch sử vận hành hệ thống.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                         <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-md-on-surface-variant opacity-40 group-focus-within:text-md-primary group-focus-within:opacity-100 transition-all pointer-events-none" />
                        <select 
                            className="appearance-none h-12 bg-md-surface-container border border-md-outline/10 rounded-2xl pl-12 pr-10 text-sm font-bold text-md-on-surface hover:bg-md-primary/5 transition-all outline-none cursor-pointer min-w-[160px]"
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
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-md-on-surface-variant opacity-40 pointer-events-none" />
                    </div>
                    <button 
                        onClick={() => alert('Chức năng xuất báo cáo đang được phát triển.')}
                        className="flex items-center gap-2 h-12 px-6 bg-md-primary text-white rounded-full font-bold text-sm shadow-elevation-2 hover:shadow-elevation-4 transition-all active:scale-95 group"
                    >
                        <Download className="size-4 group-hover:translate-y-0.5 transition-transform" />
                        <span>Xuất CSV</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AuditStatCard label="Tổng nhật ký" value={data?.totalElements?.toLocaleString('vi-VN') ?? '0'} icon={History} color="primary" />
                <AuditStatCard label="Sự cố 24h" value={dashboard?.failedAuditLogs ?? 0} icon={ShieldAlert} color="error" />
                <AuditStatCard label="Tỷ lệ Thành công" value="99.9%" icon={Activity} color="primary" isSecondary />
            </div>

            {/* Filters Area */}
            <div className="bg-md-surface-container rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-4 border border-md-outline/5 shadow-sm">
                 <div className="flex-1 w-full text-left">
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
                        size="md"
                    />
                </div>
                <div className="relative group w-full md:w-auto">
                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-md-on-surface-variant opacity-40 group-focus-within:text-md-primary group-focus-within:opacity-100 transition-all pointer-events-none" />
                    <select 
                        className="appearance-none h-14 bg-md-surface-container-low border border-md-outline/10 rounded-2xl pl-12 pr-14 text-sm font-bold text-md-on-surface outline-none cursor-pointer min-w-[240px] focus:ring-4 focus:ring-md-primary/10 transition-all"
                        value={actionFilter}
                        onChange={(e) => {
                            setActionFilter(e.target.value)
                            setPage(0)
                        }}
                    >
                        <option value="">Toàn bộ hành động</option>
                        <option value="LOGIN">Đăng nhập</option>
                        <option value="CREATE">Tạo mới</option>
                        <option value="UPDATE">Cập nhật</option>
                        <option value="DELETE">Xóa</option>
                        <option value="SET_PASSWORD">Đổi mật khẩu</option>
                        <option value="VITAL_SIGNS_SUBMIT">Gửi chỉ số</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 size-4 text-md-on-surface-variant opacity-40 pointer-events-none" />
                </div>
            </div>

            {/* Main Content (Table) */}
            <div className="bg-md-surface-container-lowest rounded-[2.5rem] border border-md-outline/10 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="size-12 animate-spin text-md-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-md-on-surface-variant animate-pulse italic">Tri xuất dữ liệu từ Audit Core...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-md-surface-container-low/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Người thực hiện</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Thao tác</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Thời gian</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Địa chỉ IP</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60 text-center">Kết cục</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60 text-right">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-md-outline/5">
                                    {(data?.content ?? []).map((log: AuditLogDto, idx: number) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="hover:bg-md-surface-container-low/30 transition-colors group"
                                        >
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-full bg-md-surface-container flex items-center font-black text-xs justify-center text-md-primary border border-md-outline/10 group-hover:scale-110 transition-transform">
                                                        {(log.userName || log.userEmail)?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-md-on-surface group-hover:text-md-primary transition-colors">
                                                            {log.userName || log.userEmail?.split('@')[0] || 'Hệ thống'}
                                                        </span>
                                                        <span className="text-[10px] text-md-on-surface-variant italic font-medium opacity-50">
                                                            {log.userEmail || 'system.agent@songkhoe.vn'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2 max-w-[200px]">
                                                    <div className={`size-1.5 rounded-full shrink-0 ${
                                                        log.action.includes('CREATE') ? 'bg-emerald-500' :
                                                        log.action.includes('DELETE') ? 'bg-md-error' :
                                                        log.action.includes('UPDATE') ? 'bg-md-primary' : 'bg-amber-500'
                                                    }`} />
                                                    <span className="text-xs font-bold text-md-on-surface-variant truncate">
                                                        {log.details || log.action}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-bold text-md-on-surface">{new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                    <span className="text-[10px] text-md-outline opacity-60 italic">{new Date(log.timestamp).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-[11px] font-black text-md-on-surface-variant/40 font-mono tracking-tighter italic">
                                                    {log.ipAddress || 'Internal'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    log.status === 'SUCCESS' || log.action.includes('SUCCESS') 
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                    : 'bg-md-error-container text-md-on-error-container border border-md-error/10'
                                                }`}>
                                                    {log.status === 'SUCCESS' ? 'Xác thực' : 'Sự cố'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button 
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-3 text-md-on-surface-variant hover:text-md-primary hover:bg-md-primary/10 rounded-2xl transition-all active:scale-90"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Area */}
                        <div className="p-8 bg-md-surface-container-low/30 border-t border-md-outline/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-40">
                                Page <span className="text-md-primary">{(data?.page ?? 0) + 1}</span> of <span className="text-md-on-surface">{data?.totalPages ?? 1}</span> ({data?.totalElements?.toLocaleString()} logs synchronized)
                            </p>
                            <div className="flex items-center gap-3">
                                <PaginationButton 
                                    disabled={data?.first} 
                                    onClick={() => setPage(p => p - 1)} 
                                    icon={ChevronLeft} 
                                />
                                
                                <div className="flex gap-1.5 px-3 py-1.5 bg-md-surface-container rounded-2xl border border-md-outline/10 shadow-inner">
                                    {Array.from({ length: Math.min(5, data?.totalPages ?? 0) }, (_, i) => {
                                        const pageNum = i + 1;
                                        const isActive = (data?.page ?? 0) + 1 === pageNum;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(i)}
                                                className={`size-9 rounded-xl text-[11px] font-black transition-all ${
                                                    isActive 
                                                    ? 'bg-md-primary text-white shadow-lg' 
                                                    : 'text-md-on-surface-variant hover:bg-white/50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <PaginationButton 
                                    disabled={data?.last} 
                                    onClick={() => setPage(p => p + 1)} 
                                    icon={ChevronRight} 
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedLog && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-md-on-surface/40 backdrop-blur-sm"
                            onClick={() => setSelectedLog(null)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-elevation-5 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col z-10"
                        >
                            <div className="p-8 border-b border-md-outline/10 flex items-center justify-between bg-white/80 backdrop-blur-md text-left">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 bg-md-primary/10 text-md-primary rounded-2xl flex items-center justify-center shadow-lg">
                                        <Info size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-md-on-surface tracking-tight leading-none">Chi tiết Bản ghi Vận hành</h3>
                                        <p className="text-[10px] font-black text-md-outline uppercase tracking-[0.2em] mt-1.5 opacity-60">ID: {selectedLog.id?.substring(0, 16)}...</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="p-4 bg-md-surface-container border border-md-outline/10 hover:text-md-primary rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-12 CustomScrollbar text-left">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                    <DetailField label="Timestamp" value={new Date(selectedLog.timestamp).toLocaleString('vi-VN')} icon={History} />
                                    <DetailField label="Audit Status" value={selectedLog.status} icon={Activity} isStatus />
                                    <DetailField label="Network IP" value={selectedLog.ipAddress || 'Internal'} icon={Globe} isMono />
                                    <DetailField label="System Agent" value="Auth-Service-01" icon={Laptop} />
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-md-outline uppercase tracking-widest pl-1">Chủ thể thực thi</h5>
                                    <div className="p-6 bg-md-surface-container-low rounded-3xl border border-md-outline/10 flex items-center gap-6">
                                         <div className="size-16 rounded-2xl bg-md-primary/10 text-md-primary flex items-center justify-center text-xl font-black italic">
                                            {selectedLog.userEmail?.charAt(0).toUpperCase() || 'S'}
                                         </div>
                                         <div className="flex flex-col">
                                            <span className="text-lg font-bold text-md-on-surface">{selectedLog.userEmail || 'System Core'}</span>
                                            <span className="text-[11px] font-medium text-md-on-surface-variant opacity-60 italic">Định danh xác thực đa lớp từ API Gateway</span>
                                         </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-md-outline uppercase tracking-widest pl-1">Payload Chi tiết</h5>
                                    <div className="p-8 bg-md-on-surface text-white rounded-[2.5rem] border border-white/10 italic text-sm leading-relaxed shadow-lg">
                                        "{selectedLog.details || 'Không có mô tả chi tiết cho hành động này.'}"
                                    </div>
                                </div>

                                {(selectedLog.oldValue || selectedLog.newValue) && (
                                    <div className="space-y-6">
                                        <h5 className="text-[10px] font-black text-md-outline uppercase tracking-widest pl-1">Biến động Dữ liệu (State Diff)</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <JsonBlock label="Trước (Source State)" data={selectedLog.oldValue} color="error" />
                                            <JsonBlock label="Sau (Target State)" data={selectedLog.newValue} color="success" />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <h5 className="text-[10px] font-black text-md-outline uppercase tracking-widest pl-1">Tri xuất dấu vết Laptop/Browser</h5>
                                    <div className="p-5 bg-md-surface-container border border-md-outline/10 rounded-2xl text-[10px] font-mono text-md-on-surface-variant break-all opacity-60">
                                        {selectedLog.userAgent || 'X-API-Client-SongKhoe-Mobile/1.0.0 (Internal-Request)'}
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

/* --- Helpers --- */

function AuditStatCard({ label, value, icon: Icon, color, isSecondary }: any) {
    const styles: any = {
        primary: 'bg-md-primary/10 text-md-primary border-md-primary/10',
        error: 'bg-md-error-container text-md-on-error-container border-md-error/10'
    }
    return (
        <div className="bg-md-surface-container-lowest p-6 rounded-[2.5rem] border border-md-outline/10 shadow-sm flex items-center gap-6 group hover:shadow-elevation-2 transition-all">
            <div className={`size-16 rounded-[1.5rem] flex items-center justify-center border shadow-sm group-hover:rotate-6 transition-transform ${isSecondary ? 'bg-md-secondary-container text-md-on-secondary-container border-md-secondary/10' : styles[color]}`}>
                <Icon size={28} />
            </div>
            <div className="text-left">
                 <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-40 italic font-sans leading-none">{label}</p>
                 <h4 className="text-3xl font-black text-md-on-surface tracking-tighter mt-2">{value}</h4>
            </div>
        </div>
    )
}

function PaginationButton({ disabled, onClick, icon: Icon }: any) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className="size-12 rounded-2xl bg-md-surface-container-low border border-md-outline/10 text-md-on-surface-variant hover:text-md-primary hover:bg-white transition-all shadow-sm active:scale-90 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
        >
            <Icon size={20} />
        </button>
    )
}

function DetailField({ label, value, icon: Icon, isStatus, isMono }: any) {
    return (
        <div className="space-y-2">
            <p className="flex items-center gap-2 text-[9px] font-black text-md-outline uppercase tracking-widest leading-none mb-1">
                <Icon size={12} className="opacity-40" />
                {label}
            </p>
            <p className={`text-sm font-bold ${isStatus ? 'text-emerald-600' : 'text-md-on-surface'} ${isMono ? 'font-mono text-xs opacity-60' : ''}`}>
                {value}
            </p>
        </div>
    )
}

function JsonBlock({ label, data, color }: any) {
    const isError = color === 'error'
    let content = 'No State Trace'
    try { if (data) content = JSON.stringify(JSON.parse(data), null, 2) } catch(e) { content = data }

    return (
        <div className="space-y-3">
             <div className="flex items-center justify-between px-2">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isError ? 'text-md-error' : 'text-emerald-600'}`}>{label}</span>
                {isError ? <ArrowRight size={12} className="text-md-outline opacity-20" /> : <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />}
             </div>
             <div className={`p-6 rounded-3xl border ${isError ? 'bg-md-error-container/20 border-md-error/10' : 'bg-emerald-50/20 border-emerald-100'} max-h-[300px] overflow-auto CustomScrollbar`}>
                <pre className={`text-[11px] font-mono whitespace-pre-wrap leading-relaxed ${isError ? 'text-md-on-error-container' : 'text-emerald-700'}`}>
                    {content}
                </pre>
             </div>
        </div>
    )
}
