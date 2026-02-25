import {
    AlertTriangle,
    BellRing,
    ShieldCheck,
    AlertCircle,
    Send,
    PhoneCall,
    ClipboardList,
    BarChart3,
    Sparkles,
    Brain,
    Pill,
    TrendingUp,
    TrendingDown,
    LifeBuoy,
    Video,
    FileText,
    Filter,
    CheckCircle,
    Activity
} from 'lucide-react'
import { motion } from 'framer-motion'

export function RiskAnalysis() {
    return (
        <div className="flex-1 space-y-8 animate-in fade-in duration-700">
            {/* Page Title & Filters */}
            <div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                            Phân tích nguy cơ & Cảnh báo sớm
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Dữ liệu phân tích thời gian thực dựa trên các chỉ số sinh tồn và bệnh sử.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select className="rounded-[13px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-blue-600/20 focus:border-blue-600 shadow-sm">
                            <option>Tất cả khoa</option>
                            <option>Khoa Tim mạch</option>
                            <option>Khoa Nội tiết</option>
                        </select>
                        <select className="rounded-[13px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-blue-600/20 focus:border-blue-600 shadow-sm">
                            <option>Tất cả loại bệnh</option>
                            <option>Tiểu đường Type 2</option>
                            <option>Cao huyết áp</option>
                            <option>Suy thận mạn</option>
                        </select>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-[13px] text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm">
                            <Filter className="w-4 h-4" /> Lọc dữ liệu
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-[13px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-16 h-16 text-red-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Nguy cơ cao</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">42</span>
                        <span className="text-red-500 text-sm font-bold flex items-center gap-0.5">
                            <TrendingUp className="w-4 h-4" /> +12%
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Bệnh nhân cần can thiệp ngay</p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-[13px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <BellRing className="w-16 h-16 text-amber-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Cảnh báo 24h</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">+8</span>
                        <span className="text-amber-500 text-sm font-bold flex items-center gap-0.5">
                            <Activity className="w-4 h-4" /> Mới
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Số ca phát sinh cảnh báo mới</p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-[13px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-16 h-16 text-emerald-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Tỷ lệ ổn định</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">85%</span>
                        <span className="text-emerald-500 text-sm font-bold flex items-center gap-0.5">
                            <CheckCircle className="w-4 h-4" /> Tốt
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Bệnh nhân trong ngưỡng an toàn</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Priority List */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <section className="bg-white dark:bg-slate-900 rounded-[13px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500" /> Danh sách ưu tiên can thiệp
                            </h3>
                            <span className="text-[10px] font-black px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md uppercase tracking-wider">
                                Khẩn cấp
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50/30 dark:bg-slate-800/20">
                                        <th className="px-6 py-4">Bệnh nhân</th>
                                        <th className="px-6 py-4">Chỉ số bất thường</th>
                                        <th className="px-6 py-4 text-center">Xu hướng</th>
                                        <th className="px-6 py-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {/* Row 1 */}
                                    <tr className="hover:bg-red-50/30 dark:hover:bg-red-900/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-[10px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-600 dark:text-slate-400">
                                                    NL
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 dark:text-white">Nguyễn Văn Lộc</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">BN-2024-0891</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-red-600 dark:text-red-400 font-bold text-sm">HA: 178/112 mmHg</span>
                                                <span className="text-[10px] text-slate-500 font-medium italic">Tiền sử: Tăng HA giai đoạn 2</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center text-red-500 font-black gap-1">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-sm">+15%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {[
                                                    { icon: Send, color: 'text-blue-600', bg: 'hover:bg-blue-50', title: 'Gửi cảnh báo' },
                                                    { icon: PhoneCall, color: 'text-red-500', bg: 'hover:bg-red-50', title: 'Gọi khẩn cấp' },
                                                    { icon: ClipboardList, color: 'text-slate-600', bg: 'hover:bg-slate-100', title: 'Sửa toa thuốc' }
                                                ].map((action, idx) => (
                                                    <button
                                                        key={idx}
                                                        title={action.title}
                                                        className={`p-2 rounded-[10px] ${action.color} ${action.bg} dark:hover:bg-slate-800 transition-all`}
                                                    >
                                                        <action.icon className="w-4 h-4" />
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Row 2 */}
                                    <tr className="hover:bg-red-50/30 dark:hover:bg-red-900/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-[10px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-600 dark:text-slate-400">
                                                    TT
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 dark:text-white">Trần Minh Tâm</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">BN-2024-1022</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-red-600 dark:text-red-400 font-bold text-sm">Glucose: 215 mg/dL</span>
                                                <span className="text-[10px] text-slate-500 font-medium italic">Sau ăn 2h</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center text-red-500 font-black gap-1">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-sm">+22%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 rounded-[10px] text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all">
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-[10px] text-red-500 hover:bg-red-500/10 dark:hover:bg-slate-800 transition-all">
                                                    <PhoneCall className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                                    <ClipboardList className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Row 3 - Amber Alert */}
                                    <tr className="hover:bg-amber-50/30 dark:hover:bg-amber-900/5 transition-colors group border-l-4 border-amber-400">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-[10px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-600 dark:text-slate-400">
                                                    LH
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 dark:text-white">Lê Hoàng Nam</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">BN-2024-0556</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">SpO2: 92%</span>
                                                <span className="text-[10px] text-slate-500 font-medium italic">Giảm nhẹ lúc ngủ</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center text-amber-500 font-black gap-1">
                                                <TrendingDown className="w-4 h-4" />
                                                <span className="text-sm">-4%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 rounded-[10px] text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all">
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-[10px] text-red-500 hover:bg-red-500/10 dark:hover:bg-slate-800 transition-all">
                                                    <PhoneCall className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                                    <ClipboardList className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
                            <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:text-blue-700 transition-all">
                                Xem tất cả bệnh nhân rủi ro
                            </button>
                        </div>
                    </section>

                    {/* Risk Trend Chart */}
                    <section className="bg-white dark:bg-slate-900 rounded-[13px] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" /> Xu hướng rủi ro (7 ngày qua)
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Nguy cấp</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm"></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Theo dõi</span>
                                </div>
                            </div>
                        </div>

                        {/* Mockup Chart */}
                        <div className="h-64 w-full relative group">
                            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-between px-2 gap-4">
                                {[40, 55, 45, 70, 60, 50, 80].map((h, i) => (
                                    <div key={i} className="flex-1 bg-blue-600/10 dark:bg-blue-600/5 rounded-t-[10px] relative transition-all duration-700 ease-out" style={{ height: `${h}%` }}>
                                        <div className="absolute top-0 inset-x-0 bg-red-500/30 dark:bg-red-500/20 rounded-t-[10px]" style={{ height: `${h * 0.4}%` }}></div>
                                        {i === 6 && <div className="absolute inset-x-0 bottom-0 bg-blue-600 rounded-t-[10px] shadow-lg shadow-blue-600/20" style={{ height: '100%' }}>
                                            <div className="absolute top-0 inset-x-0 bg-red-500 rounded-t-[10px]" style={{ height: '50%' }}></div>
                                        </div>}
                                    </div>
                                ))}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-100 dark:bg-slate-800"></div>
                        </div>
                        <div className="flex justify-between mt-4 px-2">
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
                                <span key={i} className={`text-[10px] font-black uppercase tracking-widest ${i === 6 ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {day} {i === 6 && '(Hôm nay)'}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar: AI Insights & Quick Actions */}
                <div className="flex flex-col gap-8">
                    {/* AI Insights */}
                    <section className="bg-blue-50/50 dark:bg-blue-900/10 rounded-[13px] border border-blue-100 dark:border-blue-900/30 p-8 flex flex-col gap-6 relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-200/20 dark:bg-blue-900/20 rounded-full blur-3xl transition-all group-hover:scale-110"></div>

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="p-2 bg-blue-600 rounded-[10px] shadow-lg shadow-blue-600/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-blue-600 tracking-tight">AI Insights</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {[
                                { icon: Brain, color: 'text-amber-500', title: 'Xu hướng Tăng HA', desc: 'Bệnh nhân Lộc có chỉ số HA tăng 3 ngày liên tiếp vào buổi sáng.' },
                                { icon: Pill, color: 'text-red-500', title: 'Vi phạm phác đồ', desc: 'Bệnh nhân Tâm quên uống thuốc 2 liều Insulin gần nhất.' },
                                { icon: TrendingDown, color: 'text-emerald-500', title: 'Cải thiện tích cực', desc: 'Cần xem xét giảm liều Statins cho bệnh nhân Nguyễn Thị Hoa.' }
                            ].map((insight, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-[13px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex gap-4">
                                        <insight.icon className={`w-5 h-5 shrink-0 mt-0.5 ${insight.color}`} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{insight.title}</p>
                                            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{insight.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-2 py-3 bg-blue-600 text-white rounded-[13px] text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 relative z-10 active:scale-[0.98]">
                            Gửi tất cả thông báo AI
                        </button>
                    </section>

                    {/* Quick Actions */}
                    <section className="bg-white dark:bg-slate-900 rounded-[13px] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Phím tắt khẩn cấp</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center justify-center gap-3 p-5 rounded-[13px] bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-100 dark:border-red-900/30 hover:bg-red-100/50 transition-all group scale-100 active:scale-95">
                                <LifeBuoy className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Cấp cứu</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-3 p-5 rounded-[13px] bg-blue-50 dark:bg-blue-900/10 text-blue-600 border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100/50 transition-all group scale-100 active:scale-95">
                                <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Tele-Health</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-3 p-5 rounded-[13px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all col-span-2 group scale-100 active:scale-95">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Xuất báo cáo rủi ro (.pdf)</span>
                                </div>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
