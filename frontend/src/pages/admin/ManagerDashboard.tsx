import {
  Download,
  Loader2,
  ChevronRight,
  RefreshCw,
  Search
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getManagerSummary, exportPatientExcelReport } from '@/api/management'
import { useTenant } from '@/context/TenantContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { toastService } from '@/services/toast'
import { useAuth } from '@/context/AuthContext'

export function ManagerDashboard() {
  const { headers } = useTenant()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: summary, isLoading } = useQuery({
    queryKey: ['manager-summary'],
    queryFn: () => getManagerSummary(headers),
    enabled: !!headers?.tenantId
  })

  const statsData = useMemo(() => [
    {
      label: 'Bệnh nhân CDM quản lý',
      value: summary?.totalPatients?.toLocaleString() || '0',
      trend: summary?.totalPatients ? 'Cập nhật' : undefined,
      icon: 'group',
      progress: summary?.totalPatients ? 100 : 0
    },
    {
      label: 'Bác sĩ đang hoạt động',
      value: summary?.totalDoctors?.toString() || '0',
      icon: 'stethoscope',
      badge: 'Bác sĩ',
      subText: 'Đội ngũ phòng khám'
    },
    {
      label: 'Bệnh nhân nguy cơ cao',
      value: summary?.highRiskCount?.toString() || '0',
      icon: 'priority_high',
      badge: 'Ưu tiên',
      isAlert: true,
      subText: 'Cần can thiệp khẩn cấp'
    }
  ], [summary])

  const chartData = useMemo(() => {
    if (!summary?.diseaseDistribution) return []
    return Object.entries(summary.diseaseDistribution).map(([name, value]) => ({
      name: name || 'Chưa phân loại',
      value
    }))
  }, [summary])

  const COLORS = ['#4ade80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const handleExport = async () => {
    try {
      await toastService.promise(
        exportPatientExcelReport(headers),
        {
          loading: 'Đang chuẩn bị báo cáo...',
          success: 'Đã tải xuống báo cáo doanh nghiệp!',
          error: 'Lỗi khi xuất báo cáo'
        }
      )
    } catch (error) {
      // Error managed by promise
    }
  }

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-bold text-sm text-slate-400 tracking-tight">Đang tải dữ liệu tổng quan...</p>
      </div>
    )
  }

  const greeting = getGreeting()

  return (
    <div className="p-4 sm:p-8 w-full animate-in fade-in duration-700 font-sans space-y-10">
      {/* ── Header Section ── */}
      <div className="flex justify-between items-end text-left">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Thống kê phòng khám</h2>
          <p className="text-neutral-500">
            {greeting}, <span className="text-primary font-bold">{user?.fullNameVi || 'Quản lý'}</span>. Đây là báo cáo sơ bộ hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2"
          >
            Xuất báo cáo .CSV
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => queryClient.invalidateQueries()}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm active:rotate-180 duration-500"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Stats Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Disease Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm">
          <div className="mb-8">
            <h3 className="text-xl font-bold">Tỷ lệ bệnh lý mạn tính</h3>
            <p className="text-xs text-slate-500">Phân bổ theo bệnh danh chuẩn đoán (IDC-10)</p>
          </div>

          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-primary/5 rounded-2xl">
                <span className="material-symbols-outlined text-4xl opacity-10 mb-2">monitoring</span>
                <p className="text-xs font-bold tracking-tight">Chưa có dữ liệu phân bổ</p>
              </div>
            )}
          </div>
        </div>

        {/* Cần can thiệp */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Cần can thiệp hành chính</h3>
              <p className="text-xs text-slate-500">Người bệnh trễ lịch tái khám {'>'} 30 ngày</p>
            </div>
            <button className="text-xs font-bold text-primary hover:underline tracking-wide">Tất cả</button>
          </div>

          <div className="space-y-4">
            {(summary?.missedFollowUpPatients ?? []).length > 0 ? (
              summary?.missedFollowUpPatients.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background-light dark:bg-slate-800/50 hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10 group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm tracking-tighter">
                      {p.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{p.fullName}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.condition || 'Bệnh Chronic'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider ${p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}`}>
                      {p.riskLevel}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 border border-dashed border-primary/5 rounded-2xl">
                <span className="material-symbols-outlined text-4xl opacity-10 mb-2">verified</span>
                <p className="text-[10px] font-bold tracking-tight text-center">Tất cả bệnh nhân đang được theo dõi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Header Design from Hero */}
      <section className="bg-slate-900 rounded-[2rem] p-8 sm:p-12 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 transition-transform duration-1000 group-hover:scale-110">
          <span className="material-symbols-outlined text-[120px]">manage_search</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-md">
            <h3 className="text-2xl font-bold tracking-tight mb-2">Tra cứu hồ sơ CDM</h3>
            <p className="text-slate-400 text-sm font-medium">Tìm kiếm nhanh thông tin bệnh nhân và tình trạng khám chữa bệnh trên toàn hệ thống phòng khám.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Nhập tên bệnh nhân, số hồ sơ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-6 rounded-2xl border-none bg-white/10 text-white placeholder:text-slate-500 focus:bg-white/20 focus:ring-2 focus:ring-primary/40 transition-all font-bold"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, trend, progress, badge, subText, isAlert }: any) {
  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm ${isAlert ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 ${isAlert ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-primary/10 text-primary'} rounded-xl flex items-center justify-center`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-bold text-green-500 flex items-center gap-1`}>
            {trend} <span className="material-symbols-outlined text-xs">trending_up</span>
          </span>
        )}
        {badge && (
          <span className={`px-2 py-1 ${isAlert ? 'bg-red-500 text-white' : 'bg-primary/10 text-primary'} text-[10px] font-bold rounded-full`}>
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium tracking-wider">{label}</h3>
      <p className={`text-3xl font-extrabold mt-1 ${isAlert ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
      {progress && (
        <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {subText && <p className={`text-[10px] ${isAlert ? 'text-red-400 font-bold' : 'text-slate-400'} mt-2 font-medium`}>{subText}</p>}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

