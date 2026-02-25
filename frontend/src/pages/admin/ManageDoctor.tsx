import {
    Users,
    UserPlus,
    Search,
    Download,
    Edit2,
    Trash2,
    UserCheck,
    Activity,
    Stethoscope,
    ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function ManageDoctor() {
    const [searchTerm, setSearchTerm] = useState('')

    const doctors = [
        {
            id: 'DOC-001',
            name: 'BS. Nguyễn Văn An',
            specialty: 'Nội khoa',
            patients: 12,
            workload: 40,
            status: 'Đang rảnh',
            statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            barColor: 'bg-green-500',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKEf1OliiZZNEcbE25T-PXglU7vQJPlBOlOSS5xvJgNqFVhgRdCq6PRfZjmeptUH43WMXmKFGo_GkZQx1H-OvB6WEcMGuN8WZtAg4O0Z9yg1QFHKtPsi_UpDQtLbjMmV7OPRaoNv6ntiTOgSUYLLAa9T9TN75PG8MjXbp95UW6shMkHQxx4yhbGUQL7DgLkeYG1w28WMGmLlWHHHf4T_t4dl_gUiRut5q3cSEu0cNrwBAV1QYtQ_GYyJjBmVHaEOXRjZ8t2A4B0Qg'
        },
        {
            id: 'DOC-002',
            name: 'BS. Lê Thị Mai',
            specialty: 'Nhi khoa',
            patients: 28,
            workload: 85,
            status: 'Vừa phải',
            statusColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            barColor: 'bg-orange-500',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjAGTgwF9w1LQmHeLvT6lok0uqXH_ebHl3AeuxS411fSlQ5a-ieOPzcr5CJqa6U5R5Rt9hi8br_KxKOvoq6iPcn8s0g_gTqgV1B9YlMWify2ImJfLXflggS0W6ZGaUxN5DvH3I4iWI3mfiuO931v9PIoxp5a4WDM1TKZKg0jHHC9rOhhYECsvq1FJdhjPzo5taAN0fORrqP5_r9u5eYgYMi1o9S1NMnqXvwjlpmeuViZ9Xf-k-SOtlw5zU_9JI1jVRBC1FHHG2B-Q'
        },
        {
            id: 'DOC-003',
            name: 'BS. Trần Hoàng Nam',
            specialty: 'Ngoại khoa',
            patients: 42,
            workload: 100,
            status: 'Quá tải',
            statusColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            barColor: 'bg-red-500',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYXm10Tu11T0eP72h1Q3KEcxxha4NdcJIlIkz4E_1Xr9kFgnGSHhksEccoFnh5g20pDmTOAjJJJRjMUPM9O8q9UjuuuoLP7yr6-5PVQuLaNCkBhwE9xMQpjW7oVH5-dhlidDGjf_PKOd8WOvgRWOr4fLf9BsJyPo59TiyzaojKgStYa4DM9Rpfk24PXVDsBjjJUC2cXhrvA8HKy1SXs2g_nN-JMkDM-qqyhGt2SrARrK86Qjx6N15VZYRa4biLvhfiGdBWqAEB5to'
        }
    ]

    const pendingAssignments = [
        { name: 'Phạm Minh Tuấn', symptoms: 'Đau bụng, khó tiêu' },
        { name: 'Hoàng Thu Thủy', symptoms: 'Kiểm tra định kỳ Nhi' }
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-600/10 rounded-2xl text-emerald-600">
                        <Users className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            Quản lý Bác sĩ
                        </h1>
                        <p className="text-slate-500 font-bold mt-1 text-sm">
                            Quản lý danh sách, chuyên khoa và lịch làm việc của bác sĩ.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="w-4 h-4 text-emerald-600" />
                        Xuất dữ liệu
                    </button>
                    <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                        <UserPlus className="w-4 h-4" />
                        Thêm bác sĩ mới
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc ID bác sĩ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select className="text-xs font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-600/20 px-6 py-3 min-w-[180px]">
                        <option value="">Chuyên khoa: Tất cả</option>
                        <option>Nội khoa</option>
                        <option>Ngoại khoa</option>
                        <option>Nhi khoa</option>
                        <option>Tim mạch</option>
                    </select>
                    <select className="text-xs font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-600/20 px-6 py-3 min-w-[180px]">
                        <option value="">Khối lượng: Tất cả</option>
                        <option>Đang rảnh</option>
                        <option>Vừa phải</option>
                        <option>Quá tải</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Doctor List Table */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="px-8 py-6">Bác sĩ & ID</th>
                                        <th className="px-8 py-6">Chuyên khoa</th>
                                        <th className="px-8 py-6">Bệnh nhân</th>
                                        <th className="px-8 py-6">Trạng thái</th>
                                        <th className="px-8 py-6 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {doctors.map((doc, i) => (
                                        <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-2xl overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                                                        <img src={doc.avatar} className="w-full h-full object-cover" alt={doc.name} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 dark:text-white text-sm tracking-tight">{doc.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">ID: {doc.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{doc.specialty}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">{doc.patients} Bệnh nhân</span>
                                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${doc.workload}%` }}
                                                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                            className={`h-full rounded-full ${doc.barColor}`}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${doc.statusColor}`}>
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-emerald-600 transition-all">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Patient Assignment Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase text-xs tracking-widest">
                                <UserCheck className="w-5 h-5 text-emerald-600" />
                                Phân công bệnh nhân mới
                            </h3>
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                4 Đang chờ
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {pendingAssignments.map((patient, i) => (
                                        <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-800 dark:text-white text-sm tracking-tight">{patient.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{patient.symptoms}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <select className="w-full text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-1 focus:ring-emerald-600 px-4 py-2.5 min-w-[200px]">
                                                    <option>Chọn bác sĩ...</option>
                                                    <option>BS. Nguyễn Văn An (Rảnh)</option>
                                                    <option>BS. Lê Thị Mai (Bận)</option>
                                                </select>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="bg-emerald-600 text-white text-[10px] px-6 py-2.5 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 active:scale-95">
                                                    Xác nhận
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Workload Analytics Sidebar */}
                <div className="flex flex-col gap-8">
                    {/* Summary Card */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-black text-slate-900 dark:text-white mb-8 uppercase text-xs tracking-widest flex items-center gap-3">
                            <Stethoscope className="w-5 h-5 text-emerald-600" />
                            Hiệu suất đội ngũ
                        </h3>
                        <div className="flex flex-col gap-8">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tỷ lệ sử dụng phòng khám</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">78%</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '78%' }}
                                        transition={{ duration: 1 }}
                                        className="h-full bg-emerald-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20 group hover:bg-emerald-600 transition-all cursor-default">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 group-hover:text-emerald-100">Ca đã hoàn tất</p>
                                    <p className="text-2xl font-black text-emerald-600 group-hover:text-white">142</p>
                                </div>
                                <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 group hover:bg-slate-900 transition-all cursor-default">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 group-hover:text-slate-500">Thời gian chờ TB</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-white">15m</p>
                                </div>
                            </div>
                            <div className="border-t border-slate-50 dark:border-slate-800 pt-8">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Trạng thái đội ngũ</h4>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] group-hover:scale-125 transition-transform"></div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Đang rảnh</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">8 BS</span>
                                    </div>
                                    <div className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)] group-hover:scale-125 transition-transform"></div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Vừa phải</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">12 BS</span>
                                    </div>
                                    <div className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] group-hover:scale-125 transition-transform"></div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Quá tải</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">3 BS</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Suggestions Card */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-6 h-6 text-white" />
                            <h3 className="font-black uppercase text-xs tracking-widest">Hệ thống gợi ý AI</h3>
                        </div>
                        <p className="text-sm font-bold text-emerald-50/90 leading-relaxed mb-8">
                            Dựa trên khối lượng công việc hiện tại, bạn nên ưu tiên điều phối bệnh nhân mới cho khoa <span className="text-white underline decoration-white/30 underline-offset-4">Nội tiết</span> và <span className="text-white underline decoration-white/30 underline-offset-4">Nhi khoa</span> để cân bằng hiệu suất.
                        </p>
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2">
                            Xem chi tiết báo cáo
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
