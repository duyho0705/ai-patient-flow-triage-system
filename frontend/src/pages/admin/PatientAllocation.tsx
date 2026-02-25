import {
    Users,
    Search,
    Filter,
    ChevronDown,
    Stethoscope,
    TrendingUp,
    Settings,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function PatientAllocation() {
    const [activeTab, setActiveTab] = useState('waiting')

    const patients = [
        {
            id: '10294',
            name: 'Nguyễn Văn Lợi',
            initials: 'NL',
            symptoms: 'Đau ngực, khó thở',
            specialty: 'NỘI TỔNG QUÁT',
            priority: 'Khẩn cấp',
            priorityColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            hasPulse: true
        },
        {
            id: '10298',
            name: 'Phạm Hoàng Hoa',
            initials: 'PH',
            symptoms: 'Khám sức khỏe thai nhi',
            specialty: 'SẢN PHỤ KHOA',
            priority: 'Thường',
            priorityColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            hasPulse: false
        },
        {
            id: '10301',
            name: 'Lý Thái Tổ',
            initials: 'LT',
            symptoms: 'Sốt cao, ho kéo dài',
            specialty: 'NHI KHOA',
            priority: 'Ưu tiên',
            priorityColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            hasPulse: false
        }
    ]

    const doctors = [
        {
            name: 'BS. Trần Hùng',
            specialty: 'Nội tổng quát',
            load: '2/8',
            percentage: 25,
            status: 'Sẵn sàng',
            color: 'bg-green-500',
            indicator: 'bg-green-500',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAxemtxcCEvnhCuGyAAnjcXxbJws6Jj2LW5t7RxG1GzXWoWflaLJfMPwaWx62CF1MK-TEubMrIBa2ypZZK-u5PaXk9kVrSDBlEeJ7yZqHDkSc6zB6W7l2MhjB5QNZk98pK8z_9BKhRiR2U-AcHqysvEz4RR1AXxYlca5jhv3ioLUNwTlwJsx_XO00vrSW309e32PJDzACU4e_8t-KU_t3yh-1xodhprEQXPBrYx5fbWdVXYldlY45IPO9My_q36jXdBayXRNkVyB8'
        },
        {
            name: 'BS. Nguyễn An',
            specialty: 'Sản phụ khoa',
            load: '5/6',
            percentage: 83,
            status: 'Đang bận',
            color: 'bg-amber-500',
            indicator: 'bg-amber-500',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADtl_aVpT_n6QFIQnvSdVGRyFYrRGjUhsOjME7rS01-TCE7ZDCTNDw2VnBEM5PQxmFw_4b_8ux9MM75oDqiLQS921-qB5sBpn77R6rNyUdv4BVQjwHqTYBL9cUPa75h8QFbgD_f3WqSw3MnUey8sHRGM5dOPfN0mz3JmWvdAxK9qk_BlERsk5u3HQPkoLO6kUQwiZ6Qai8ui0wrCyvFFnulmF0aY8uR_gwW9YUpua1dnoSTZ6c9hJXi-3dMQOj6WBp88P37nVXJXk'
        },
        {
            name: 'BS. Lê Minh',
            specialty: 'Nhi khoa',
            load: '10/10',
            percentage: 100,
            status: 'Quá tải',
            color: 'bg-red-500',
            indicator: 'bg-red-500',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCihNhXVqBB7heRvsWDA6djyFFF_8LYsYyD2QXkgvgQro0ZXhHMZRhgjyg3N3gZQyiLPtv_6Oqvw5pqc6mka9O96vK44TiiL3Mz2XPvoZ9V3sKmL9Fhv4Qq63nNKKb0o4AKjBDbOXnjBWMs1VZayGhgLFF2zEIwR3rWhIrrcnURr2gEsvqtBSnwhf2DuyJzCaSYVCY0aA65PSKxSwGlgKo0-K_stBPwpRSf0W2UH39iLFX6bOExJ3d48WHOTMb34P-0uNUvEr71NHg'
        }
    ]

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
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                        Mức độ ưu tiên
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Patient List */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30">
                            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase text-xs tracking-[0.1em]">
                                <Users className="w-5 h-5 text-blue-600" />
                                Danh sách chờ (12)
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
                                        <th className="px-8 py-6">Triệu chứng / Chuyên khoa</th>
                                        <th className="px-8 py-6">Ưu tiên</th>
                                        <th className="px-8 py-6">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {patients.map((patient, i) => (
                                        <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center font-black text-emerald-500 text-xs shadow-sm ring-1 ring-emerald-500/5 transition-transform group-hover:scale-110">
                                                        {patient.initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 dark:text-white text-sm tracking-tight">{patient.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Mã BN: #{patient.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{patient.symptoms}</p>
                                                    <span className="inline-block px-3 py-1 rounded-lg text-[9px] font-black tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 mt-2">
                                                        {patient.specialty}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${patient.priorityColor}`}>
                                                    {patient.hasPulse && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>}
                                                    {patient.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <select className="text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-1 focus:ring-emerald-500 px-4 py-2.5 min-w-[150px] cursor-pointer">
                                                        <option>Chọn Bác sĩ...</option>
                                                        <option>BS. Trần Hùng</option>
                                                        <option>BS. Lê Minh</option>
                                                    </select>
                                                    <button className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 active:scale-95">
                                                        Phân bổ
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-slate-50/30 dark:bg-slate-800/20 text-center border-t border-slate-50 dark:border-slate-800">
                            <button className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-emerald-600 hover:underline">
                                Xem thêm bệnh nhân (9)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Doctor Workload */}
                <div className="xl:col-span-4 space-y-8">
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
                            {doctors.map((doc, i) => (
                                <div key={i} className="p-5 border border-slate-50 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/20 group hover:ring-2 hover:ring-emerald-500/5 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative group">
                                                <img src={doc.avatar} className="size-12 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm group-hover:scale-110 transition-transform" alt={doc.name} />
                                                <div className={`absolute -bottom-1 -right-1 size-4 ${doc.indicator} border-2 border-white dark:border-slate-900 rounded-full shadow-sm`}></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{doc.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-none">{doc.specialty}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`block text-xl font-black ${doc.status === 'Quá tải' ? 'text-red-500' : doc.status === 'Đang bận' ? 'text-amber-500' : 'text-emerald-500'} leading-none`}>
                                                {doc.load}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 inline-block">BN hiện tại</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-400 leading-none">Trạng thái: {doc.status}</span>
                                            <span className="text-slate-700 dark:text-slate-200 leading-none">{doc.percentage}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${doc.percentage}%` }}
                                                transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                                                className={`${doc.color} h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)]`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-slate-50/30 dark:bg-slate-800/20 text-center border-t border-slate-50 dark:border-slate-800">
                            <button className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-emerald-600 hover:underline">
                                Quản lý ca trực
                            </button>
                        </div>
                    </div>

                    {/* Allocation Summary Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-8 relative">Tóm tắt phân bổ hôm nay</h4>
                        <div className="grid grid-cols-2 gap-6 relative">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5 group-hover:bg-white/20 transition-all">
                                <p className="text-[9px] uppercase font-black tracking-widest opacity-70 mb-2">Đã điều phối</p>
                                <p className="text-3xl font-black">42</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5 group-hover:bg-white/20 transition-all">
                                <p className="text-[9px] uppercase font-black tracking-widest opacity-70 mb-2">Thời gian TB</p>
                                <p className="text-3xl font-black">8m</p>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span>Năng suất tăng 15% so với hôm qua</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
