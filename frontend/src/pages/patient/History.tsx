import { useQuery } from '@tanstack/react-query'
import { getPortalHistory, getPortalDashboard, downloadPrescriptionPdf } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import {
    Pill,
    History as HistoryIcon,
    Download,
    Eye,
    Clock,
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
                            <h2 className="text-xl font-bold flex items-center gap-2 text-[#10b981]">
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
                                    className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-slate-900 rounded-full font-bold text-sm shadow-sm shadow-[#10b981]/20"
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
                                                </div>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        Hướng dẫn: {item.dosageInstruction}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-slate-500">Số lượng: {item.quantity}</span>
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
                                <div className="py-12 text-center bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 border-dashed">
                                    <Pill className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-bold text-sm">Hiện tại bạn không có đơn thuốc điện tử đang điều trị</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Prescription History Table */}
                    <section className="mt-10">
                        <h2 className="text-xl font-bold mb-4">Lịch sử đơn thuốc điện tử</h2>
                        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                            <th className="px-6 py-4">NGÀY CẤP</th>
                                            <th className="px-6 py-4">BÁC SĨ KÊ ĐƠN ĐIỆN TỬ</th>
                                            <th className="px-6 py-4">CHẨN ĐOÁN</th>
                                            <th className="px-6 py-4">TRẠNG THÁI</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {(history || []).length > 0 ? history?.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.startedAt ? new Date(item.startedAt).toLocaleDateString('vi-VN') : '---'}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.doctorName}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.diagnosisNotes || '---'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                        {item.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang chờ'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link to={`/patient/history/${item.id}`} className="text-[#10b981]">
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic">Chưa có lịch sử đơn thuốc điện tử</td>
                                            </tr>
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
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Nhắc nhở y tế</h2>
                        <p className="text-sm text-slate-500">Hệ thống sẽ hiển thị các nhắc nhở về lịch uống thuốc và tái khám tại đây.</p>
                    </section>
                </div>
            </div>
        </div>
    )
}
