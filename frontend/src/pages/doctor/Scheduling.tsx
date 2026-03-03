import { useQuery } from '@tanstack/react-query'
import { getPortalAppointments, getPortalBranches } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import {
    MapPin,
    PlusCircle,
    ChevronLeft,
    ChevronRight,
    Video,
    Clock,
    Edit3,
    XCircle,
    PlusCircle as AddIcon,
} from 'lucide-react'


export default function Scheduling() {
    const { headers } = useTenant()

    const { isLoading } = useQuery({
        queryKey: ['staff-appointments'],
        queryFn: () => getPortalAppointments(headers),
        enabled: !!headers?.tenantId,
    })

    const { data: branches } = useQuery({
        queryKey: ['portal-branches'],
        queryFn: () => getPortalBranches(headers),
        enabled: !!headers?.tenantId,
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang tải lịch hẹn...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700 font-display">
            {/* ─── Header Section ─── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                        Lịch hẹn & Điều phối
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Quản lý lịch khám, tư vấn trực tuyến và điều phối phòng khám chuyên sâu.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {branches && branches.length > 0 && (
                        <select className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-primary/20 focus:border-primary shadow-sm min-w-[180px]">
                            <option value="">Tất cả chi nhánh</option>
                            {branches.map((b: any) => (
                                <option key={b.id} value={b.id}>{b.nameVi || b.code}</option>
                            ))}
                        </select>
                    )}
                    <button className="bg-primary text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
                        <PlusCircle className="w-4 h-4" /> Đặt lịch mới
                    </button>
                </div>
            </div>

            {/* ─── Main Content Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Calendar View (lg:col-span-8) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Tháng 10, 2023</h3>
                                <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-r border-slate-200 dark:border-slate-700">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                                <button className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-600 rounded-md shadow-sm">Tháng</button>
                                <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Tuần</button>
                                <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Ngày</button>
                            </div>
                        </div>

                        <div className="p-6 overflow-x-auto">
                            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden min-w-[600px]">
                                {/* Weekdays */}
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                    <div key={day} className="bg-slate-50 dark:bg-slate-800 p-2 text-center text-xs font-bold text-slate-400 capitalize">
                                        {day}
                                    </div>
                                ))}

                                {/* Calendar Days (Representative Mockup) */}
                                {/* Offset for Start (Assume Oct 2023 starts on Sunday, but HTML example suggests offset 3) */}
                                {[...Array(3)].map((_, i) => (
                                    <div key={`offset-${i}`} className="bg-white dark:bg-slate-800 min-h-[100px] p-2 opacity-50" />
                                ))}

                                {/* Real Days */}
                                {[...Array(31)].map((_, i) => {
                                    const day = i + 1;
                                    const isToday = day === 5;
                                    return (
                                        <div
                                            key={day}
                                            className={`bg-white dark:bg-slate-800 min-h-[100px] p-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer relative group ${isToday ? 'bg-primary/5 dark:bg-primary/10 ring-2 ring-inset ring-primary' : ''}`}
                                        >
                                            <span className={`text-sm font-medium ${isToday ? 'font-bold text-primary underline underline-offset-4 decoration-2' : ''}`}>
                                                {day}
                                            </span>
                                            {day === 5 && (
                                                <div className="mt-2 space-y-1">
                                                    <div className="text-[10px] p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border-l-2 border-blue-500 truncate">
                                                        8:00 - Nguyễn Vy
                                                    </div>
                                                    <div className="text-[10px] p-1 bg-primary/20 dark:bg-primary/30 text-primary-dark rounded border-l-2 border-primary truncate">
                                                        9:30 - Trần Đạt
                                                    </div>
                                                    <div className="text-[10px] p-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded border-l-2 border-slate-400 truncate">
                                                        +22 khác
                                                    </div>
                                                </div>
                                            )}
                                            {day === 6 && (
                                                <div className="mt-2 flex gap-1 flex-wrap">
                                                    <div className="size-1.5 rounded-full bg-blue-500" />
                                                    <div className="size-1.5 rounded-full bg-amber-500" />
                                                </div>
                                            )}
                                            {day === 10 && (
                                                <div className="mt-2 flex gap-1 flex-wrap">
                                                    <div className="size-1.5 rounded-full bg-red-500" />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: Agenda Section (lg:col-span-4) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Lịch trình hôm nay</h3>
                                <span className="text-sm text-slate-500 font-medium">05/10/2023</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[600px] custom-scrollbar">
                            {/* Appointment 1 */}
                            <div className="group p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-blue-500 transition-all hover:shadow-md">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                            <img className="size-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb0o6sygn-tTBsZBoC65Kab2XSzD5kyvM0cQCp7q3D7d-DPRbS2WPN-J9qW4defKHVTm4Ne5MybPvbpX15y3nuJcGH_ZMAV8Ing63zo37JBptWi-L8G3hT8XrQ_Y473osbARM671qPBYZj2fWD5e3VlCBHz0VkMgjBoMngTblCw01LasrKK3QeulfZg6OlsV6ZaIikF3_Vh00RGRscipZqgzhWRIHE_P_3CLik_L6Z8JdHIrdntfvNFNm9etpeHf4onJOFuVdE42s" alt="Vy" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold group-hover:text-primary transition-colors">Nguyễn T. Bảo Vy</h4>
                                            <p className="text-[11px] text-slate-500">Khám sức khỏe tổng quát</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">8:00</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-xs font-medium">Tại phòng khám</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment 2 */}
                            <div className="group p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-primary transition-all hover:shadow-md">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                            <img className="size-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuGrkxIzbuHaZxef3rzbpLYbiAtdG822jvnMg2FKb_FlHFGO3kjrxrd6ruHNX0QMyzUDOcM9-m2KiMjMnlZ4cc6Y8qZwSSQfjr8jlyE6qFhZlWewFHYSjcFEaAKDbtZMDQBIFjuscvq6ZD-3KgWQS4xgGzxC_UYtU5a6JMxdbAJNaQEHi89I5qWDZZbDBHCDEKZOw0DMTYDiOvm-wwKau6eh0tmbI-YZdP5k3ceDFtlqN2FUICg8b-fN4bGfyj839rsFb-kIUZYZbU" alt="Dat" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold group-hover:text-primary transition-colors">Trần Văn Đạt</h4>
                                            <p className="text-[11px] text-slate-500">Tư vấn triệu chứng ho</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white bg-primary/20 px-2 py-0.5 rounded">9:30</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Video className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-medium">Trực tuyến</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-primary text-[10px] font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-all">
                                            Bắt đầu cuộc gọi
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment 3 */}
                            <div className="group p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-slate-300 dark:border-slate-600 transition-all hover:shadow-md opacity-70">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                            <img className="size-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtH3dN-8KIzsDFEDv2W-iFSfo0ZO8hy2FXS7WoKI-vVxzjEP-j9jUP8zWwjwAlwLq_gCWb_zuDW8bAl5rRVOQWmU4uWhVmjT8QMey3PPmHxvRR8jJk9lM59VD1QMfhrNSJKy6TdBxERjsqW3lSqgE1CdbXNa4dy9ngK_POeINMMJgE69M3KAAaJzqk6XMxP8p3HVpUdBy7BncgoGRGn_N1fWdWRWsdvPLMyKHqT_-FVfXPJsXM2tdtJvGMqDCXD2HqoSXEZ7q6zkI" alt="Tuan" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold">Lê Minh Tuấn</h4>
                                            <p className="text-[11px] text-slate-500">Kiểm tra kết quả xét nghiệm</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 px-2 py-0.5 rounded">11:00</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-xs font-medium text-slate-400">Đang chờ xác nhận</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                            Xác nhận
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Add slot button */}
                            <button className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary transition-all group">
                                <AddIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Đặt lịch cho giờ trống tiếp theo</span>
                            </button>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex gap-2">
                                <button className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                    Dời lịch hàng loạt
                                </button>
                                <button className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                    Xuất file CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
