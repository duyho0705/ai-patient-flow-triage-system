import {
    Eye,
    Search,
    PlusCircle,
    Calendar,
    Filter,
    RefreshCw,
    Printer,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function PrescriptionList() {
    const [searchTerm, setSearchTerm] = useState('')

    const prescriptions = [
        {
            id: 'RX-2023-001',
            patientName: 'Nguyễn Hoàng Nam',
            date: '12/10/2023',
            diagnosis: 'Tăng huyết áp vô căn, Đái tháo đường T2',
            drugs: ['Amlodipine 5mg', 'Metformin 850mg'],
            extraDrugs: 3,
            status: 'active',
            statusLabel: 'Đang hiệu lực'
        },
        {
            id: 'RX-2023-002',
            patientName: 'Phạm Thị Lan',
            date: '05/09/2023',
            diagnosis: 'Suy tim sung huyết (NYHA II)',
            drugs: ['Bisoprolol 2.5mg', 'Furosemide 40mg'],
            extraDrugs: 0,
            status: 'expired',
            statusLabel: 'Đã hết hạn'
        },
        {
            id: 'RX-2023-003',
            patientName: 'Lê Văn Hùng',
            date: '28/09/2023',
            diagnosis: 'Gút cấp trên nền mạn tính',
            drugs: ['Colchicine 1mg', 'Allopurinol 300mg'],
            extraDrugs: 0,
            status: 'warning',
            statusLabel: 'Sắp hết hạn'
        },
        {
            id: 'RX-2023-004',
            patientName: 'Đặng Thu Thảo',
            date: '10/10/2023',
            diagnosis: 'Rối loạn Lipid máu, Béo phì độ 1',
            drugs: ['Atorvastatin 20mg'],
            extraDrugs: 0,
            status: 'active',
            statusLabel: 'Đang hiệu lực'
        }
    ]

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            case 'expired':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            case 'warning':
                return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
            default:
                return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            case 'expired':
                return <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            case 'warning':
                return <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            default:
                return null
        }
    }

    return (
        <div className="flex-1 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                        Quản lý toa thuốc
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Quản lý và theo dõi các đơn thuốc dài hạn của bệnh nhân mãn tính
                    </p>
                </div>
                <Link
                    to="/consultation"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-[13px] font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Tạo toa thuốc mới</span>
                </Link>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[13px] shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên BN, tên thuốc, chẩn đoán..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-[10px] text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-[10px] text-sm appearance-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none cursor-pointer">
                            <option>Tất cả thời gian</option>
                            <option>7 ngày qua</option>
                            <option>30 ngày qua</option>
                            <option>Tháng này</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-[10px] text-sm appearance-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none cursor-pointer">
                            <option>Tất cả trạng thái</option>
                            <option>Đang hiệu lực</option>
                            <option>Đã hết hạn</option>
                            <option>Gần hết hạn</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[13px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Bệnh nhân / Ngày kê</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Chẩn đoán</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Thuốc chính</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {prescriptions.map((px) => (
                                <tr key={px.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{px.patientName}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{px.date}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2 max-w-xs lowercase first-letter:uppercase">
                                            {px.diagnosis}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {px.drugs.map((drug, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-[6px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                                                >
                                                    {drug}
                                                </span>
                                            ))}
                                            {px.extraDrugs > 0 && (
                                                <span className="text-[10px] text-slate-400 font-black italic self-center ml-1">
                                                    +{px.extraDrugs} khác
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusStyle(px.status)}`}>
                                            {getStatusIcon(px.status)}
                                            {px.statusLabel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-[10px] transition-all" title="Xem chi tiết">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-[10px] transition-all" title="Tái bản đơn">
                                                <RefreshCw className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[10px] transition-all" title="In toa thuốc">
                                                <Printer className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Hiển thị <span className="text-slate-900 dark:text-white">1-4</span> trong <span className="text-slate-900 dark:text-white">48</span> đơn thuốc
                    </p>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-[10px] border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30 transition-all" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-[10px] border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 transition-all">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
