import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getPendingPrescriptions, dispensePrescription } from '@/api/prescriptions'
import { Pill, Search, User, ClipboardList, CheckCircle2, Loader2, PackageOpen } from 'lucide-react'
import { useState } from 'react'
import { toastService } from '@/services/toast'
import { motion, AnimatePresence } from 'framer-motion'

export function PharmacyDispensing() {
    const { headers, branchId } = useTenant()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')

    const { data: prescriptions, isLoading } = useQuery({
        queryKey: ['pending-prescriptions', branchId],
        queryFn: () => getPendingPrescriptions(branchId!, headers),
        enabled: !!branchId && !!headers?.tenantId,
        refetchInterval: 10000,
    })

    const dispenseMutation = useMutation({
        mutationFn: (id: string) => dispensePrescription(id, headers),
        onSuccess: () => {
            toastService.success('✅ Đã xác nhận cấp phát thuốc thành công!')
            queryClient.invalidateQueries({ queryKey: ['pending-prescriptions'] })
            queryClient.invalidateQueries({ queryKey: ['pharmacy-inventory'] })
        },
        onError: (e: Error) => toastService.error(e.message)
    })

    const filteredPrescriptions = prescriptions?.filter(p =>
        p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cấp phát Thuốc</h1>
                    <p className="text-slate-500 mt-2 font-medium">Hệ thống quản lý đơn thuốc chờ cấp phát và khấu trừ tồn kho.</p>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#2b8cee] transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm bệnh nhân hoặc mã đơn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-[#2b8cee]/10 focus:border-[#2b8cee] outline-none transition-all font-medium"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100">
                    <Loader2 className="h-10 w-10 text-slate-300 animate-spin mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
                </div>
            ) : filteredPrescriptions?.length === 0 ? (
                <div className="bg-white rounded-[3rem] text-center py-24 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                            <PackageOpen className="h-12 w-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Không có đơn thuốc nào</h3>
                        <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto">Hiện tại không có đơn thuốc nào đang chờ cấp phát tại chi nhánh này.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredPrescriptions?.map((p) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={p.id}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group hover:border-[#2b8cee]/30 transition-all duration-300"
                            >
                                {/* Prescription Header */}
                                <div className="p-8 border-b border-slate-50">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-xl tracking-tight leading-none mb-1">{p.patientName}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã BN: {p.patientId.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200/50">
                                                Chờ cấp phát
                                            </div>
                                            {p.invoiceStatus === 'PAID' ? (
                                                <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200/50 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Đã thu tiền
                                                </div>
                                            ) : (
                                                <div className="bg-red-100 text-red-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-200/50">
                                                    CHƯA THANH TOÁN
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã đơn thuốc</p>
                                            <p className="text-sm font-bold text-slate-700">{p.id.slice(0, 12)}...</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bác sĩ chỉ định</p>
                                            <p className="text-sm font-bold text-slate-700">BS. {p.doctorName || 'Hệ thống'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Area */}
                                <div className="p-8 bg-slate-50/30">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ClipboardList className="h-4 w-4 text-[#2b8cee]" />
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Danh mục thuốc ({p.items.length})</span>
                                    </div>
                                    <div className="space-y-3">
                                        {p.items.map((item, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between group/item hover:border-[#2b8cee]/20 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2b8cee]">
                                                        <Pill className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 leading-tight">{item.productName}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">{item.dosageInstruction}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-slate-900">x{item.quantity}</p>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest ${item.availableStock >= item.quantity ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        Kho: {item.availableStock || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="p-8 border-t border-slate-100">
                                    <button
                                        onClick={() => dispenseMutation.mutate(p.id)}
                                        disabled={dispenseMutation.isPending || p.invoiceStatus !== 'PAID'}
                                        className="w-full group/btn relative overflow-hidden bg-slate-900 text-white py-4 rounded-2xl font-black text-sm tracking-tight transition-all hover:bg-[#2b8cee] hover:shadow-2xl hover:shadow-[#2b8cee]/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed active:scale-95"
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-2">
                                            {dispenseMutation.isPending ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    {p.invoiceStatus === 'PAID' ? 'Xác nhận Cấp phát ngay' : 'Chưa thể cấp phát'}
                                                    <CheckCircle2 className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
