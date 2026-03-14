import {
    Users,
    Search,
    Filter,
    ChevronDown,
    Stethoscope,
    TrendingUp,
    Settings,
    Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllocationData, allocatePatient } from '@/api/management'
import { useTenant } from '@/context/TenantContext'
import { toastService } from '@/services/toast'

export function PatientAllocation() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('waiting')

    const { data, isLoading } = useQuery({
        queryKey: ['allocation-data', headers?.tenantId],
        queryFn: () => getAllocationData(headers),
        enabled: !!headers?.tenantId
    })

    const allocationMutation = useMutation({
        mutationFn: (req: { patientId: string; doctorId: string }) => allocatePatient(req, headers),
        onSuccess: () => {
            toastService.success('Đã phân bổ bệnh nhân thành công')
            queryClient.invalidateQueries({ queryKey: ['allocation-data'] })
        },
        onError: () => {
            toastService.error('Lỗi khi phân bổ bệnh nhân')
        }
    })

    const handleAllocate = (patientId: string, doctorId: string) => {
        if (!doctorId || doctorId === 'Chọn Bác sĩ...') return
        allocationMutation.mutate({ patientId, doctorId })
    }

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Đang tải dữ liệu phân bổ...</p>
            </div>
        )
    }

    const patients = data?.waitingPatients || []
    const doctors = data?.doctorsWorkload || []

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    Phân bổ bệnh nhân
                </h1>
                <p className="text-slate-500 font-bold mt-1 text-sm italic">
                    Điều phối bệnh nhân đến bác sĩ phù hợp dựa trên tình trạng và tải trọng hiện tại.
                </p>
            </div>

            {/* Tabs & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('waiting')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'waiting' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Bệnh nhân chờ phân bổ
                        {activeTab === 'waiting' && (
                            <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('workload')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'workload' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Tình trạng tải bác sĩ
                        {activeTab === 'workload' && (
                            <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />
                        )}
                    </button>
                </div>
                <div className="flex gap-3 mb-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                        <Filter className="w-4 h-4 text-emerald-500" />
                        Tất cả chuyên khoa
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Patient List */}
                <div className={`xl:col-span-8 space-y-6 ${activeTab !== 'waiting' && 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30">
                            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase text-xs tracking-[0.1em]">
                                <Users className="w-5 h-5 text-blue-600" />
                                Danh sách chờ ({patients.length})
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Tìm bệnh nhân..."
                                    className="pl-10 pr-4 py-2 text-xs font-bold rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-600/20 w-48 transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-6">Bệnh nhân</th>
                                        <th className="px-8 py-6">Tình trạng / Bệnh mãn tính</th>
                                        <th className="px-8 py-6">Mức độ nguy cơ</th>
                                        <th className="px-8 py-6 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {patients.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="size-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                        <TrendingUp className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400">Không có bệnh nhân đang chờ phân bổ</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : patients.map((patient: any) => (
                                        <tr key={patient.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center font-black text-emerald-500 text-xs shadow-sm">
                                                        {patient.initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 dark:text-white text-sm tracking-tight">{patient.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Mã BN: #{patient.id.substring(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{patient.symptoms}</p>
                                                    <span className="inline-block px-3 py-1 rounded-lg text-[9px] font-black tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 mt-2">
                                                        {patient.chronicConditions || 'Chưa xác định'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    patient.riskLevel === 'CRITICAL' || patient.riskLevel === 'HIGH' ? 'bg-red-50 text-red-600' :
                                                    patient.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    {(patient.riskLevel === 'CRITICAL' || patient.riskLevel === 'HIGH') && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>}
                                                    {patient.riskLevel}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-end gap-3">
                                                    <select 
                                                        id={`doc-select-${patient.id}`}
                                                        className="text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-1 focus:ring-emerald-500 px-4 py-2.5 min-w-[150px] cursor-pointer"
                                                    >
                                                        <option>Chọn Bác sĩ...</option>
                                                        {doctors.map((doc: any) => (
                                                            <option key={doc.id} value={doc.id}>
                                                                {doc.name} ({doc.currentPatients} BN)
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button 
                                                        disabled={allocationMutation.isPending}
                                                        onClick={() => {
                                                            const select = document.getElementById(`doc-select-${patient.id}`) as HTMLSelectElement
                                                            handleAllocate(patient.id, select.value)
                                                        }}
                                                        className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-2"
                                                    >
                                                        {allocationMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Phân bổ'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Doctor Workload */}
                <div className={`xl:col-span-4 space-y-8 ${activeTab !== 'workload' && 'hidden lg:block'}`}>
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase text-xs tracking-widest">
                                <Stethoscope className="w-5 h-5 text-emerald-500" />
                                Tải trọng bác sĩ
                            </h3>
                            <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <Settings className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            {doctors.length === 0 ? (
                                <p className="text-center text-xs font-bold text-slate-400 italic py-10">Chưa có dữ liệu bác sĩ</p>
                            ) : doctors.map((doc: any, i: number) => (
                                <div key={doc.id} className="p-5 border border-slate-50 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/20 group hover:ring-2 hover:ring-emerald-500/5 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative group">
                                                {doc.avatar ? (
                                                    <img src={doc.avatar} className="size-12 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm" alt={doc.name} />
                                                ) : (
                                                    <div className="size-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400 font-black">
                                                        {doc.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className={`absolute -bottom-1 -right-1 size-4 ${
                                                    doc.status === 'Overloaded' ? 'bg-red-500' : doc.status === 'Busy' ? 'bg-amber-500' : 'bg-emerald-500'
                                                } border-2 border-white dark:border-slate-900 rounded-full shadow-sm`}></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{doc.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-none">{doc.specialty}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`block text-xl font-black ${doc.status === 'Overloaded' ? 'text-red-500' : doc.status === 'Busy' ? 'text-amber-500' : 'text-emerald-500'} leading-none`}>
                                                {doc.currentPatients}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 inline-block">BN hiện tại</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-400 leading-none">Trạng thái: {doc.status}</span>
                                            <span className="text-slate-700 dark:text-slate-200 leading-none">{doc.workloadPercentage}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${doc.workloadPercentage}%` }}
                                                transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                                                className={`h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)] ${
                                                    doc.status === 'Overloaded' ? 'bg-red-500' : doc.status === 'Busy' ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Allocation Summary Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-8 relative">Tóm tắt phân bổ</h4>
                        <div className="grid grid-cols-2 gap-6 relative">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5 group-hover:bg-white/20 transition-all">
                                <p className="text-[9px] uppercase font-black tracking-widest opacity-70 mb-2">Chờ phân bổ</p>
                                <p className="text-3xl font-black">{patients.length}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5 group-hover:bg-white/20 transition-all">
                                <p className="text-[9px] uppercase font-black tracking-widest opacity-70 mb-2">Tổng bác sĩ</p>
                                <p className="text-3xl font-black">{doctors.length}</p>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span>Hiệu suất điều phối đang ổn định</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
