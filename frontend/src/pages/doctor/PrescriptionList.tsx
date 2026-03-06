import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { useQuery } from '@tanstack/react-query'
import { getDoctorPrescriptions } from '@/api/doctor'
import { Loader2, FileX, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PrescriptionDto } from '@/types/api'

export function PrescriptionList() {
    const { headers, tenantId } = useTenant()
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const pageSize = 10

    // ─── Fetch Real Data ───
    const { data: prescriptionPage, isLoading } = useQuery({
        queryKey: ['doctor-prescriptions', tenantId, currentPage, pageSize],
        queryFn: () => getDoctorPrescriptions(headers, currentPage, pageSize),
        enabled: !!tenantId
    })

    const prescriptions: PrescriptionDto[] = prescriptionPage?.content || []
    const totalElements = prescriptionPage?.totalElements || 0
    const totalPages = prescriptionPage?.totalPages || 1

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ISSUED':
                return 'bg-primary/20 text-primary'
            case 'DISPENSED':
                return 'bg-blue-100 text-blue-600'
            case 'DRAFT':
                return 'bg-amber-100 text-amber-600'
            case 'CANCELLED':
                return 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
            default:
                return 'bg-slate-100 dark:bg-slate-800 text-slate-500'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ISSUED': return 'Đã kê'
            case 'DISPENSED': return 'Đã phát'
            case 'DRAFT': return 'Nháp'
            case 'CANCELLED': return 'Đã hủy'
            default: return status
        }
    }

    // ─── Pagination helpers ───
    const getPageNumbers = () => {
        const pages: (number | '...')[] = []
        if (totalPages <= 5) {
            for (let i = 0; i < totalPages; i++) pages.push(i)
        } else {
            pages.push(0)
            if (currentPage > 2) pages.push('...')
            for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
                pages.push(i)
            }
            if (currentPage < totalPages - 3) pages.push('...')
            pages.push(totalPages - 1)
        }
        return pages
    }

    // ─── Filter client-side by search ───
    const filtered = searchTerm
        ? prescriptions.filter(p =>
            p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : prescriptions

    return (
        <div className="flex-1 p-8 space-y-6 animate-in fade-in duration-700 font-display transition-all">
            {/* Page Title & CTA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Quản lý đơn thuốc điện tử</h2>
                    <p className="text-slate-500 text-sm mt-1">Theo dõi và quản lý lịch sử kê đơn của bệnh nhân</p>
                </div>
                <Link
                    to="/consultation"
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined">add_notes</span>
                    <span>Kê đơn thuốc điện tử</span>
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Prescription List Section */}
                <div className="flex-1 space-y-4 min-w-0">
                    {/* Toolbar (Filters) */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 shadow-sm">
                        <div className="flex-1 min-w-[240px]">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 px-1 uppercase tracking-wider">Tìm kiếm đơn thuốc</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-primary transition-colors">search</span>
                                <input
                                    type="text"
                                    placeholder="Mã đơn, tên bệnh nhân..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-semibold"
                                />
                            </div>
                        </div>
                        <div className="w-40">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 px-1 uppercase tracking-wider">Trạng thái</label>
                            <div className="relative">
                                <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer font-semibold">
                                    <option>Tất cả</option>
                                    <option>Đã kê</option>
                                    <option>Đã phát</option>
                                    <option>Nháp</option>
                                    <option>Đã hủy</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                            </div>
                        </div>
                        <div className="w-48">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 px-1 uppercase tracking-wider">Thời gian</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-primary transition-colors">calendar_month</span>
                                <select className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer font-semibold">
                                    <option>7 ngày qua</option>
                                    <option>30 ngày qua</option>
                                    <option>Tháng này</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="h-[30vh] flex flex-col items-center justify-center gap-4 text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                            <p className="font-bold text-sm uppercase tracking-widest">Đang tải đơn thuốc...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="h-[30vh] flex flex-col items-center justify-center gap-4 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <FileX className="w-12 h-12 opacity-20" />
                            <p className="font-bold text-sm">{searchTerm ? 'Không tìm thấy đơn thuốc phù hợp' : 'Chưa có đơn thuốc nào'}</p>
                        </div>
                    ) : (
                        /* Table Card */
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã đơn</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bệnh nhân</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ghi chú</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Số thuốc</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filtered.map((px) => (
                                            <tr key={px.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-6 py-4 text-sm font-bold text-primary">
                                                    #{px.id?.slice(0, 8).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-400">
                                                            {px.patientName?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{px.patientName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px]">
                                                    {px.notes || '–'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {px.items?.length || 0} thuốc
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusStyle(px.status)}`}>
                                                        {getStatusLabel(px.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg text-slate-400 transition-all active:scale-90" title="Xem chi tiết">
                                                            <span className="material-symbols-outlined text-xl">visibility</span>
                                                        </button>
                                                        <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg text-slate-400 transition-all active:scale-90" title="In PDF">
                                                            <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                                                        </button>
                                                        <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg text-slate-400 transition-all active:scale-90" title="Tái bản đơn">
                                                            <span className="material-symbols-outlined text-xl">history_edu</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/10">
                                <p className="text-xs text-slate-500 font-medium italic">
                                    Hiển thị {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, totalElements)} trên {totalElements} đơn thuốc
                                </p>
                                <div className="flex gap-1 items-center">
                                    <button
                                        className="size-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 disabled:opacity-50 transition-colors"
                                        disabled={currentPage === 0}
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {getPageNumbers().map((page, idx) =>
                                        page === '...' ? (
                                            <span key={`dots-${idx}`} className="px-1 text-slate-400 font-bold">...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page as number)}
                                                className={`size-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${currentPage === page
                                                    ? 'bg-primary text-slate-900 shadow-md shadow-primary/20'
                                                    : 'border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-500'
                                                    }`}
                                            >
                                                {(page as number) + 1}
                                            </button>
                                        )
                                    )}
                                    <button
                                        className="size-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 disabled:opacity-50 transition-colors"
                                        disabled={currentPage >= totalPages - 1}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    {/* Templates Card */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tight">
                            <span className="p-1.5 bg-primary/20 rounded-lg text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                            </span>
                            Đơn thuốc mẫu phổ biến
                        </h3>
                        <div className="space-y-3">
                            {[
                                { title: 'Đơn thuốc cảm cúm cơ bản', desc: '3 thuốc - Phổ biến nhất' },
                                { title: 'Phác đồ Viêm dạ dày HP+', desc: '5 thuốc - Theo chuẩn Bộ Y tế' },
                                { title: 'Hỗ trợ hạ men gan', desc: '2 thuốc - Thực phẩm chức năng' }
                            ].map((template, idx) => (
                                <button
                                    key={idx}
                                    className="w-full text-left p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all group active:scale-[0.98]"
                                >
                                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{template.title}</p>
                                    <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">{template.desc}</p>
                                </button>
                            ))}
                            <button className="block w-full text-center text-xs font-black text-primary mt-4 hover:underline uppercase tracking-widest">
                                Xem thêm mẫu khác
                            </button>
                        </div>
                    </div>

                    {/* Recent History Card — from real data */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tight">
                            <span className="p-1.5 bg-primary/20 rounded-lg text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">history</span>
                            </span>
                            Kê đơn gần đây
                        </h3>
                        <div className="space-y-4">
                            {prescriptions.length > 0 ? (
                                prescriptions.slice(0, 3).map((px, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                        <div className="size-2 mt-2 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform shadow-sm shadow-primary/40"></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{px.patientName}</p>
                                            <p className="text-[10px] text-slate-400 italic mt-0.5 font-medium">
                                                {px.items?.length || 0} thuốc • {getStatusLabel(px.status)}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300 self-center group-hover:translate-x-1 transition-transform text-sm">chevron_right</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic text-center py-4">Chưa có đơn thuốc nào</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
