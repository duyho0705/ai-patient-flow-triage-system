import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getInvoice, payInvoice, listInvoices } from '@/api/billing'
import { toastService } from '@/services/toast'
import { CreditCard, Receipt, Clock, CheckCircle, Search, ArrowRight, User } from 'lucide-react'

export function Billing() {
    const { headers, branchId } = useTenant()
    const queryClient = useQueryClient()
    const [searchId, setSearchId] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('PENDING')
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

    // List Invoices
    const { data: invoices, isLoading: isListLoading } = useQuery({
        queryKey: ['invoices', branchId, statusFilter],
        queryFn: () => listInvoices({ branchId: branchId!, status: statusFilter }, headers),
        enabled: !!branchId && !!headers?.tenantId,
    })

    // Detail Invoice
    const { data: invoiceDetail, isLoading: isDetailLoading } = useQuery({
        queryKey: ['invoice', selectedInvoiceId],
        queryFn: () => getInvoice(selectedInvoiceId!, headers),
        enabled: !!selectedInvoiceId && !!headers?.tenantId,
    })

    const pay = useMutation({
        mutationFn: (paymentMethod: string) => payInvoice(selectedInvoiceId!, paymentMethod, headers),
        onSuccess: () => {
            toastService.success('💰 Đã xác nhận thanh toán thành công')
            queryClient.invalidateQueries({ queryKey: ['invoice', selectedInvoiceId] })
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
        },
        onError: (e: Error) => toastService.error(e.message),
    })

    const filteredInvoices = invoices?.filter(inv =>
        !searchId ||
        inv.invoiceNumber.toLowerCase().includes(searchId.toLowerCase()) ||
        inv.patientName?.toLowerCase().includes(searchId.toLowerCase())
    )

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <header className="page-header">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Quản lý Viện phí</h1>
                    <p className="text-slate-500 mt-2">Theo dõi, thu phí và quản lý hóa đơn bệnh nhân.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Search & List */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="card p-4">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Mã hóa đơn / Tên bệnh nhân..."
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    className="input pl-10 w-full"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStatusFilter('PENDING')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === 'PENDING' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : 'bg-slate-50 text-slate-500'}`}
                                >
                                    Chờ thu
                                </button>
                                <button
                                    onClick={() => setStatusFilter('PAID')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === 'PAID' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-50 text-slate-500'}`}
                                >
                                    Đã thu
                                </button>
                                <button
                                    onClick={() => setStatusFilter('')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === '' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500'}`}
                                >
                                    Tất cả
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        {isListLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white border border-slate-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : filteredInvoices?.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                                <p className="text-sm text-slate-400">Không tìm thấy hóa đơn nào</p>
                            </div>
                        ) : (
                            filteredInvoices?.map((inv) => (
                                <button
                                    key={inv.id}
                                    onClick={() => setSelectedInvoiceId(inv.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${selectedInvoiceId === inv.id ? 'bg-white border-blue-500 ring-4 ring-blue-50 shadow-lg' : 'bg-white border-slate-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">#{inv.invoiceNumber}</span>
                                        <StatusBadge status={inv.status} />
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 leading-none">{inv.patientName}</div>
                                            <div className="text-[10px] text-slate-400 mt-1">{new Date(inv.createdAt).toLocaleString('vi-VN')}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end pt-2 border-t border-slate-50">
                                        <span className="text-xs text-slate-500">Tổng cộng</span>
                                        <span className="font-black text-blue-600">{(inv.finalAmount || 0).toLocaleString('vi-VN')} đ</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </section>
                </div>

                {/* Right Side: Invoice Detail */}
                <div className="lg:col-span-2">
                    {selectedInvoiceId ? (
                        isDetailLoading ? (
                            <div className="card h-[600px] flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-slate-500">Đang tải chi tiết hóa đơn...</p>
                                </div>
                            </div>
                        ) : invoiceDetail && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="card space-y-8 relative overflow-hidden">
                                    {/* Watermark/Decorator */}
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Receipt className="w-64 h-64 -mr-16 -mt-16" />
                                    </div>

                                    <div className="flex justify-between items-start relative pb-6 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900">Chi tiết hóa đơn</h3>
                                            <p className="text-slate-400 font-mono tracking-tighter uppercase text-sm">#{invoiceDetail.invoiceNumber}</p>
                                        </div>
                                        <StatusBadge status={invoiceDetail.status} size="lg" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 relative">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bệnh nhân</span>
                                            <p className="font-bold text-slate-900 text-lg">{invoiceDetail.patientName}</p>
                                            <p className="text-xs text-slate-500">ID: {invoiceDetail.patientId}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày lập</span>
                                            <p className="font-bold text-slate-900">{new Date(invoiceDetail.createdAt).toLocaleString('vi-VN')}</p>
                                            <p className="text-xs text-slate-500">Tại: Phòng khám PatientFlow</p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-2 border-slate-900 text-slate-900">
                                                    <th className="text-left py-4 font-black uppercase tracking-widest text-xs">Mô tả dịch vụ / Thuốc</th>
                                                    <th className="text-center py-4 font-black uppercase tracking-widest text-xs">SL</th>
                                                    <th className="text-right py-4 font-black uppercase tracking-widest text-xs">Đơn giá</th>
                                                    <th className="text-right py-4 font-black uppercase tracking-widest text-xs">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {invoiceDetail.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-4 font-bold text-slate-800">{item.itemName}</td>
                                                        <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                                                        <td className="py-4 text-right text-slate-600">{item.unitPrice.toLocaleString('vi-VN')} đ</td>
                                                        <td className="py-4 text-right font-black text-slate-900">{item.lineTotal.toLocaleString('vi-VN')} đ</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                                        <div className="flex justify-between text-sm text-slate-500">
                                            <span>Tạm tính</span>
                                            <span className="font-bold">{invoiceDetail.totalAmount.toLocaleString('vi-VN')} đ</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-red-600">
                                            <span>Giảm giá / Miễn giảm</span>
                                            <span className="font-bold">-{invoiceDetail.discountAmount.toLocaleString('vi-VN')} đ</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                            <span className="text-lg font-black text-slate-900 uppercase">Tổng cộng hồ sơ</span>
                                            <span className="text-3xl font-black text-blue-600">{invoiceDetail.finalAmount.toLocaleString('vi-VN')} đ</span>
                                        </div>
                                    </div>

                                    {invoiceDetail.status === 'PENDING' ? (
                                        <div className="space-y-4">
                                            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                                                Phương thức thanh toán
                                            </h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <button
                                                    onClick={() => pay.mutate('CASH')}
                                                    disabled={pay.isPending}
                                                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all group"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                        <CreditCard className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                                                    </div>
                                                    <span className="font-bold text-slate-900">Tiền mặt</span>
                                                </button>
                                                <button
                                                    onClick={() => pay.mutate('BANK_TRANSFER')}
                                                    disabled={pay.isPending}
                                                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all group"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                        <ArrowRight className="w-6 h-6 text-slate-600 group-hover:text-blue-600 rotate-45" />
                                                    </div>
                                                    <span className="font-bold text-slate-900">Chuyển khoản</span>
                                                </button>
                                                <button
                                                    onClick={() => pay.mutate('E_WALLET')}
                                                    disabled={pay.isPending}
                                                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all group"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                        <CheckCircle className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                                                    </div>
                                                    <span className="font-bold text-slate-900">Ví điện tử</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-emerald-900 uppercase">Thanh toán hoàn tất</p>
                                                    <p className="text-sm text-emerald-700 font-medium">
                                                        {invoiceDetail.paymentMethod === 'CASH' && 'Tiền mặt'}
                                                        {invoiceDetail.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản'}
                                                        {invoiceDetail.paymentMethod === 'E_WALLET' && 'Ví điện tử'}
                                                        {' • '}
                                                        {invoiceDetail.paidAt && new Date(invoiceDetail.paidAt).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => window.print()}
                                                className="btn-secondary flex items-center gap-2"
                                            >
                                                <Receipt className="w-4 h-4" />
                                                In biên lai
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="card h-full flex flex-col items-center justify-center py-24 text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                <Receipt className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Chưa chọn hóa đơn</h3>
                            <p className="text-slate-400 max-w-xs mx-auto">Chọn một hóa đơn từ danh sách bên trái để xem chi tiết và xử lý thanh toán.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'lg' }) {
    const isPaid = status === 'PAID'
    return (
        <span className={`inline-flex items-center gap-1.5 font-black uppercase tracking-widest rounded-full ring-1 ring-inset ${isPaid
            ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
            : 'bg-amber-100 text-amber-700 ring-amber-200'
            } ${size === 'lg' ? 'px-4 py-2 text-xs' : 'px-2 py-1 text-[9px]'}`}>
            {isPaid ? <CheckCircle className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} /> : <Clock className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
            {isPaid ? 'Đã thanh toán' : 'Chờ thu phí'}
        </span>
    )
}
