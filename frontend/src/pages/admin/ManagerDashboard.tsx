import {
    Users,
    AlertTriangle,
    TrendingUp,
    MoreVertical,
    ChevronRight,
    Calendar,
    TableProperties,
    ArrowUpRight,
    Download,
    Activity,
    Stethoscope,
    PieChart,
    Bolt,
    Wallet
} from 'lucide-react'
import { motion } from 'framer-motion'

export function ManagerDashboard() {
    const stats = [
        {
            label: 'Tổng bệnh nhân mãn tính',
            value: '1,250',
            trend: '+2.1%',
            trendUp: true,
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        {
            label: 'Trường hợp nguy cơ cao',
            value: '45',
            trend: '-5%',
            trendUp: false,
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-900/20'
        },
        {
            label: 'Bệnh nhân không quay lại',
            value: '12%',
            trend: '-2%',
            trendUp: false,
            icon: Activity,
            color: 'text-orange-600',
            bg: 'bg-orange-50 dark:bg-orange-900/20'
        },
        {
            label: 'Tỷ lệ tăng trưởng BN',
            value: '+5.4%',
            trend: '+0.8%',
            trendUp: true,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20'
        }
    ]

    const doctors = [
        {
            name: 'BS. Nguyễn Văn An',
            specialty: 'Nội tiết',
            patients: 156,
            performance: 9.4,
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrVppbSpiA6Clo-eIDDYknGinsxbgkUJNt2kxi4sNp9gmtTu6LwDDvNB9T6xG773MzsoTCw_GbvbLyw1t5-JTD819ysoUDZnhDtQusAxbFZ7ivzIyfD34OQVqyYYLSW9QPH0kUgb4jfY1PLvV_fak_gVyNuSA-VqkhbU2IqkYdr5zBo8v7zup3p3Fo1CkTvv4_--y_An0xPXEe49gTqFNHMCHBzcr8CL4z-_mKUMAGeW3cMx9UcASjp_vaQxu_XQQikKYi7LIkadU'
        },
        {
            name: 'BS. Trần Thị Bình',
            specialty: 'Tim mạch',
            patients: 142,
            performance: 8.8,
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxejVzOJKNtSEaGW3NIyFhAMe25SbLQgAA1fmLInVpzDF_u1U374zG2nD9XE6I29IubspvyLBaqu2GPrzQ3gt8XIlwlqVo3mW-1OvbTbe_4NXvTy1hQijYUUpD9648NzvVEJ9RLaAlM6qHEwgdBTg_3g6h-7lXL-IG6goRrer5YPnX0fOl3fEiBfl_xkWFk3DJyYSAMbo1tVmHiyjCU_XJbdUy2CLT8U2XMtCTXSKccoriFkzkJzRUCrDMi4BzMTk8He9g6Z0HGjU'
        },
        {
            name: 'BS. Lê Hoàng Long',
            specialty: 'Thận học',
            patients: 98,
            performance: 7.2,
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlIba9-wL-4--Ap2pQhDpBc-BaY4SBsSvBWanuXMsuzdtFoa4LK69rgS3-staxdgamcrK2KjhG9MtA7f9cwmC2sIzZ8YTRZ_e0aO2kt2cBlYukcLa9ygtm0UCenjs8M-KK-Ft4F3itE-VQTOMcHMR5Cy5BqLvR_kd-KDZRo9hec5AZDva_vaY2oOtLtoPwE8n5pGs5LtxhR3_N-LikxR-v0n8aQXUc2TyOpgVI4XY86d3Y9G0az-QVrw17fraD4JMja4lwEwMw0v4'
        },
        {
            name: 'BS. Phạm Minh Anh',
            specialty: 'Đa khoa',
            patients: 210,
            performance: 9.1,
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFNuHdzPbX0PiB5lFraIkxJaM2114aeP3IkWHU_n-iDCRGKsCeRbjZWx4fxbqsent4DMXXeEZOMN0aN9rwj83HgY2IVegYbVV7Li11IS3_HTmxt9UB9LtNoH1ZarB3ApBtVHYK5Yz3usl2-CFBpXOld3MjtiXKB66zYnqcvCX2KjiL5x3dJz7zlsTm8sUgHYLx5_TQWzMZ6MwMdQy7Yffsl0pR0WbzlJ-v1z4z19ghIjY-mOSJGDoOh3WOH0eJ79dYv-o1CoS0j3I'
        }
    ]

    const diseases = [
        { name: 'Tiểu đường', percent: 45, color: 'bg-emerald-600' },
        { name: 'Huyết áp cao', percent: 35, color: 'bg-orange-500' },
        { name: 'Bệnh tim mạch', percent: 20, color: 'bg-red-500' }
    ]

    const reportItems = [
        { title: 'Báo cáo hàng tháng', desc: 'Dữ liệu tổng hợp T10/2023', icon: Calendar, color: 'emerald' },
        { title: 'Báo cáo hiệu suất', desc: 'Đánh giá đội ngũ y bác sĩ', icon: Bolt, color: 'emerald' },
        { title: 'Báo cáo tài chính', desc: 'Doanh thu và chi phí quản lý', icon: Wallet, color: 'purple' }
    ]

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-sans pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tightest uppercase">
                        Dashboard Quản lý phòng khám
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 text-sm">
                        Tổng quan dữ liệu quản lý bệnh nhân mãn tính và hiệu suất lâm sàng.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        Thống kê tháng 10
                    </button>
                    <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Overview Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] ${stat.bg.split(' ')[0]}`} />
                        <div className="flex items-center justify-between mb-6">
                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 ${stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tightest">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase text-xs tracking-widest">
                            <PieChart className="w-4 h-4 text-emerald-600" />
                            Phân loại theo bệnh lý
                        </h3>
                        <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative py-4">
                        {/* Simulated Donut Chart */}
                        <div className="relative size-56 group">
                            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-50 dark:text-slate-800" />

                                {/* Diabetes - 45% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12"
                                    strokeDasharray="251.3" strokeDashoffset={251.3 * (1 - 0.45)}
                                    className="transition-all duration-1000 ease-out" />

                                {/* Blood Pressure - 35% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f97316" strokeWidth="12"
                                    strokeDasharray="251.3" strokeDashoffset={251.3 * (1 - 0.35)}
                                    className="transition-all duration-1000 ease-out" transform="rotate(162 50 50)" />

                                {/* Heart Disease - 20% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12"
                                    strokeDasharray="251.3" strokeDashoffset={251.3 * (1 - 0.20)}
                                    className="transition-all duration-1000 ease-out" transform="rotate(288 50 50)" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tightest">1,250</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bệnh nhân</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 space-y-4">
                        {diseases.map((d, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className={`size-3 rounded-full ${d.color} shadow-sm group-hover:scale-125 transition-transform`} />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{d.name}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{d.percent}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Table Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase text-xs tracking-widest">
                            <Stethoscope className="w-5 h-5 text-emerald-500" />
                            Hiệu suất Bác sĩ
                        </h3>
                        <a href="#" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline px-4 py-2 bg-emerald-50 rounded-xl transition-all">Xem tất cả</a>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="px-8 py-6">Bác sĩ</th>
                                    <th className="px-8 py-6">Chuyên khoa</th>
                                    <th className="px-8 py-6 text-center">Bệnh nhân</th>
                                    <th className="px-8 py-6">Hiệu suất</th>
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
                                                <span className="font-black text-slate-800 dark:text-white text-sm tracking-tight">{doc.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{doc.specialty}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center font-black text-slate-700 dark:text-slate-200">{doc.patients}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden min-w-[100px]">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${doc.performance * 10}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className={`h-full rounded-full ${doc.performance >= 9 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-orange-500'}`}
                                                    />
                                                </div>
                                                <span className={`text-xs font-black ${doc.performance >= 9 ? 'text-emerald-600' : 'text-orange-600'}`}>
                                                    {doc.performance}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Reports Quick Access */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">Phân mục Báo cáo</h3>
                        <p className="text-sm text-slate-400 font-bold mt-1">Truy cập nhanh các báo cáo quản trị và hiệu quả công việc.</p>
                    </div>
                    <button className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                        <TableProperties className="w-5 h-5 text-emerald-400" />
                        Xuất file Excel tổng hợp
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reportItems.map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="flex items-center gap-6 p-6 border border-slate-100 dark:border-slate-800 rounded-[2rem] hover:border-emerald-500/30 hover:shadow-xl transition-all cursor-pointer group"
                        >
                            <div className={`p-5 rounded-[1.5rem] transition-all group-hover:scale-110 shadow-sm ${item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                                item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                                    'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                                }`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-800 dark:text-white text-sm tracking-tight mb-0.5">{item.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1">{item.desc}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                        <Activity className="w-4 h-4" />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white tracking-widest uppercase text-[10px]">ClinicManager System</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2023. Hệ thống quản lý bệnh mãn tính thông minh.</p>
            </footer>
        </div>
    )
}
