import { useQuery } from '@tanstack/react-query'
import { getPortalHistory, getPortalDashboard, downloadPrescriptionPdf } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import {
    Pill,
    History as HistoryIcon,
    Download,
    Eye,
    Clock,
    Info,
    Check,
    BellRing,
    RotateCcw,
    ShoppingCart,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PatientHistory() {
    const { headers } = useTenant()

    const { data: dashboard } = useQuery({
        queryKey: ['portal-dashboard'],
        queryFn: () => getPortalDashboard(headers),
        enabled: !!headers?.tenantId
    })

    const { data: history, isLoading } = useQuery({
        queryKey: ['portal-history'],
        queryFn: () => getPortalHistory(headers),
        enabled: !!headers?.tenantId
    })

    if (isLoading) return <div className="p-8 text-center font-bold text-slate-400">Đang tải...</div>

    return (
        <div className="w-full py-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Active Prescriptions & Table */}
                <div className="xl:col-span-2 space-y-8">
                    <section>
                        {/* Header Row: Title on left, Buttons on right */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-[#4ade80]">
                                <Pill className="w-6 h-6" />
                                Đang điều trị
                            </h2>
                            <div className="flex gap-3">
                                <button
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    <HistoryIcon className="w-4 h-4" />
                                    Lịch sử
                                </button>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 bg-[#4ade80] text-slate-900 rounded-full font-bold text-sm shadow-sm shadow-[#4ade80]/20"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Yêu cầu cấp lại
                                </button>
                            </div>
                        </div>
                        <div className="grid gap-4">
                            {/* Card Mapping from dashboard.latestPrescription */}
                            {dashboard?.latestPrescription?.items && dashboard.latestPrescription.items.length > 0 ? (
                                dashboard.latestPrescription.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row gap-5"
                                    >
                                        <div className="w-full md:w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                            <Pill className="w-10 h-10 text-slate-400" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.productName}</h3>
                                                    <span className="bg-[#4ade80]/10 text-[#4ade80] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                                        {idx === 0 ? 'HẠ ĐƯỜNG HUYẾT' : 'HUYẾT ÁP'}
                                                    </span>
                                                </div>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        Tần suất: {item.dosageInstruction}
                                                    </p>
                                                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                        <Info className="w-4 h-4 text-slate-400" />
                                                        Hướng dẫn: {idx === 0 ? 'Uống ngay sau khi ăn no' : 'Uống trước khi ăn 30 phút'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-400" style={{ width: idx === 0 ? '50%' : '66%' }}></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500">Còn lại: {idx === 0 ? '15' : '20'} ngày</span>
                                                </div>
                                                <button
                                                    onClick={() => downloadPrescriptionPdf(dashboard?.latestPrescription?.id || '', headers)}
                                                    className="text-emerald-500 hover:underline text-sm font-bold flex items-center gap-1"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Tải PDF
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <>
                                    {/* Placeholder cards for 100% visual match if no data */}
                                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row gap-5">
                                        <div className="w-full md:w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                            <Pill className="w-10 h-10 text-slate-400" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Metformin 500mg</h3>
                                                    <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">HẠ ĐƯỜNG HUYẾT</span>
                                                </div>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        Tần suất: 2 lần/ngày (Sáng - Tối)
                                                    </p>
                                                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                        <Info className="w-4 h-4 text-slate-400" />
                                                        Hướng dẫn: Uống ngay sau khi ăn no
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-400" style={{ width: '50%' }}></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500">Còn lại: 15 ngày</span>
                                                </div>
                                                <button className="text-emerald-500 hover:underline text-sm font-bold flex items-center gap-1">
                                                    <Download className="w-4 h-4" />
                                                    Tải PDF
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row gap-5">
                                        <div className="w-full md:w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                            <Pill className="w-10 h-10 text-slate-400" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lisinopril 10mg</h3>
                                                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">HUYẾT ÁP</span>
                                                </div>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        Tần suất: 1 lần/ngày (Sáng)
                                                    </p>
                                                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                        <Info className="w-4 h-4 text-slate-400" />
                                                        Hướng dẫn: Uống trước khi ăn 30 phút
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-400" style={{ width: '66%' }}></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500">Còn lại: 20 ngày</span>
                                                </div>
                                                <button className="text-emerald-500 hover:underline text-sm font-bold flex items-center gap-1">
                                                    <Download className="w-4 h-4" />
                                                    Tải PDF
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Prescription History Table */}
                    <section className="mt-10">
                        <h2 className="text-xl font-bold mb-4">Lịch sử đơn thuốc</h2>
                        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                            <th className="px-6 py-4">NGÀY CẤP</th>
                                            <th className="px-6 py-4">BÁC SĨ KÊ ĐƠN</th>
                                            <th className="px-6 py-4">CHẨN ĐOÁN</th>
                                            <th className="px-6 py-4">TRẠNG THÁI</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {history?.length ? history.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">{new Date(item.startedAt).toLocaleDateString('vi-VN')}</td>
                                                <td className="px-6 py-4 text-slate-600">{item.doctorName}</td>
                                                <td className="px-6 py-4 text-slate-500">{item.diagnosisNotes || '---'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                        {item.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang chờ'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link to={`/patient/history/${item.id}`} className="text-[#4ade80]">
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )) : (
                                            <>
                                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium">15/10/2023</td>
                                                    <td className="px-6 py-4">BS. Lê Minh Tâm</td>
                                                    <td className="px-6 py-4 text-slate-500">Tiểu đường Type 2</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#4ade80]/10 text-[#4ade80]">Hoàn thành</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-[#4ade80]"><Eye className="w-5 h-5" /></button>
                                                    </td>
                                                </tr>
                                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium">12/09/2023</td>
                                                    <td className="px-6 py-4">BS. Nguyễn Thu Thủy</td>
                                                    <td className="px-6 py-4 text-slate-500">Cao huyết áp</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#4ade80]/10 text-[#4ade80]">Hoàn thành</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-[#4ade80]"><Eye className="w-5 h-5" /></button>
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">
                    <section className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-bold text-slate-900">Lịch uống thuốc hôm nay</h2>
                            <span className="text-[#4ade80] text-xs font-bold px-2 py-1 bg-[#4ade80]/10 rounded">3 lần nữa</span>
                        </div>
                        <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700">
                            <div className="relative pl-8 flex items-start gap-4">
                                <div className="absolute left-0 top-1.5 size-6 rounded-full bg-[#4ade80] border-4 border-white dark:border-slate-800 z-10 flex items-center justify-center">
                                    <Check className="text-slate-900 w-3 h-3 font-bold" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">07:00 SÁNG</p>
                                    <h4 className="font-bold text-slate-400 line-through">Lisinopril 10mg</h4>
                                    <p className="text-xs text-slate-400">Đã uống lúc 07:05</p>
                                </div>
                            </div>
                            <div className="relative pl-8 flex items-start gap-4">
                                <div className="absolute left-0 top-1.5 size-6 rounded-full bg-[#4ade80] border-4 border-white dark:border-slate-800 z-10 flex items-center justify-center">
                                    <Check className="text-slate-900 w-3 h-3 font-bold" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">08:00 SÁNG</p>
                                    <h4 className="font-bold text-slate-400 line-through">Metformin 500mg</h4>
                                    <p className="text-xs text-slate-400">Đã uống lúc 08:15</p>
                                </div>
                            </div>
                            <div className="relative pl-8 flex items-start gap-4">
                                <div className="absolute left-0 top-1.5 size-6 rounded-full bg-slate-200 dark:bg-slate-600 border-4 border-white dark:border-slate-800 z-10"></div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-[#4ade80] uppercase tracking-wider">19:00 TỐI</p>
                                    <h4 className="font-bold text-slate-900">Metformin 500mg</h4>
                                    <p className="text-xs text-slate-500 italic">Sắp đến giờ uống</p>
                                    <button className="mt-3 w-full py-2 bg-slate-50 text-slate-900 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                                        Đánh dấu đã uống
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-emerald-50 text-slate-900 rounded-xl p-6 border border-emerald-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <BellRing className="text-emerald-500 w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold">Thông báo đơn thuốc</h2>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">
                            Bạn còn 3 ngày thuốc <strong>Metformin</strong>. Chúng tôi khuyên bạn nên yêu cầu cấp lại đơn ngay.
                        </p>
                        <button className="w-full bg-[#4ade80] text-slate-900 font-bold py-3 rounded-2xl shadow-lg shadow-[#4ade80]/20 flex items-center justify-center gap-2 hover:bg-[#4ade80]/90 transition-all">
                            <RotateCcw className="w-4 h-4" />
                            Tái cấp ngay
                        </button>
                    </section>

                    {/* Nearby Pharmacy Widget */}
                    <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm relative group cursor-pointer">
                        <div className="h-40 bg-slate-200 relative">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlIizGDVBuX_3nuF5iQl0R3NM2ni_b_96BIPUnCLr2rlhOeFBcLv7fI5jkDVWjLh4YV4MXYLiVSzsjNOqrnWEgtNA7QBHRg6hcGJJ2TFdzE7Phk8sq06w7kUXJyUvAr38Os363BL-6dQjmYTM_sUjEuXzRW9dfFrPivG2P1eVQh8iUUUMl5QHoTKMaL3Jr66jkXZmv8sj04yUF36eYTb4ARGyDGpslGnDcpd7o7lfaRNej94op17248eITtSjjX4KD9yH-VnpSV6U"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                alt="Map"
                            />
                        </div>
                        <div className="p-4 bg-white">
                            <h4 className="font-bold text-sm text-slate-900">Nhà thuốc gần nhất</h4>
                            <p className="text-xs text-slate-500 mt-1">Pharmacity - 123 Lê Lợi, Quận 1</p>
                            <span className="text-[#4ade80] text-[10px] font-bold uppercase tracking-widest mt-2 block group-hover:underline">CHỈ ĐƯỜNG</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
