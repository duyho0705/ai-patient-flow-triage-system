import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useTenant } from '@/context/TenantContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDoctorAvailableSlots, createDoctorAppointment } from '@/api/doctorAppointments'
import { getDoctorPatientList } from '@/api/doctor'
import { format } from 'date-fns'
import { toastService } from '@/services/toast'
import { Loader2 } from 'lucide-react'

interface AppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    patientName?: string
    patientId?: string
}

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function generateCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days: { day: number; currentMonth: boolean; date: Date }[] = []

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ 
            day: daysInPrevMonth - i, 
            currentMonth: false,
            date: new Date(year, month - 1, daysInPrevMonth - i)
        })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ 
            day: i, 
            currentMonth: true,
            date: new Date(year, month, i)
        })
    }

    return days
}

const MONTH_NAMES = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]

export function AppointmentModal({ isOpen, onClose, patientName, patientId }: AppointmentModalProps) {
    const { headers, branchId, tenantId } = useTenant()
    const queryClient = useQueryClient()
    
    const [patientSearch, setPatientSearch] = useState('')
    const [debouncedPatientSearch, setDebouncedPatientSearch] = useState('')

    const { data: patientSearchResults } = useQuery({
        queryKey: ['doctor-patient-search-apt', tenantId, debouncedPatientSearch],
        queryFn: () => getDoctorPatientList(headers, 0, 10, debouncedPatientSearch),
        enabled: !!debouncedPatientSearch && !patientId
    })

    const [selectedPatient, setSelectedPatient] = useState<{ id: string, name: string } | null>(
        patientId ? { id: patientId, name: patientName! } : null
    )

    const handlePatientSearchChange = (e: any) => {
        setPatientSearch(e.target.value)
        setTimeout(() => setDebouncedPatientSearch(e.target.value), 300)
    }

    const selectPatient = (p: any) => {
        setSelectedPatient({ id: p.id, name: p.fullNameVi })
        setPatientSearch(p.fullNameVi)
        setDebouncedPatientSearch('')
    }
    
    const [appointmentType, setAppointmentType] = useState<'DIRECT' | 'ONLINE'>('DIRECT')
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [notes, setNotes] = useState('')
    
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

    // ─── Fetch Available Slots ───
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const { data: slots, isLoading: isLoadingSlots } = useQuery({
        queryKey: ['available-slots', branchId, dateStr],
        queryFn: () => getDoctorAvailableSlots(branchId!, dateStr, headers),
        enabled: !!isOpen && !!branchId && !!dateStr
    })

    const createMutation = useMutation({
        mutationFn: (data: any) => createDoctorAppointment(data, headers),
        onSuccess: () => {
            toastService.success('Đặt lịch tái khám thành công!')
            queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
            queryClient.invalidateQueries({ queryKey: ['doctor-today-appointments'] })
            onClose()
        },
        onError: (err: any) => {
            toastService.error(err?.message || 'Lỗi khi đặt lịch')
        }
    })

    if (!isOpen) return null

    const calendarDays = generateCalendarDays(currentYear, currentMonth)

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)
        } else {
            setCurrentMonth(currentMonth - 1)
        }
    }

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)
        } else {
            setCurrentMonth(currentMonth + 1)
        }
    }

    const handleSubmit = () => {
        const targetPatientId = selectedPatient?.id
        if (!targetPatientId || !selectedTime) {
            toastService.error('Vui lòng chọn đầy đủ thông tin')
            return
        }

        createMutation.mutate({
            patientId: targetPatientId,
            appointmentDate: dateStr,
            startTime: selectedTime,
            appointmentType,
            notes,
            branchId
        })
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
            <div className="fixed inset-0" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col z-10"
            >
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Đặt lịch tái khám</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Thiết lập lịch hẹn tiếp theo cho bệnh nhân</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                    <div className="bg-primary/5 rounded-lg p-4 space-y-3 border border-primary/10">
                        <div className="flex flex-col gap-1.5 relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bệnh nhân</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-primary transition-colors">person</span>
                                <input
                                    type="text"
                                    value={patientId ? patientName : patientSearch}
                                    onChange={handlePatientSearchChange}
                                    disabled={!!patientId}
                                    placeholder="Tìm kiếm bệnh nhân..."
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-2 border-primary/5 rounded-lg text-sm focus:border-primary outline-none transition-all font-bold disabled:opacity-70"
                                />
                                {debouncedPatientSearch && patientSearchResults?.content && patientSearchResults.content.length > 0 && (
                                    <div className="absolute top-[48px] left-0 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto z-50">
                                        {patientSearchResults.content.map((p: any) => (
                                            <div
                                                key={p.id}
                                                onClick={() => selectPatient(p)}
                                                className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                                            >
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">{p.fullNameVi}</p>
                                                <p className="text-xs text-slate-500">{p.phone || '–'}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {selectedPatient && (
                            <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedPatient.name}</span>
                                <span className="text-xs font-mono font-bold text-primary">{selectedPatient.id}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hình thức khám</label>
                        <div className="flex gap-4">
                            {(['DIRECT', 'ONLINE'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setAppointmentType(type)}
                                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                                        appointmentType === type 
                                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {type === 'DIRECT' ? 'person_pin_circle' : 'videocam'}
                                    </span>
                                    <span className="text-sm">{type === 'DIRECT' ? 'Khám trực tiếp' : 'Tư vấn từ xa'}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chọn ngày</label>
                            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between mb-4">
                                    <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-200 rounded-full">
                                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                                    </button>
                                    <span className="text-sm font-bold">{MONTH_NAMES[currentMonth]} {currentYear}</span>
                                    <button onClick={handleNextMonth} className="p-1 hover:bg-slate-200 rounded-full">
                                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
                                    {DAYS_OF_WEEK.map(d => <div key={d}>{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((item, i) => (
                                        <button
                                            key={i}
                                            disabled={!item.currentMonth}
                                            onClick={() => setSelectedDate(item.date)}
                                            className={`text-xs h-8 flex items-center justify-center rounded-sm transition-colors ${
                                                !item.currentMonth ? 'opacity-20 cursor-default' :
                                                format(selectedDate, 'yyyy-MM-dd') === format(item.date, 'yyyy-MM-dd')
                                                ? 'bg-primary text-slate-900 font-bold'
                                                : 'hover:bg-primary/20'
                                            }`}
                                        >
                                            {item.day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Giờ khám trống</label>
                            {isLoadingSlots ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Đang tìm slot...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 h-fit max-h-[220px] overflow-y-auto pr-1">
                                    {slots && slots.length > 0 ? slots.map((slot) => (
                                        <button
                                            key={slot.startTime}
                                            disabled={!slot.available}
                                            onClick={() => setSelectedTime(slot.startTime)}
                                            className={`py-2 text-xs font-medium rounded border transition-all ${
                                                !slot.available ? 'opacity-30 cursor-not-allowed bg-slate-100' :
                                                selectedTime === slot.startTime
                                                ? 'border-primary bg-primary text-slate-900 font-black'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-primary'
                                            }`}
                                        >
                                            {slot.startTime?.slice(0, 5)}
                                        </button>
                                    )) : (
                                        <div className="col-span-2 py-8 text-center text-xs text-slate-400 italic">Hết lịch trống ngày này</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ghi chú tái khám</label>
                        <textarea
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                            placeholder="Dặn dò bệnh nhân..."
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Hủy</button>
                    <button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="px-6 py-2 bg-primary text-slate-900 font-black text-sm rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="material-symbols-outlined text-lg">event_available</span>}
                        {createMutation.isPending ? 'Đang lưu...' : 'Xác nhận đặt lịch'}
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    )
}
