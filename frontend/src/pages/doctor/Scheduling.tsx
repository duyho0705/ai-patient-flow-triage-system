import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPortalBranches } from '@/api/portal'
import { getDoctorTodayAppointments } from '@/api/doctorAppointments'
import { useTenant } from '@/context/TenantContext'
import {
    MapPin,
    PlusCircle,
    ChevronLeft,
    ChevronRight,
    Video,
    Edit3,
    XCircle,
    PlusCircle as AddIcon,
} from 'lucide-react'

export default function Scheduling() {
    const { headers, tenantId } = useTenant()

    const { data: appointments, isLoading } = useQuery({
        queryKey: ['doctor-today-appointments', tenantId],
        queryFn: () => getDoctorTodayAppointments(headers),
        enabled: !!headers && !!tenantId,
    })

    const { data: branches } = useQuery({
        queryKey: ['portal-branches', tenantId],
        queryFn: () => getPortalBranches(headers),
        enabled: !!headers && !!tenantId,
    })

    const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false)
    const [selectedBranch, setSelectedBranch] = useState('Tất cả chi nhánh')
    const [isDiseaseDropdownOpen, setIsDiseaseDropdownOpen] = useState(false)
    const [selectedDisease, setSelectedDisease] = useState('Tất cả loại bệnh')

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
        <div className="p-8 space-y-10 animate-in fade-in duration-700 bg-background-light dark:bg-background-dark font-display min-h-[calc(100vh-80px)]">
            {/* ─── Header Section ─── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-primary rounded-full shadow-lg shadow-primary/20"></div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Lịch hẹn khám</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Quản lý và điều phối lịch trình bệnh nhân</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Disease Dropdown */}
                    <div className="relative group">
                        <button
                            onClick={() => setIsDiseaseDropdownOpen(!isDiseaseDropdownOpen)}
                            className="bg-white dark:bg-slate-900 px-6 py-3 rounded-full border border-primary/5 shadow-sm group hover:border-primary transition-all cursor-pointer flex items-center gap-4 min-w-[240px]"
                        >
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Loại bệnh:</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1 text-left">{selectedDisease}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isDiseaseDropdownOpen ? 'rotate-[-90deg]' : 'rotate-90'}`} />
                        </button>

                        <AnimatePresence>
                            {isDiseaseDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden py-1"
                                >
                                    {['Tất cả loại bệnh', 'Tiểu đường', 'Cao huyết áp', 'Tim mạch', 'Bệnh thận', 'Phổi tắc nghẽn'].map((disease) => (
                                        <button
                                            key={disease}
                                            onClick={() => { setSelectedDisease(disease); setIsDiseaseDropdownOpen(false) }}
                                            className="w-full px-6 py-3 text-left hover:bg-primary/10 transition-colors flex items-center justify-between"
                                        >
                                            <span className={`text-sm font-bold ${selectedDisease === disease ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {disease}
                                            </span>
                                            {selectedDisease === disease && <div className="size-2 bg-primary rounded-full" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {branches && (
                        <div className="relative group">
                            <button
                                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                                className="bg-white dark:bg-slate-900 px-6 py-3 rounded-full border border-primary/5 shadow-sm group hover:border-primary transition-all cursor-pointer flex items-center gap-4 min-w-[240px]"
                            >
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Chi nhánh:</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1 text-left">{selectedBranch}</span>
                                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isBranchDropdownOpen ? 'rotate-[-90deg]' : 'rotate-90'}`} />
                            </button>

                            <AnimatePresence>
                                {isBranchDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden py-1"
                                    >
                                        <button
                                            onClick={() => { setSelectedBranch('Tất cả chi nhánh'); setIsBranchDropdownOpen(false) }}
                                            className="w-full px-6 py-3 text-left hover:bg-primary/10 transition-colors flex items-center justify-between"
                                        >
                                            <span className={`text-sm font-bold ${selectedBranch === 'Tất cả chi nhánh' ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>Tất cả chi nhánh</span>
                                            {selectedBranch === 'Tất cả chi nhánh' && <div className="size-2 bg-primary rounded-full" />}
                                        </button>
                                        {branches.map((b: any) => (
                                            <button
                                                key={b.id}
                                                onClick={() => { setSelectedBranch(b.nameVi || b.code); setIsBranchDropdownOpen(false) }}
                                                className="w-full px-6 py-3 text-left hover:bg-primary/10 transition-colors flex items-center justify-between"
                                            >
                                                <span className={`text-sm font-bold ${selectedBranch === (b.nameVi || b.code) ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {b.nameVi || b.code}
                                                </span>
                                                {selectedBranch === (b.nameVi || b.code) && <div className="size-2 bg-primary rounded-full" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                    <button className="bg-gradient-to-r from-primary to-primary/80 text-slate-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20 active:scale-95">
                        <PlusCircle className="w-5 h-5" />
                        <span>Đặt lịch mới</span>
                    </button>
                </div>
            </div>

            {/* ─── Main Content Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Calendar View (lg:col-span-8) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-8 border-b border-primary/5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Tháng này</h3>
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-hidden border border-primary/5 shadow-inner">
                                    <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all hover:shadow-sm">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all hover:shadow-sm">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-primary/5 shadow-inner">
                                <button className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-700 rounded-xl shadow-sm">Tháng</button>
                                <button className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Tuần</button>
                                <button className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Ngày</button>
                            </div>
                        </div>

                        <div className="p-8 overflow-x-auto">
                            <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 border border-primary/5 rounded-2xl overflow-hidden min-w-[600px] shadow-sm">
                                {/* Weekdays */}
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                    <div key={day} className="bg-white dark:bg-slate-900 p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                                        {day}
                                    </div>
                                ))}

                                {/* Calendar Days (Representative Mockup) */}
                                {[...Array(3)].map((_, i) => (
                                    <div key={`offset-${i}`} className="bg-slate-50/30 dark:bg-slate-800/20 min-h-[120px] p-4" />
                                ))}

                                {/* Real Days */}
                                {[...Array(31)].map((_, i) => {
                                    const day = i + 1;
                                    const isToday = day === new Date().getDate();
                                    return (
                                        <div
                                            key={day}
                                            className={`bg-white dark:bg-slate-900 min-h-[120px] p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer relative group ${isToday ? 'bg-primary/5 dark:bg-primary/10 ring-2 ring-inset ring-primary/20' : ''}`}
                                        >
                                            <span className={`text-xs font-black ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                                                {day < 10 ? `0${day}` : day}
                                            </span>
                                            {isToday && appointments && appointments.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {appointments.slice(0, 2).map((apt, idx) => (
                                                        <div key={idx} className={`text-[9px] font-bold p-2 rounded-xl truncate shadow-sm border ${idx % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' : 'bg-primary/10 dark:bg-primary/20 text-slate-900 dark:text-primary border-primary/20'
                                                            }`}>
                                                            {apt.startTime?.slice(0, 5)} - {apt.patientName?.split(' ').pop()}
                                                        </div>
                                                    ))}
                                                    {appointments.length > 2 && (
                                                        <div className="text-[9px] font-bold text-slate-400 text-center">+ {appointments.length - 2} hẹn</div>
                                                    )}
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
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="p-8 border-b border-primary/5 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Lịch trình hôm nay</h3>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 max-h-[600px] custom-scrollbar">
                            {appointments && appointments.length > 0 ? (
                                appointments.map((apt, idx) => {
                                    // Alternating colors for visual variety
                                    const isBlue = idx % 2 === 0;
                                    const borderClass = isBlue ? "border-blue-500" : "border-primary";
                                    const timeClass = isBlue ? "text-blue-600 bg-blue-100 dark:bg-blue-900/40" : "text-primary-dark bg-primary/20";
                                    const iconColor = isBlue ? "text-blue-500" : "text-primary";
                                    const isOnline = apt.appointmentType?.includes('ONLINE') || false;

                                    return (
                                        <div key={apt.id || idx} className={`group p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-l-4 ${borderClass} transition-all hover:shadow-lg hover:-translate-y-1`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-primary/5 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                                        <span className="text-lg font-black">{apt.patientName?.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{apt.patientName}</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{apt.appointmentType === 'FOLLOW_UP' ? 'Tái khám' : 'Khám định kỳ'}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-xl shadow-sm ${timeClass}`}>
                                                    {apt.startTime?.slice(0, 5)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-6">
                                                <div className="flex items-center gap-2">
                                                    {isOnline ? (
                                                        <>
                                                            <Video className={`w-4 h-4 ${iconColor}`} />
                                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Trực tuyến</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MapPin className={`w-4 h-4 ${iconColor}`} />
                                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tại phòng khám</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    {isOnline && apt.status === 'SCHEDULED' && (
                                                        <button className="px-5 py-2 bg-primary text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                                                            Vào phòng
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-slate-400 hover:text-primary bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 transition-all" title="Chỉnh sửa">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 transition-all" title="Hủy lịch">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 font-medium italic text-sm">Hôm nay không có lịch hẹn nào</p>
                                </div>
                            )}

                            {/* Add slot button */}
                            <button className="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group">
                                <AddIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-black uppercase tracking-widest">Đặt lịch cho giờ trống tiếp theo</span>
                            </button>
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-primary/5">
                            <div className="flex gap-4">
                                <button className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-xl border border-primary/5 shadow-sm hover:bg-slate-100 transition-all active:scale-95">
                                    Dời lịch
                                </button>
                                <button className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-xl border border-primary/5 shadow-sm hover:bg-slate-100 transition-all active:scale-95">
                                    Xuất báo cáo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
