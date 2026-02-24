import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getVitalsHistory, getMedicalTimeline } from '@/api/ehr'
import { useTenant } from '@/context/TenantContext'
import {
    Activity, Clock, ChevronLeft,
    ArrowUpRight, Heart, Thermometer,
    Wind, Droplets, User,
    FileText, Pill, CreditCard, Search,
    Filter, Download, MoreHorizontal
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function PatientEhr() {
    const { patientId } = useParams()
    const { headers } = useTenant()
    const [activeTab, setActiveTab] = useState<'TIMELINE' | 'VITALS'>('TIMELINE')

    const { data: vitals, isLoading: isLoadingVitals } = useQuery<any[]>({
        queryKey: ['ehr-vitals', patientId],
        queryFn: () => getVitalsHistory(patientId!, headers),
        enabled: !!patientId && !!headers?.tenantId
    })

    const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
        queryKey: ['ehr-timeline', patientId],
        queryFn: () => getMedicalTimeline(patientId!, headers),
        enabled: !!patientId && !!headers?.tenantId
    })

    if (!patientId) return <div>Không tìm thấy bệnh nhân</div>

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-100">
                <div className="space-y-4">
                    <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                        <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200">
                            <User className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hồ sơ Bệnh nhân</h1>
                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> Đang hoạt động
                                </span>
                            </div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-4">
                                <span>Mã BN: #{patientId.slice(0, 8).toUpperCase()}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span>Phân loại: Cấp cứu mức 3</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] gap-1 shadow-inner">
                    <button
                        onClick={() => setActiveTab('TIMELINE')}
                        className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'TIMELINE' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Dòng thời gian
                    </button>
                    <button
                        onClick={() => setActiveTab('VITALS')}
                        className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === 'VITALS' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Chỉ số sinh tồn
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Side: Summary Cards */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ghi chú lâm sàng gần nhất</h3>
                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-sm font-bold text-slate-900 leading-relaxed italic">
                                    "Bệnh nhân có tiền sử cao huyết áp, nhập viện trong tình trạng đau ngực nhẹ. AI Triage đề xuất mức độ 3."
                                </p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">BS</div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BS. Nguyễn Văn A — 2h trước</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <VitalSummaryCard
                            icon={Heart}
                            label="Nhịp tim"
                            value="82"
                            unit="bpm"
                            color="text-rose-600 bg-rose-50"
                            trend="+2"
                        />
                        <VitalSummaryCard
                            icon={Thermometer}
                            label="Nhiệt độ"
                            value="37.2"
                            unit="°C"
                            color="text-amber-600 bg-amber-50"
                            trend="0.1"
                        />
                        <VitalSummaryCard
                            icon={Wind}
                            label="Nhịp thở"
                            value="18"
                            unit="bpm"
                            color="text-blue-600 bg-blue-50"
                            trend="-1"
                        />
                        <VitalSummaryCard
                            icon={Droplets}
                            label="Huyết áp"
                            value="120/80"
                            unit="mmHg"
                            color="text-purple-600 bg-purple-50"
                            trend="Ổn định"
                        />
                    </div>
                </div>

                {/* Right Side: Timeline or Detailed Vitals */}
                <div className="lg:col-span-2">
                    {activeTab === 'TIMELINE' ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="relative w-full max-w-xs group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-all" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm sự kiện..."
                                        className="w-full bg-white border border-slate-100 pl-12 pr-6 py-3 rounded-full text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 shadow-sm"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm active:scale-95 transition-all">
                                        <Filter className="w-4 h-4" />
                                    </button>
                                    <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm active:scale-95 transition-all">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative pl-8 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                {isLoadingTimeline ? (
                                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-[2.5rem] animate-pulse" />)
                                ) : timeline?.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="relative bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group"
                                    >
                                        <div className="absolute -left-[3.25rem] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center z-10 group-hover:border-blue-500 transition-all">
                                            <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-500" />
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${item.type === 'TRIAGE' ? 'bg-blue-50 text-blue-600 shadow-blue-100/50' :
                                                    item.type === 'CONSULTATION' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100/50' :
                                                        item.type === 'INVOICE' ? 'bg-rose-50 text-rose-600 shadow-rose-100/50' :
                                                            'bg-amber-50 text-amber-600 shadow-amber-100/50'
                                                    }`}>
                                                    {item.type === 'TRIAGE' ? <Activity className="w-6 h-6" /> :
                                                        item.type === 'CONSULTATION' ? <FileText className="w-6 h-6" /> :
                                                            item.type === 'INVOICE' ? <CreditCard className="w-6 h-6" /> :
                                                                <Pill className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.timestamp).toLocaleString('vi-VN')}</span>
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${item.status === 'COMPLETED' || item.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                                            }`}>{item.status}</span>
                                                    </div>
                                                    <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">{item.title}</h4>
                                                    <p className="text-xs font-bold text-slate-400 italic">{item.subtitle}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-600 max-w-xs">{item.content}</p>
                                                <button className="mt-4 text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 ml-auto group-hover:gap-2 transition-all">
                                                    Chi tiết <ArrowUpRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
                            {/* SVG Chart Placeholder - A beautiful minimalist trend chart */}
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Biểu đồ Nhịp tim & Huyết áp</h3>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-rose-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhịp tim</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-blue-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Huyết áp</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-80 w-full relative group">
                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300">
                                        {/* Grid lines */}
                                        <line x1="0" y1="0" x2="1000" y2="0" stroke="#f1f5f9" strokeWidth="1" />
                                        <line x1="0" y1="100" x2="1000" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                                        <line x1="0" y1="200" x2="1000" y2="200" stroke="#f1f5f9" strokeWidth="1" />
                                        <line x1="0" y1="300" x2="1000" y2="300" stroke="#f1f5f9" strokeWidth="1" />

                                        {/* Smooth heart rate line */}
                                        <path
                                            d="M0,150 C100,140 200,180 300,170 C400,160 500,200 600,140 C700,110 800,150 900,130 L1000,140"
                                            fill="none"
                                            stroke="#f43f5e"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            className="drop-shadow-xl"
                                        />
                                        <path
                                            d="M0,150 C100,140 200,180 300,170 C400,160 500,200 600,140 C700,110 800,150 900,130 L1000,140 V300 H0 Z"
                                            fill="url(#gradient-rose)"
                                            className="opacity-10"
                                        />

                                        {/* Blood pressure line */}
                                        <path
                                            d="M0,220 C150,230 350,210 550,240 C750,260 950,230 1000,250"
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            className="drop-shadow-xl"
                                        />

                                        <defs>
                                            <linearGradient id="gradient-rose" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f43f5e" />
                                                <stop offset="100%" stopColor="transparent" />
                                            </linearGradient>
                                        </defs>

                                        {/* Data points */}
                                        {[300, 600, 900].map(x => (
                                            <circle key={x} cx={x} cy="170" r="6" fill="#f43f5e" className="group-hover:scale-150 transition-all cursor-pointer" />
                                        ))}
                                    </svg>
                                </div>
                            </div>

                            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian ghi nhận</th>
                                            <th className="px-10 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhịp tim</th>
                                            <th className="px-10 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhiệt độ</th>
                                            <th className="px-10 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">SpO2</th>
                                            <th className="px-10 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {isLoadingVitals ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={i} className="animate-pulse"><td colSpan={5} className="px-10 py-10 h-20 bg-slate-50/30" /></tr>
                                            ))
                                        ) : vitals?.slice(0, 10).map((v, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-all">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="w-4 h-4 text-slate-300" />
                                                        <span className="text-sm font-bold text-slate-900">{new Date(v.recordedAt).toLocaleString('vi-VN')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-center font-black text-rose-500">{v.vitalType === 'HEART_RATE' ? v.valueNumeric : '—'}</td>
                                                <td className="px-10 py-6 text-center font-black text-amber-500">{v.vitalType === 'TEMPERATURE' ? v.valueNumeric : '—'}</td>
                                                <td className="px-10 py-6 text-center font-black text-blue-500">{v.vitalType === 'SPO2' ? v.valueNumeric : '—'}</td>
                                                <td className="px-10 py-6 text-right">
                                                    <button className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                                        <MoreHorizontal className="w-5 h-5 text-slate-300" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function VitalSummaryCard({ icon: Icon, label, value, unit, color, trend }: {
    icon: any, label: string, value: string, unit: string, color: string, trend: string
}) {
    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${trend.includes('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">{value}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
                </div>
            </div>
        </div>
    )
}
