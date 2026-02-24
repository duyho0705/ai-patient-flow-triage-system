import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PaymentReturn() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState<'SUCCESS' | 'FAILED' | 'ERROR'>('ERROR')

    useEffect(() => {
        const responseCode = searchParams.get('vnp_ResponseCode')
        if (responseCode === '00') {
            setStatus('SUCCESS')
        } else if (responseCode) {
            setStatus('FAILED')
        } else {
            setStatus('ERROR')
        }
    }, [searchParams])

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-10 text-center"
            >
                {status === 'SUCCESS' && (
                    <>
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4">Thanh toán thành công!</h1>
                        <p className="text-slate-500 font-medium leading-relaxed mb-10">
                            Cảm ơn bạn. Giao dịch đã được hoàn tất thành công. Hệ thống đã cập nhật trạng thái hóa đơn của bạn.
                        </p>
                    </>
                )}

                {status === 'FAILED' && (
                    <>
                        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <XCircle className="w-12 h-12 text-rose-500" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4">Thanh toán thất bại</h1>
                        <p className="text-slate-500 font-medium leading-relaxed mb-10">
                            Rất tiếc, giao dịch không thể hoàn thành. Vui lòng thử lại hoặc sử dụng phương thức thanh toán khác.
                        </p>
                    </>
                )}

                {status === 'ERROR' && (
                    <>
                        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <XCircle className="w-12 h-12 text-amber-500" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4">Lỗi hệ thống</h1>
                        <p className="text-slate-500 font-medium leading-relaxed mb-10">
                            Hệ thống không thể xác định trạng thái giao dịch của bạn. Vui lòng liên hệ bộ phận hỗ trợ.
                        </p>
                    </>
                )}

                <div className="grid gap-4">
                    <Link
                        to="/patient/billing"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                    >
                        Quay lại Hóa đơn
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        to="/patient"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
                    >
                        Về Trang chủ
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
