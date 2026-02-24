import { getPortalInvoices, payPortalInvoice, getVnpayPaymentUrl } from '@/api/portal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import {
    Wallet,
    Search,
    CreditCard,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    QrCode
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import toast from 'react-hot-toast'

export default function PatientBilling() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PAID' | 'CANCELLED'>('ALL')
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [paymentMethod, setPaymentMethod] = useState<'MOMO' | 'VNPAY' | 'BANK'>('BANK')

    const { data: invoices, isLoading } = useQuery({
        queryKey: ['portal-invoices'],
        queryFn: () => getPortalInvoices(headers),
        enabled: !!headers?.tenantId
    })

    const mutation = useMutation({
        mutationFn: async ({ id, method }: { id: string, method: string }) => {
            if (method === 'VNPAY') {
                const returnUrl = `${window.location.origin}/patient/payment-return`
                const paymentUrl = await getVnpayPaymentUrl(id, returnUrl, headers)
                window.location.href = paymentUrl
                return null
            }
            return payPortalInvoice(id, method, headers)
        },
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ['portal-invoices'] })
                queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] })
                setSelectedInvoice(data)
                toast.success('Thanh toán thành công!')
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Thanh toán thất bại')
        }
    })

    const filteredInvoices = Array.isArray(invoices) ? invoices.filter(inv => {
        const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTab = activeTab === 'ALL' || inv.status === activeTab
        return matchesSearch && matchesTab
    }) : []

    // VietQR Generator Logic (Demo Simple)
    const generateVietQR = (amount: number, content: string) => {
        // This is a demo URL, in production use dynamic bank info
        return `https://api.vietqr.io/image/970415-123456789-f5H9v0G.jpg?accountName=HE%20THONG%20PHONG%20KHAM%20AI&amount=${amount}&addInfo=${content}`
    }

    if (isLoading) return <div className="p-12 text-center text-slate-400 font-bold">Đang tải hóa đơn...</div>

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                            <Wallet className="w-6 h-6" />
                        </div>
                        Thanh toán & Hóa đơn
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Theo dõi và thực hiện thanh toán chi phí khám chữa bệnh của bạn.</p>
                </div>

                {/* Visual Status Pills */}
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm self-start">
                    {(['ALL', 'PENDING', 'PAID'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab === 'ALL' ? 'Tất cả' : tab === 'PENDING' ? 'Chưa trả' : 'Đã trả'}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* List Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search & Filter */}
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm theo mã hóa đơn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>

                    <div className="space-y-4">
                        {filteredInvoices?.map((inv, idx) => (
                            <motion.div
                                key={inv.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                onClick={() => setSelectedInvoice(inv)}
                                className={`group p-6 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden ${selectedInvoice?.id === inv.id
                                    ? 'bg-white border-blue-500 shadow-2xl shadow-blue-500/10'
                                    : 'bg-white border-slate-50 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            <CreditCard className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">#{inv.invoiceNumber}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                    }`}>
                                                    {inv.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 line-clamp-1">{inv.finalAmount.toLocaleString('vi-VN')} đ</h3>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(inv.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Hình thức</p>
                                            <p className="text-xs font-bold text-slate-600">{inv.paymentMethod || 'Chưa chọn'}</p>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedInvoice?.id === inv.id ? 'bg-blue-600 text-white rotate-90' : 'bg-slate-50 text-slate-300'
                                            }`}>
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {(!filteredInvoices || filteredInvoices.length === 0) && (
                            <div className="bg-white rounded-[3rem] py-24 text-center border border-slate-100 border-dashed">
                                <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-lg font-black text-slate-900">Không tìm thấy hóa đơn</h3>
                                <p className="text-slate-400 font-medium">Bạn không có giao dịch nào phù hợp với tìm kiếm.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Column / QR Section */}
                <div className="space-y-8">
                    <AnimatePresence mode="wait">
                        {selectedInvoice ? (
                            <motion.div
                                key={selectedInvoice.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-8 shadow-2xl shadow-slate-900/40 overflow-hidden"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -mr-32 -mt-32" />

                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 text-center">Chi tiết hóa đơn</p>
                                            <h2 className="text-2xl font-black tracking-tight">{selectedInvoice.finalAmount.toLocaleString('vi-VN')} đ</h2>
                                        </div>
                                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                            {selectedInvoice.status === 'PAID' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Clock className="w-6 h-6 text-rose-400" />}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-4 border-b border-white/10">
                                            <span className="text-xs font-bold text-slate-400">Mã hóa đơn</span>
                                            <span className="text-xs font-black uppercase tracking-tighter">#{selectedInvoice.invoiceNumber}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-4 border-b border-white/10">
                                            <span className="text-xs font-bold text-slate-400">Trạng thái</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedInvoice.status === 'PAID' ? 'text-emerald-400' : 'text-rose-400'
                                                }`}>
                                                {selectedInvoice.status === 'PAID' ? 'Đã hoàn tất' : 'Đang chờ'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Selector for Pending */}
                                    {selectedInvoice.status === 'PENDING' && (
                                        <div className="space-y-6 pt-4">
                                            <div className="flex gap-2">
                                                {[
                                                    { id: 'BANK', label: 'VietQR', icon: QrCode },
                                                    { id: 'MOMO', label: 'MoMo', icon: Wallet },
                                                    { id: 'VNPAY', label: 'VNPay', icon: CreditCard }
                                                ].map((m) => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => setPaymentMethod(m.id as any)}
                                                        className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${paymentMethod === m.id
                                                            ? 'bg-blue-600 border-blue-500 text-white'
                                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <m.icon className="w-5 h-5" />
                                                        <span className="text-[10px] font-black uppercase">{m.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {paymentMethod === 'BANK' ? (
                                                <div className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quét VietQR để thanh toán</p>
                                                    <div className="relative group">
                                                        <img
                                                            src={generateVietQR(selectedInvoice.finalAmount, selectedInvoice.invoiceNumber)}
                                                            alt="VietQR"
                                                            className="w-48 h-48 rounded-2xl border-4 border-slate-50 shadow-sm"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                                            <QrCode className="w-10 h-10 text-slate-900" />
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 text-center italic">Sử dụng mọi app Ngân hàng để quét.</p>
                                                </div>
                                            ) : (
                                                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center animate-in slide-in-from-bottom-4 duration-300">
                                                    <p className="text-slate-400 text-sm font-medium">Bạn đã chọn thanh toán qua {paymentMethod}.</p>
                                                    <p className="text-[10px] font-bold text-blue-400 uppercase mt-2">Hệ thống sẽ chuyển hướng sau khi nhấn nút.</p>
                                                </div>
                                            )}

                                            <button
                                                disabled={mutation.isPending}
                                                onClick={() => mutation.mutate({ id: selectedInvoice.id, method: paymentMethod })}
                                                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                            >
                                                {mutation.isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                                                {!mutation.isPending && <ArrowRight className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    )}

                                    {selectedInvoice.status === 'PAID' && (
                                        <div className="pt-4">
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2.5rem] text-center space-y-3">
                                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                                                <h4 className="text-sm font-black text-emerald-400">Cảm ơn bạn đã thanh toán!</h4>
                                                <p className="text-[10px] font-medium text-slate-400">Giao dịch đã được ghi nhận vào: {new Date(selectedInvoice.updatedAt).toLocaleString('vi-VN')}</p>
                                            </div>
                                            <Link
                                                to={`/patient/history/${selectedInvoice.consultationId}`}
                                                className="mt-6 flex items-center justify-center gap-3 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all"
                                            >
                                                Xem hồ sơ khám
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white border border-dashed border-slate-200 rounded-[3rem] p-12 text-center sticky top-8 flex flex-col items-center justify-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                    <CreditCard className="w-10 h-10 text-slate-200" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900">Chọn một hóa đơn</h4>
                                    <p className="text-xs font-medium text-slate-400">Nhấn vào hóa đơn bên trái để xem chi tiết và thanh toán.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
