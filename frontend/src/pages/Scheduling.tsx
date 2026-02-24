import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getAppointments, checkInAppointment } from '@/api/scheduling'
import { getQueueDefinitions } from '@/api/queues'
import { toastService } from '@/services/toast'
import { CustomSelect } from '@/components/CustomSelect'
import { Calendar as CalendarIcon, Clock, User, ArrowRight, CheckCircle2, Settings2 } from 'lucide-react'

export function Scheduling() {
    const { headers, branchId } = useTenant()
    const queryClient = useQueryClient()
    const today = new Date().toISOString().split('T')[0]
    const [date, setDate] = useState(today)
    const [selectedQueueId, setSelectedQueueId] = useState('')

    const { data: appointments, isLoading } = useQuery({
        queryKey: ['appointments', branchId, date],
        queryFn: () => getAppointments({ branchId: branchId!, date }, headers),
        enabled: !!branchId && !!headers?.tenantId,
    })

    const { data: queueDefinitions } = useQuery({
        queryKey: ['queue-definitions', branchId],
        queryFn: () => getQueueDefinitions(branchId!, headers),
        enabled: !!branchId && !!headers?.tenantId,
    })

    const checkIn = useMutation({
        mutationFn: (id: string) => {
            if (!selectedQueueId) throw new Error('Vui lòng chọn hàng chờ trước khi check-in')
            return checkInAppointment(id, selectedQueueId, headers)
        },
        onSuccess: () => {
            toastService.success('✅ Tiếp nhận thành công! Bệnh nhân đã được thêm vào hàng chờ.')
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
            queryClient.invalidateQueries({ queryKey: ['queue-entries'] })
        },
        onError: (e: Error) => toastService.error(e.message),
    })

    return (
        <div className="animate-in fade-in duration-1000 pb-20 -mt-2">
            {/* Premium Hero Banner */}
            <div className="bg-slate-900 -mx-4 sm:-mx-6 lg:-mx-8 px-8 sm:px-12 py-12 mb-10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />

                <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-900 shadow-2xl">
                            <CalendarIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tightest uppercase leading-none">Quản lý Lịch hẹn</h1>
                            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mt-2 opacity-60">Hợp tác & Vận hành Lịch hẹn</p>
                        </div>
                    </div>

                    <div className="flex bg-white/5 p-1.5 rounded-[1.5rem] gap-1 backdrop-blur-md">
                        <div className="relative group p-4 flex items-center gap-4 text-white hover:text-blue-400 transition-colors cursor-pointer">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto space-y-12 px-4 sm:px-6 lg:px-8">

                <div className="grid gap-8 lg:grid-cols-4 items-start">
                    {/* Settings Panel */}
                    <aside className="lg:col-span-1">
                        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-[#2b8cee]/10 rounded-xl">
                                    <Settings2 className="w-5 h-5 text-[#2b8cee]" />
                                </div>
                                <h3 className="font-black text-slate-900 tracking-tight">Cấu hình Tiếp đón</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                        Hàng chờ đích
                                    </label>
                                    <CustomSelect
                                        options={queueDefinitions || []}
                                        value={selectedQueueId}
                                        onChange={setSelectedQueueId}
                                        labelKey="nameVi"
                                        valueKey="id"
                                        placeholder="Chọn hàng chờ"
                                        className="w-full"
                                    />
                                </div>

                                <div className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100">
                                    <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                                        💡 Sau khi đăng ký tiếp đón, bệnh nhân sẽ tự động xuất hiện trong hàng chờ đã chọn với mức độ ưu tiên mặc định.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>

                    {/* List Panel */}
                    <main className="lg:col-span-3">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#2b8cee]/20 blur-2xl rounded-full"></div>
                                    <div className="relative animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-[#2b8cee]"></div>
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-400">Đang tải lịch hẹn...</p>
                            </div>
                        ) : appointments?.length ? (
                            <div className="grid gap-6 sm:grid-cols-2">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className={`group relative bg-white rounded-[2rem] p-6 border transition-all duration-300 hover:shadow-2xl hover:shadow-[#2b8cee]/10 hover:-translate-y-1 ${apt.status === 'CHECKED_IN' ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100'}`}>
                                        {/* Status Indicator */}
                                        <div className={`absolute top-0 right-12 w-8 h-1.5 rounded-b-full transition-colors ${apt.status === 'CHECKED_IN' ? 'bg-emerald-500' : 'bg-[#2b8cee]'}`} />

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${apt.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    <User className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 tracking-tight text-lg">{apt.patientName}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                            Mã BN: {apt.id.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {apt.status === 'CHECKED_IN' ? (
                                                <div className="bg-emerald-100 p-2 rounded-xl">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                </div>
                                            ) : (
                                                <div className="bg-[#2b8cee]/10 text-[#2b8cee] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-[#2b8cee]/20">
                                                    Đã xác nhận
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                    <Clock className="h-4 w-4 text-[#2b8cee]" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Bắt đầu</p>
                                                    <p className="text-sm font-black text-slate-700">
                                                        {new Date(apt.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                    <ArrowRight className="h-4 w-4 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Kết thúc</p>
                                                    <p className="text-sm font-black text-slate-700">
                                                        {new Date(apt.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {apt.status !== 'CHECKED_IN' && (
                                            <button
                                                onClick={() => checkIn.mutate(apt.id)}
                                                disabled={checkIn.isPending || !selectedQueueId}
                                                className="group/btn relative w-full overflow-hidden bg-slate-900 text-white py-3.5 rounded-2xl font-black text-sm transition-all hover:bg-[#2b8cee] hover:shadow-xl hover:shadow-[#2b8cee]/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                            >
                                                <div className="relative z-10 flex items-center justify-center gap-2">
                                                    {checkIn.isPending ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>Tiếp đón ngay <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
                                                    )}
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] text-center py-24 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2b8cee]/20 to-transparent"></div>
                                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-slate-50 rounded-[2.5rem] mb-8 transition-transform group-hover:scale-110 duration-500">
                                    <CalendarIcon className="h-10 w-10 text-slate-200" />
                                    <div className="absolute inset-0 bg-[#2b8cee]/5 rounded-full blur-2xl animate-pulse"></div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Không có lịch hẹn</h3>
                                <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto">Người bệnh chưa đặt lịch cho ngày hôm nay hoặc chưa có dữ liệu.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
