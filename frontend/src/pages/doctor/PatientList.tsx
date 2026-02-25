import {
    Search,
    UserPlus,
    Filter,
    Eye,
    MessageSquare,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function PatientList() {
    const [searchTerm, setSearchTerm] = useState('')

    const patients = [
        {
            id: '#BN29410',
            name: 'Lê Minh Tuấn',
            age: 45,
            gender: 'Nam',
            avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
            disease: 'Tiểu đường Type 2',
            metric: 'HBA1C: 7.2%',
            updated: '2 giờ trước',
            status: 'Theo dõi',
            statusColor: 'amber',
        },
        {
            id: '#BN28552',
            name: 'Nguyễn Thị Mai',
            age: 62,
            gender: 'Nữ',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            disease: 'Tăng huyết áp',
            metric: 'Huyết áp: 165/95',
            updated: '15 phút trước',
            status: 'Nguy cơ cao',
            statusColor: 'rose',
        },
        {
            id: '#BN30119',
            name: 'Phạm Văn Đức',
            age: 38,
            gender: 'Nam',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            disease: 'Sức khỏe tổng quát',
            metric: 'Nhịp tim: 72 bpm',
            updated: 'Hôm qua',
            status: 'Bình thường',
            statusColor: 'emerald',
        },
        {
            id: '#BN31004',
            name: 'Trần Thu Hà',
            age: 29,
            gender: 'Nữ',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
            disease: 'Hen suyễn',
            metric: 'SpO2: 98%',
            updated: '1 ngày trước',
            status: 'Bình thường',
            statusColor: 'emerald',
        }
    ]

    return (
        <div className="space-y-8 font-sans">
            {/* Page Title & CTA */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Danh sách bệnh nhân đang quản lý</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Quản lý và theo dõi thông tin sức khỏe định kỳ của bệnh nhân.</p>
                </motion.div>
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-[13px] font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    Thêm bệnh nhân mới
                </motion.button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[13px] shadow-sm border border-slate-200/60 dark:border-slate-800">
                <div className="flex flex-wrap gap-6 items-end">
                    <div className="flex-1 min-w-[300px]">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Tìm kiếm</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3 rounded-[13px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-bold"
                                placeholder="Tìm theo tên hoặc mã bệnh nhân..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="w-60">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Loại bệnh</label>
                        <select className="w-full px-5 py-3 rounded-[13px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-xs font-bold appearance-none cursor-pointer">
                            <option>Tất cả loại bệnh</option>
                            <option>Tiểu đường</option>
                            <option>Huyết áp</option>
                            <option>Tim mạch</option>
                            <option>Hen suyễn</option>
                        </select>
                    </div>
                    <div className="w-60">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Mức độ nguy cơ</label>
                        <select className="w-full px-5 py-3 rounded-[13px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-xs font-bold appearance-none cursor-pointer">
                            <option>Tất cả mức độ</option>
                            <option>Bình thường</option>
                            <option>Theo dõi</option>
                            <option>Nguy cơ cao</option>
                        </select>
                    </div>
                    <button className="w-12 h-12 flex items-center justify-center rounded-[13px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-blue-600 shadow-sm bg-white">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[13px] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Bệnh nhân</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Mã BN</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Loại bệnh</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Chỉ số mới nhất</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Trạng thái</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {patients.map((patient, idx) => (
                                <motion.tr
                                    key={patient.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={patient.avatar} alt="" className="w-12 h-12 rounded-[13px] object-cover shadow-sm ring-4 ring-slate-50 dark:ring-slate-800 group-hover:ring-blue-100 transition-all" />
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${patient.statusColor === 'emerald' ? 'bg-emerald-500' :
                                                    patient.statusColor === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}></div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 dark:text-white">{patient.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{patient.age} tuổi • {patient.gender}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-400">{patient.id}</td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-[13px] uppercase tracking-wider ${patient.disease.includes('Tiểu đường') ? 'bg-blue-50 text-blue-600' :
                                            patient.disease.includes('Tăng huyết áp') ? 'bg-rose-50 text-rose-600' :
                                                patient.disease.includes('Hen suyễn') ? 'bg-indigo-50 text-indigo-600' :
                                                    'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {patient.disease}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-black text-slate-700 dark:text-slate-200">
                                            {patient.metric.split(':')[0]}: <span className="text-blue-600">{patient.metric.split(':')[1]}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Cập nhật: {patient.updated}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-[13px] uppercase tracking-wider ${patient.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                            patient.statusColor === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${patient.statusColor === 'emerald' ? 'bg-emerald-500' :
                                                patient.statusColor === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                                                }`}></span>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[13px] transition-all" title="Xem chi tiết">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[13px] transition-all" title="Nhắn tin">
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[13px] transition-all" title="Tạo đơn thuốc">
                                                <ClipboardList className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-6 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Hiển thị <span className="text-slate-900 dark:text-white">1 - 4</span> trên tổng số <span className="text-slate-900 dark:text-white">128</span> bệnh nhân
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-[13px] border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all disabled:opacity-30" disabled>
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-[13px] bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-600/20">1</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-[13px] hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-all text-slate-500">2</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-[13px] hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-all text-slate-500">3</button>
                        <span className="px-2 text-slate-300 font-bold">...</span>
                        <button className="w-10 h-10 flex items-center justify-center rounded-[13px] hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-all text-slate-500">32</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-[13px] border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-500">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
