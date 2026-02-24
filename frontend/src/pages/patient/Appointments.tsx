import { useQuery } from '@tanstack/react-query'
import { getPortalAppointments } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import {
    Calendar,
    Clock,
    MapPin,
    Video,
    PlusCircle,
    Filter,
    Search,
    Lightbulb,
    CalendarPlus
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, isAfter, isBefore, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function PatientAppointments() {
    const { headers } = useTenant()
    const navigate = useNavigate()

    const { data: appointments, isLoading } = useQuery({
        queryKey: ['portal-appointments'],
        queryFn: () => getPortalAppointments(headers),
        enabled: !!headers?.tenantId
    })

    const upcomingAppointments = appointments?.filter(apt =>
        isAfter(parseISO(`${apt.appointmentDate}T${apt.startTime}`), new Date()) &&
        apt.status !== 'CANCELLED'
    ) || []

    const historyAppointments = appointments?.filter(apt =>
        isBefore(parseISO(`${apt.appointmentDate}T${apt.startTime}`), new Date()) ||
        apt.status === 'CANCELLED'
    ) || []

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'CONFIRMED':
                return <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">Hoàn tất</span>
            case 'CANCELLED':
                return <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase">Đã hủy</span>
            case 'PENDING':
                return <span className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">Chờ xử lý</span>
            default:
                return <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Đã xác nhận</span>
        }
    }

    if (isLoading) return <div className="p-8 text-center text-slate-400 font-bold">Đang tải lịch hẹn...</div>

    return (
        <div className="flex flex-col lg:flex-row gap-8 py-8 pb-12">
            {/* Main Content Area */}
            <div className="flex-1 space-y-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Lịch hẹn</h2>
                        <p className="text-slate-500 dark:text-slate-400">Quản lý và theo dõi các buổi khám của bạn</p>
                    </div>
                    <button
                        onClick={() => navigate('/patient/booking')}
                        className="bg-[#4ade80] hover:bg-[#4ade80]/90 text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#4ade80]/20 active:scale-95"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Đặt lịch mới
                    </button>
                </header>

                {/* Upcoming Appointments Section (Red Box 1 in Screenshot) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lịch khám sắp tới</h3>
                        <span className="text-sm text-[#4ade80] font-medium cursor-pointer hover:underline">Xem tất cả</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcomingAppointments.length > 0 ? upcomingAppointments.map((apt, idx) => (
                            <motion.div
                                key={apt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-4">
                                        <div className="size-16 rounded-xl overflow-hidden border border-slate-50 dark:border-slate-800 shadow-sm">
                                            <img
                                                className="h-full w-full object-cover"
                                                src={idx % 2 === 0
                                                    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuD7vXnp6aQPjZ60X4dViKy4wc9f4af2BaYYdWjq6ffrcLIsH6-nIjntF36ybndgEL8mwebC6vRSsI8QRjBXPV3P0IrWdH-E07u6jxXhVxOn1-NI6lORB2T18_nDSbYHuKxpSZnv6itE2edZIDKHLDxUfmox_g5NChHrkMqYINEZbd22S-Z54JU8oI_MSG0rH7iUZ3VueAzO6AwkFqlQ2mgjCn6QD6Zi66JkjKvOdH2kEC8F3DSs2wvfZA2n1GLEXkG-44UoVTQ1yK8"
                                                    : "https://lh3.googleusercontent.com/aida-public/AB6AXuAvda6dwU3lWoctny-heWxDpNckP5ehOjM0MnSJHBC-Ni9fJSLUhDhINVjlLZcWCCyUGjkYHbPJ-eP7ZnyV9Lp-HEu9MB1jAxoJeebCMZfLsFcMNQGzZT19rq9k35Ijsd83tztLM11O4EUxoiL3EMBsqWza3nXCAQ41QN8s_C3JuOmzYwvrKQzHSjhtpXGUmjhYJgzm6LiiXBjWADsjD16ckFbsmmGNMtfhZJ_ZLL5DYPKG4wXtsLx5zj5ZaCg-cwJCncB5li2GG5c"
                                                }
                                                alt="Doctor"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                                                {idx % 2 === 0 ? "BS. Nguyễn Văn An" : "BS. Trần Thị Mai"}
                                            </h4>
                                            <p className="text-sm text-[#4ade80] font-medium mt-1">
                                                {idx % 2 === 0 ? "Chuyên khoa Tim mạch" : "Chuyên khoa Nội tiết"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${apt.appointmentType === 'Online' ? 'bg-blue-100 text-blue-600' : 'bg-[#4ade80]/10 text-[#4ade80]'}`}>
                                        {apt.appointmentType || 'Trực tiếp'}
                                    </div>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm">{format(parseISO(apt.appointmentDate), 'EEEE, dd MMMM, yyyy', { locale: vi })}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm">{apt.startTime} - {apt.endTime}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        {apt.appointmentType === 'Online' ? (
                                            <>
                                                <Video className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm font-medium text-blue-500 underline cursor-pointer">Liên kết Google Meet</span>
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm truncate">{apt.branchName || "Phòng khám Đa khoa Hoàn Mỹ, Quận 1"}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex-1 bg-[#4ade80] hover:bg-[#4ade80]/90 text-slate-900 py-2.5 rounded-lg text-sm font-bold transition-colors">
                                        {apt.appointmentType === 'Online' ? 'Vào phòng chờ' : 'Nhắc tôi'}
                                    </button>
                                    <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Hủy lịch
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-2 py-12 text-center bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 border-dashed shadow-sm">
                                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-bold text-sm">Không có lịch khám sắp tới</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* History Section (Red Box 2 in Screenshot) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lịch sử khám bệnh</h3>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
                                <Filter className="w-5 h-5 text-slate-500" />
                            </button>
                            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
                                <Search className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#fcfdfc] dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Ngày khám</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Bác sĩ</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Chẩn đoán</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {historyAppointments.length > 0 ? historyAppointments.map((apt, idx) => (
                                        <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-white">
                                                {format(parseISO(apt.appointmentDate), 'dd/MM/yyyy')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-white dark:border-slate-600 shadow-sm">
                                                        <img
                                                            className="h-full w-full object-cover"
                                                            src={idx % 2 === 0
                                                                ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCAWRcfVWN7UNQqmFmR_QkId_S16yFYF9D4qL1HCEGGpY5-3KPhxBJEeulAkD4o2y_07OlomR2DODvdhokxKHN3E1plG2S--oSg0AY3yuX7o80xy_4YCf7qFJdn6vXq8whHu05-2d4Zg-Rl2V0DftvfFRyPCkoDMEAXzL1Wz-az_UgvAOmQm0titJ-mFiicY8k1KuO61LfKSQWY00nucGM2bOlz4Fts0NFY9qiNWYinazsxyStpDFQA_XF8kD-kw0PLRpx-MuaWf80"
                                                                : "https://lh3.googleusercontent.com/aida-public/AB6AXuBHm3n8TsfIzVQfdVxqHbQ4m_x4IQ07xSA4Jgj59fYOOYMD0E_wJEWw-OxpmjR6cmtM3cVQZCTN74PHKBPrmzlV8-38OaAqZtgaljrg8xFClIP-MO-6vwu56s9WYqeASCNgb5WrgWS7B56XFPgQhGum8Q1nDKhQSDy8hqMg23tLuihSDIHk2QIMDh4JNQCnhURiqgnkZYfMrc1pyYZ6pBcZIu-h4GC5Ucmz_1zNBVwQm79G31J6ybpsJAvurETNYKiLiLCXnoiIJxQ"
                                                            }
                                                            alt="Doctor"
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                        {idx % 2 === 0 ? "BS. Lê Minh Tâm" : "BS. Trần Thị Mai"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                                                {apt.notes || (idx % 2 === 0 ? "Huyết áp không ổn định, cần theo dõi..." : "Kiểm tra đường huyết định kỳ...")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(apt.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button className="text-[#4ade80] hover:text-[#4ade80]/80 text-sm font-bold transition-all">
                                                    Xem kết quả
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-bold italic">Chưa có lịch sử khám bệnh</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            {/* Right Sidebar Area (Matches design) */}
            <aside className="w-full lg:w-80 space-y-8">
                {/* Mini Calendar Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-900 dark:text-white">Lịch cá nhân</h4>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{format(new Date(), 'MMMM, yyyy', { locale: vi })}</span>
                    </div>
                    <div className="bg-[#fcfdfc] dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <span key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {Array.from({ length: 35 }).map((_, i) => {
                                const day = i - 3; // Mocking start of month
                                const isToday = day === new Date().getDate();
                                const isApt = [20, 25].includes(day);
                                return (
                                    <div
                                        key={i}
                                        className={`py-2 text-xs font-bold rounded-full transition-all ${day <= 0 || day > 31 ? 'text-slate-200' :
                                            isToday ? 'bg-[#4ade80] text-slate-900 shadow-lg shadow-[#4ade80]/20' :
                                                isApt ? 'bg-[#4ade80]/20 text-[#4ade80]' :
                                                    'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 cursor-pointer shadow-sm'
                                            }`}
                                    >
                                        {day > 0 && day <= 31 ? day : ''}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* My Doctors Section */}
                <section>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Bác sĩ của tôi</h4>
                    <div className="space-y-4">
                        {[
                            { name: 'BS. Nguyễn Văn An', spec: 'Tim mạch', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNVrX73MBCojMqbDFUwQyjI6TdA9nhpJg97bUY7Cy5BH0fBKLpo0-lxHx_x4o3Ykku8a4AaBKnTcZGGmn71ZM1e407H0cfPqPoiQaRc6PrjsflrG9vG_-ermlc_z9IDMtBwLpnhEzau6AdP3uNvGQ2CceEV-shTXGY7z5WTfpYRKqYw7zLbKNS6nu_lI5CnDYSZsljSUzlk7eezyLBdKpuhMQR09YHhmv_8ADFNhr8IyQ7I492t-cAHTi521L3GeLVaBjXQAAdoBs' },
                            { name: 'BS. Trần Thị Mai', spec: 'Nội tiết', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOuaAUqu7v46DPyZxwQg5Y-0cRe__Q0CnlGfc2HJfaYT6sb3ZsCURc8yLMFAkOQwvB2K3ZFHxFuiJn5_MOhDlJt-JgImJ1V9h_zSkfpRWGPyENaTzz70uIqmaL6koedomRxRZ67aCI2B4BaUlMxZ-RKbvnnRxHT780Lfm8SbNcWX1Ij1kuSnBJRAy-YpXs8WG1wejPJIiMGdd2A18U_EakTYpLXmqsFsgRR9NnCw5k2TAIgCiA5y2JvQt150APFVQe9CbDS5GYJ_U' },
                            { name: 'BS. Ngô Bảo Châu', spec: 'Nội khoa', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxjKjDlrSiNxOWus-qSZvA8zg000ZqlSSZuCL0mxv0KS_9NbHYfZtIaXUgFCC7DUwXJcG01uHQkRLiHI_yEVRyMhIuRWJL_vyoPEh7N5AKXj39tl-Pm0_8iUk42jf3Pkj4vlPoR-toF0AqQmrkD9J_ccT_GMaQhd1DgQhVzZHGjW2r2B6hOGMRHqQtDYeS0blXcjW2fHo7Whot-dV2V0mgoarziD6utVOfiXlsalZ80NLJyIuvF0wiRSN7zC9m8XWFCSE1nWVYlGs' }
                        ].map((doc, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-md group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full border border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm">
                                        <img className="h-full w-full object-cover" src={doc.img} alt={doc.name} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{doc.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{doc.spec}</p>
                                    </div>
                                </div>
                                <CalendarPlus className="w-5 h-5 text-[#4ade80] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Health Tip Widget Section */}
                <section className="bg-[#4ade80]/10 dark:bg-[#4ade80]/5 p-5 rounded-2xl border border-[#4ade80]/20 relative overflow-hidden group">
                    <div className="relative z-10">
                        <Lightbulb className="w-6 h-6 text-[#4ade80] mb-2" />
                        <h5 className="font-bold text-sm mb-1 text-slate-900 dark:text-slate-100">Lời khuyên hôm nay</h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            Đừng quên ghi lại chỉ số đường huyết trước buổi khám chiều nay để bác sĩ tư vấn chính xác hơn nhé!
                        </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 size-24 bg-[#4ade80]/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                </section>
            </aside>
        </div>
    )
}
