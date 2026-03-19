import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Lightbulb, RefreshCw, HeartPulse, Zap, Loader2, Activity } from 'lucide-react'
import { getManagerSummary } from '@/api/management'
import { useTenant } from '@/context/TenantContext'

interface DiseaseEntry {
    name: string
    count: number
    type: 'Chronic' | 'Acute'
}

const CHRONIC_KEYWORDS = ['tiểu đường', 'huyết áp', 'tim mạch', 'hen suyễn', 'copd', 'thận', 'khớp', 'thoái hóa', 'gout', 'mỡ máu', 'gan nhiễm mỡ', 'parkinson', 'alzheimer', 'ung thư', 'lupus', 'viêm gan b', 'viêm gan c', 'epilepsy', 'hiv']

function classifyDisease(name: string): 'Chronic' | 'Acute' {
    const lower = name.toLowerCase()
    return CHRONIC_KEYWORDS.some(k => lower.includes(k)) ? 'Chronic' : 'Acute'
}

export function DiseaseManagement() {
    const queryClient = useQueryClient()
    const { headers } = useTenant()
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'All' | 'Chronic' | 'Acute'>('All')

    const { data: summary, isLoading } = useQuery({
        queryKey: ['manager-summary-diseases'],
        queryFn: () => getManagerSummary(headers),
        enabled: !!headers?.tenantId
    })

    const diseases: DiseaseEntry[] = useMemo(() => {
        if (!summary?.diseaseDistribution) return []
        return Object.entries(summary.diseaseDistribution)
            .filter(([name]) => name && name.trim() !== '')
            .map(([name, count]) => ({
                name,
                count: count as number,
                type: classifyDisease(name)
            }))
            .sort((a, b) => b.count - a.count)
    }, [summary])

    const filteredDiseases = useMemo(() => {
        return diseases.filter(d => {
            const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesType = filterType === 'All' || d.type === filterType
            return matchesSearch && matchesType
        })
    }, [diseases, searchQuery, filterType])

    const chronicCount = diseases.filter(d => d.type === 'Chronic').length
    const acuteCount = diseases.filter(d => d.type === 'Acute').length
    const totalPatientCount = diseases.reduce((sum, d) => sum + d.count, 0)
    const chronicPatientCount = diseases.filter(d => d.type === 'Chronic').reduce((sum, d) => sum + d.count, 0)
    const chronicPercent = totalPatientCount > 0 ? Math.round((chronicPatientCount / totalPatientCount) * 100) : 0
    const acutePercent = totalPatientCount > 0 ? 100 - chronicPercent : 0

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Quản lý Bệnh lý</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Phân tích và giám sát danh mục bệnh mãn tính</p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['manager-summary-diseases'] })}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm active:rotate-180 duration-500"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Đang tải dữ liệu bệnh tật...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full animate-in fade-in duration-700 font-sans space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="text-left">
                    <h2 className="text-2xl font-bold text-neutral-900">Quản lý Danh mục Bệnh</h2>
                    <p className="text-neutral-500">Thống kê phân bổ bệnh tật trong hệ thống Sống Khỏe CDM dựa trên dữ liệu thực.</p>
                </div>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['manager-summary-diseases'] })}
                    className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm active:rotate-180 duration-500"
                    title="Làm mới dữ liệu"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group"
                >
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loại bệnh ghi nhận</p>
                            <h3 className="text-4xl font-black text-slate-800 mt-2">{diseases.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-primary-600 font-bold">
                        <span>{totalPatientCount} bệnh nhân đang theo dõi</span>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-50 rounded-full opacity-50 blur-2xl"></div>
                </motion.div>

                {/* Chronic Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group"
                >
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bệnh Mãn tính (Chronic)</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black text-slate-800 mt-2">{chronicCount}</h3>
                                <span className="text-blue-600 font-black text-lg">{chronicPercent}%</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${chronicPercent}%` }}
                            transition={{ duration: 0.8 }}
                            className="bg-blue-600 h-full rounded-full"
                        />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 blur-2xl"></div>
                </motion.div>

                {/* Acute Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group"
                >
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bệnh Cấp tính (Acute)</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black text-slate-800 mt-2">{acuteCount}</h3>
                                <span className="text-orange-600 font-black text-lg">{acutePercent}%</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                            <Zap className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${acutePercent}%` }}
                            transition={{ duration: 0.8 }}
                            className="bg-orange-600 h-full rounded-full"
                        />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-orange-50 rounded-full opacity-50 blur-2xl"></div>
                </motion.div>
            </div>

            {/* Table Actions Wrapper */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Table Header / Toolbar */}
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl">
                        {(['All', 'Chronic', 'Acute'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${filterType === type ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {type === 'All' ? 'Tất cả' : type === 'Chronic' ? 'Mãn tính' : 'Cấp tính'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bệnh..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-300 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">#</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên bệnh / Tình trạng</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phân loại</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Số bệnh nhân</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Tỷ lệ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDiseases.length > 0 ? filteredDiseases.map((disease, i) => (
                                <tr key={disease.name} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <span className="font-mono text-sm font-black text-slate-300">{i + 1}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="font-black text-slate-800 group-hover:text-primary-600 transition-colors">{disease.name}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            disease.type === 'Chronic'
                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                            : 'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {disease.type === 'Chronic' ? 'Mãn tính' : 'Cấp tính'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-lg font-black text-slate-900">{disease.count}</span>
                                        <span className="text-sm text-slate-400 ml-1">BN</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${totalPatientCount > 0 ? Math.round((disease.count / totalPatientCount) * 100) : 0}%` }}
                                                    transition={{ duration: 0.5, delay: i * 0.05 }}
                                                    className={`h-full rounded-full ${disease.type === 'Chronic' ? 'bg-blue-500' : 'bg-orange-500'}`}
                                                />
                                            </div>
                                            <span className="text-sm font-black text-slate-600 min-w-[40px] text-right">
                                                {totalPatientCount > 0 ? Math.round((disease.count / totalPatientCount) * 100) : 0}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-slate-400 font-bold">
                                        {diseases.length === 0 ? 'Chưa có dữ liệu bệnh tật trong hệ thống' : 'Không tìm thấy kết quả phù hợp'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination info */}
                <div className="px-8 py-6 flex items-center justify-between border-t border-slate-50 bg-slate-50/20">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Hiển thị <span className="text-slate-900">{filteredDiseases.length}</span> trên <span className="text-slate-900">{diseases.length}</span> loại bệnh
                    </p>
                </div>
            </div>

            {/* Footer Context / Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white flex items-center gap-5 shadow-sm">
                    <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">Thông tin hệ thống</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Dữ liệu bệnh tật được tổng hợp tự động từ hồ sơ bệnh nhân đang theo dõi trong hệ thống CDM.</p>
                    </div>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white flex items-center gap-5 shadow-sm">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                        <RefreshCw className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">Dữ liệu realtime</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Thống kê được cập nhật theo thời gian thực từ cơ sở dữ liệu bệnh nhân.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
