import { useQuery } from '@tanstack/react-query'
import { getPortalDashboard } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import {
    Activity,
    Plus,
    TrendingDown,
    TrendingUp,
    Heart,
    Wind,
    Scale,
    Droplets,
    Zap,
    Info,
    ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function PatientVitals() {
    const { headers } = useTenant()
    const [selectedMetric, setSelectedMetric] = useState('Đường huyết (mmol/L)')

    const { isLoading } = useQuery({
        queryKey: ['portal-dashboard'],
        queryFn: () => getPortalDashboard(headers),
        enabled: !!headers?.tenantId
    })

    if (isLoading) return <div className="p-8 text-center font-bold text-slate-400">Đang tải...</div>

    // Mock data for the chart if not available from API
    const chartData = [
        { day: 'Thứ 2', value: 5.8 },
        { day: 'Thứ 3', value: 5.6 },
        { day: 'Thứ 4', value: 6.0 },
        { day: 'Thứ 5', value: 5.4 },
        { day: 'Thứ 6', value: 5.7 },
        { day: 'Thứ 7', value: 5.5 },
        { day: 'Chủ nhật', value: 5.6 },
    ]

    const handleAddVital = () => {
        toast.success('Chức năng đang được phát triển')
    }

    return (
        <div className="w-full space-y-8 p-6 md:p-8">
            {/* Title and CTA */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chỉ số sức khỏe</h2>
                    <p className="text-slate-500 mt-1 font-medium">Theo dõi các chỉ số sinh tồn của bạn trong thời gian thực</p>
                </div>
                <button
                    onClick={handleAddVital}
                    className="bg-emerald-400 hover:bg-emerald-500 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-400/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nhập chỉ số mới
                </button>
            </div>

            {/* Time Filter */}
            <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 w-fit shadow-sm">
                {['Ngày', 'Tuần', 'Tháng', 'Năm'].map((filter) => (
                    <button
                        key={filter}
                        className={`px-6 py-2 text-sm font-bold transition-all rounded-xl ${filter === 'Tuần'
                            ? 'bg-emerald-400 text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Blood Glucose */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-emerald-400 shadow-xl shadow-emerald-400/5 transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-2xl">
                            <Droplets className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 text-emerald-600 rounded-full tracking-widest">ỔN ĐỊNH</span>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Đường huyết</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">5.6</span>
                        <span className="text-xs font-bold text-slate-400 uppercase">mmol/L</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-emerald-500 text-xs font-bold">
                        <TrendingDown className="w-4 h-4" />
                        -2% so với hôm qua
                    </div>
                </div>

                {/* Blood Pressure */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02] hover:border-orange-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-orange-50 text-orange-500 rounded-2xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-orange-100 text-orange-600 rounded-full tracking-widest">CẦN CHÚ Ý</span>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Huyết áp</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">120/80</span>
                        <span className="text-xs font-bold text-slate-400 uppercase">mmHg</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-orange-600 text-xs font-bold">
                        <TrendingUp className="w-4 h-4" />
                        +5% so với hôm qua
                    </div>
                </div>

                {/* Heart Rate */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02] hover:border-emerald-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-red-50 text-red-500 rounded-2xl">
                            <Heart className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 text-emerald-600 rounded-full tracking-widest">ỔN ĐỊNH</span>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Nhịp tim</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">72</span>
                        <span className="text-xs font-bold text-slate-400 uppercase">bpm</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-slate-400 text-xs font-bold">
                        <div className="w-4 h-0.5 bg-slate-300 rounded-full"></div>
                        0% không đổi
                    </div>
                </div>

                {/* Weight */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02] hover:border-blue-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-blue-50 text-blue-500 rounded-2xl">
                            <Scale className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 text-emerald-600 rounded-full tracking-widest">ỔN ĐỊNH</span>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Cân nặng</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">68.5</span>
                        <span className="text-xs font-bold text-slate-400 uppercase">kg</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-emerald-500 text-xs font-bold">
                        <TrendingDown className="w-4 h-4" />
                        -1% tuần này
                    </div>
                </div>

                {/* SpO2 */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02] hover:border-cyan-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-cyan-50 text-cyan-500 rounded-2xl">
                            <Wind className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 text-emerald-600 rounded-full tracking-widest">BÌNH THƯỜNG</span>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Oxy SpO2</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">98</span>
                        <span className="text-xs font-bold text-slate-400 uppercase">%</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-slate-400 text-xs font-bold">
                        <div className="w-4 h-0.5 bg-slate-300 rounded-full"></div>
                        0% không đổi
                    </div>
                </div>
            </div>

            {/* Chart and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-7 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Biểu đồ Đường huyết chi tiết</h3>
                            <p className="text-xs text-slate-500 font-bold mt-1">Dữ liệu thu thập trong 7 ngày qua</p>
                        </div>
                        <div className="relative">
                            <select
                                value={selectedMetric}
                                onChange={(e) => setSelectedMetric(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-600 focus:ring-emerald-400/20 focus:border-emerald-400 outline-none transition-all cursor-pointer"
                            >
                                <option>Đường huyết (mmol/L)</option>
                                <option>Huyết áp (mmHg)</option>
                                <option>Nhịp tim (bpm)</option>
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                        </div>
                    </div>

                    <div className="h-64 mt-4 relative">
                        {/* Custom Mini Chart Implementation */}
                        <div className="absolute inset-0 flex items-end justify-between px-2">
                            {chartData.map((d, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group/bar flex-1">
                                    <div className="relative w-full flex flex-col items-center justify-end h-48">
                                        <div
                                            className="w-10 bg-emerald-400/20 rounded-t-xl transition-all group-hover/bar:bg-emerald-400/40 relative"
                                            style={{ height: `${(d.value / 7) * 100}%` }}
                                        >
                                            <div
                                                className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 rounded-full shadow-[0_0_10px_#4ade80]"
                                            />
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                {d.value}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.day}</span>
                                </div>
                            ))}
                        </div>
                        {/* Background Lines */}
                        <div className="absolute inset-x-0 bottom-[calc(25%)] border-t border-slate-100 dark:border-slate-700/50"></div>
                        <div className="absolute inset-x-0 bottom-[calc(50%)] border-t border-slate-100 dark:border-slate-700/50"></div>
                        <div className="absolute inset-x-0 bottom-[calc(75%)] border-t border-slate-100 dark:border-slate-700/50"></div>
                    </div>
                </div>

                {/* AI / Doctor Analysis Section */}
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-7 rounded-[2rem] border border-emerald-500/10 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl">
                            <Zap className="w-5 h-5 fill-emerald-600" />
                        </div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Phân tích chuyên sâu</h3>
                    </div>

                    <div className="space-y-5 flex-1">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-emerald-400/10 scale-150">
                                <Activity className="w-16 h-16" />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed relative z-10">
                                "Chỉ số đường huyết của bạn đang có xu hướng giảm nhẹ và ổn định hơn so với tuần trước.
                                Tuy nhiên, huyết áp ghi nhận vào buổi sáng đôi khi hơi cao. Hãy duy trì việc tập thể dục
                                nhẹ nhàng và giảm muối trong khẩu phần ăn."
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center gap-3">
                                <div className="size-10 bg-emerald-400 rounded-2xl flex items-center justify-center text-xs font-black text-slate-900 border-2 border-white shadow-md">BS</div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">BS. Trần Thị Thu</p>
                                    <p className="text-[10px] font-bold text-slate-400">Bác sĩ chuyên khoa CDM</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-400 rounded-3xl p-6 shadow-lg shadow-emerald-400/20 group relative overflow-hidden">
                            <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Plus className="w-24 h-24 rotate-45" />
                            </div>
                            <h4 className="text-xs font-black text-slate-900 flex items-center gap-2 mb-2 uppercase tracking-[0.2em]">
                                <Info className="w-4 h-4" /> Lời khuyên vàng
                            </h4>
                            <p className="text-sm text-slate-900 font-bold leading-relaxed">
                                Uống đủ 2L nước mỗi ngày và hạn chế caffeine sau 14:00 để ổn định nhịp tim và giấc ngủ của bạn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-7 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">Lịch sử nhập liệu gần đây</h3>
                        <p className="text-xs text-slate-500 font-bold mt-1">Dữ liệu từ thiết bị IoT và nhập thủ công</p>
                    </div>
                    <button className="text-emerald-500 text-xs font-black uppercase tracking-widest hover:underline px-4 py-2 hover:bg-emerald-50 rounded-xl transition-all">Xem tất cả</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thời gian</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chỉ số</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giá trị</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {[
                                { time: 'Hôm nay, 08:30', type: 'Đường huyết', val: '5.6 mmol/L', status: 'BÌNH THƯỜNG', note: 'Đo sau khi ăn sáng 1 tiếng.', icon: Droplets, color: 'text-emerald-500' },
                                { time: 'Hôm qua, 20:15', type: 'Huyết áp', val: '125/85 mmHg', status: 'HƠI CAO', note: 'Cảm thấy hơi chóng mặt nhẹ.', icon: Activity, color: 'text-orange-500' },
                                { time: 'Hôm qua, 07:00', type: 'Cân nặng', val: '68.5 kg', status: 'ỔN ĐỊNH', note: 'Đo lúc vừa ngủ dậy.', icon: Scale, color: 'text-blue-500' },
                                { time: '15 Thg 10, 10:00', type: 'Nhịp tim', val: '75 bpm', status: 'BÌNH THƯỜNG', note: 'Đo sau khi đi bộ 15 phút.', icon: Heart, color: 'text-red-500' },
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{row.time}</div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 ${row.color} bg-current/10 rounded-lg`}>
                                                <row.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{row.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="text-base font-black text-slate-900 dark:text-white tracking-tight">{row.val}</div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full tracking-widest ${row.status === 'HƠI CAO' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm text-slate-500 font-medium truncate max-w-[250px]">{row.note}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
