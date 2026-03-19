import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useTenant } from '@/context/TenantContext'
import { AppointmentModal } from '@/components/modals/AppointmentModal'
import { getDoctorAppointments, updateDoctorAppointmentStatus } from '@/api/doctorAppointments'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toastService } from '@/services/toast'
import VideoCall from '@/components/VideoCall'
import { useAuth } from '@/context/AuthContext'
import { Video } from 'lucide-react'

export default function Scheduling() {
    const { headers, tenantId } = useTenant()
    const queryClient = useQueryClient()
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
    const [selectedAptId, setSelectedAptId] = useState<string | null>(null)
    const { user } = useAuth()
    const doctorId = user?.id || ''

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    // YYYY-MM-DD
    const fromStr = startOfMonth.toISOString().slice(0, 10)
    const toStr = endOfMonth.toISOString().slice(0, 10)

    const { data: aptPage, isLoading } = useQuery({
        queryKey: ['doctor-appointments', tenantId, fromStr, toStr],
        queryFn: () => getDoctorAppointments(fromStr, toStr, headers, 0, 100),
        enabled: !!tenantId
    })

    const { mutate: updateStatus, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, status }: { id: string, status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' }) =>
            updateDoctorAppointmentStatus(id, status, headers),
        onSuccess: () => {
            toastService.success('Cập nhật trạng thái thành công')
            queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
            queryClient.invalidateQueries({ queryKey: ['doctor-dashboard'] })
            queryClient.invalidateQueries({ queryKey: ['doctor-today-appointments'] })
        },
        onError: () => toastService.error('Lỗi khi cập nhật trạng thái')
    })

    const appointments = aptPage?.content || [];
    
    // Process appointments into a map by date (YYYY-MM-DD)
    const aptsByDate = useMemo(() => {
        const map: Record<string, any[]> = {}
        appointments.forEach(a => {
            const date = a.appointmentDate || (a as any).date;
            if(!date) return;
            // Extract YYYY-MM-DD from full ISO string if needed
            const dateStr = String(date).slice(0, 10);
            if(!map[dateStr]) map[dateStr] = []
            map[dateStr].push(a)
        })
        return map
    }, [appointments])

    const today = new Date()
    const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
    const displayAppointments = aptsByDate[todayStr] || []

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

    const daysInMonth = endOfMonth.getDate()
    const firstDayOfWeek = startOfMonth.getDay() // 0 = Sunday

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
        <div className="font-display bg-background-light dark:bg-background-dark p-8 flex-1 overflow-y-auto">
            <div className="space-y-8">
                {/* ─── Header Section ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Lịch
                            hẹn khám</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Hôm nay bạn có {displayAppointments.length}
                            lịch hẹn.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAppointmentModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-slate-900 font-bold text-sm rounded-xl hover:bg-[#10b981]/90 transition-all shadow-lg shadow-[#10b981]/20">
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            <span>Thêm lịch hẹn mới</span>
                        </button>
                    </div>
                </div>

                {/* ─── Main Content Grid ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Calendar View (lg:col-span-8) */}
                    <div className="lg:col-span-8 space-y-4">
                        <div
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div
                                className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-bold capitalize">{format(currentDate, 'MMMM, yyyy', { locale: vi })}</h3>
                                    <div
                                        className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                        <button
                                            onClick={prevMonth}
                                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-r border-slate-200 dark:border-slate-700">
                                            <span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
                                        </button>
                                        <button
                                            onClick={nextMonth}
                                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            <span className="material-symbols-outlined text-lg leading-none">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                                    <button
                                        className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-600 rounded-md shadow-sm">Tháng</button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div
                                    className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden min-w-[600px] shadow-sm">
                                    {/* Weekdays */}
                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                        <div key={day} className="bg-slate-50 dark:bg-slate-800 p-2 text-center text-xs font-bold text-slate-400">
                                            {day}
                                        </div>
                                    ))}

                                    {/* Empty cells before start of month */}
                                    {[...Array(firstDayOfWeek)].map((_, i) => (
                                        <div key={`offset-${i}`} className="bg-white dark:bg-slate-800 min-h-[100px] p-2 opacity-50" />
                                    ))}

                                    {[...Array(daysInMonth)].map((_, i) => {
                                        const dayCode = i + 1;
                                        // create safe string pad
                                        const mo = String(currentDate.getMonth() + 1).padStart(2, '0');
                                        const da = String(dayCode).padStart(2, '0');
                                        const yr = currentDate.getFullYear();
                                        const loopDateStr = `${yr}-${mo}-${da}`;
                                        const hasApts = aptsByDate[loopDateStr] || [];
                                        const isToday = loopDateStr === todayStr;

                                        return (
                                            <div key={dayCode} className={`${isToday ? 'bg-[#10b981]/5 dark:bg-[#10b981]/10 ring-2 ring-inset ring-[#10b981]' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'} min-h-[100px] p-2 relative transition-colors cursor-pointer`}>
                                                <span className={`text-sm font-medium ${isToday ? 'text-[#10b981] underline underline-offset-4 decoration-2' : ''}`}>{dayCode}</span>
                                                {hasApts.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {hasApts.slice(0, 2).map((a, i) => (
                                                            <div key={i} className="text-[10px] p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded border-l-2 border-blue-500 truncate">
                                                                {a.startTime?.slice(0,5)} - {a.patientName}
                                                            </div>
                                                        ))}
                                                        {hasApts.length > 2 && (
                                                            <div className="text-[10px] p-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded border-l-2 border-slate-400 truncate">
                                                                +{hasApts.length - 2} khác
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                        
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Agenda Section (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold">Lịch trình hôm nay</h3>
                                    <span className="text-sm text-slate-500">{format(today, 'dd/MM/yyyy')}</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[600px] custom-scrollbar">
                                {displayAppointments.length > 0 ? (
                                    displayAppointments.map((apt: any, i: number) => (
                                        <div
                                            key={apt.id || i}
                                            className="group p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-blue-500 transition-all hover:shadow-md">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 flex items-center justify-center font-bold text-slate-400 rounded-full overflow-hidden bg-slate-200">
                                                        {apt.patientName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-bold group-hover:text-[#10b981] transition-colors line-clamp-1">
                                                                {apt.patientName}
                                                            </h4>
                                                            {apt.status === 'COMPLETED' ? (
                                                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black rounded uppercase">Đã khám</span>
                                                            ) : apt.status === 'CANCELLED' ? (
                                                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black rounded uppercase">Đã hủy</span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black rounded uppercase">Chờ khám</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 line-clamp-1">{apt.reason || 'Khám bệnh'}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded shrink-0">
                                                    {apt.startTime?.slice(0, 5)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm text-blue-500">location_on</span>
                                                    <span className="text-xs font-medium">{apt.appointmentType === 'ONLINE' ? 'Trực tuyến' : 'Tại phòng khám'}</span>
                                                </div>
                                                {apt.status === 'SCHEDULED' && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                           disabled={isUpdating}
                                                           onClick={(e) => {
                                                               e.stopPropagation();
                                                               updateStatus({ id: apt.id, status: 'CANCELLED' });
                                                           }}
                                                           className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Hủy lịch">
                                                            <span className="material-symbols-outlined text-lg">cancel</span>
                                                        </button>
                                                        {apt.appointmentType === 'ONLINE' && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedAptId(apt.id);
                                                                    setIsVideoCallOpen(true);
                                                                }}
                                                                className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Bắt đầu Video Call">
                                                                <Video className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        <button 
                                                           disabled={isUpdating}
                                                           onClick={(e) => {
                                                               e.stopPropagation();
                                                               updateStatus({ id: apt.id, status: 'COMPLETED' });
                                                           }}
                                                           className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981] text-slate-900 font-bold text-[10px] rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 transition-all active:scale-95">
                                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                                            <span>Xác nhận khám</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 text-xs italic py-8">Không có lịch hẹn hôm nay</p>
                                )}

                                {/* Add slot button */}
                                <button
                                    onClick={() => setIsAppointmentModalOpen(true)}
                                    className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary transition-all">
                                    <span className="material-symbols-outlined">add_circle</span>
                                    <span className="text-sm font-medium">Đặt lịch cho giờ trống tiếp theo</span>
                                </button>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl border-t border-slate-100 dark:border-slate-700">
                                <div className="flex gap-2">
                                    <button className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                        Xuất file CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <AppointmentModal
                    isOpen={isAppointmentModalOpen}
                    onClose={() => setIsAppointmentModalOpen(false)}
                />

                {isVideoCallOpen && selectedAptId && (
                    <VideoCall
                        roomID={`telehealth-${selectedAptId}`}
                        userID={`doctor-${doctorId}`}
                        userName="Bác sĩ"
                        onClose={() => setIsVideoCallOpen(false)}
                    />
                )}
            </div>
        </div>
    )
}

