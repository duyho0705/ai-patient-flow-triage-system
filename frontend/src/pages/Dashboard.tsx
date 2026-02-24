import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { getPrimaryStaffRole } from '@/security/roleMapping'
import type { Role } from '@/context/RoleContext'
import { getTodaySummary, getWeekSummary } from '@/api/analytics'
import { useQuery } from '@tanstack/react-query'
import {
  Users, Activity, Calendar, MessageSquare, FileText, BarChart2,
  Settings, ShieldCheck, Stethoscope,
  Clock, CheckCircle2, UserCheck,
  ArrowDownRight, Pill, Sparkles,
  TrendingUp, Zap, Bell, Monitor, Globe
} from 'lucide-react'
import { motion } from 'framer-motion'
import { DoctorDashboard } from './doctor/DoctorDashboard'

/* ─── role-based quick actions ─── */
const ROLE_ACTIONS: Record<Role, { to: string; label: string; desc: string; icon: any; color: string }[]> = {
  admin: [
    { to: '/reception', label: 'Tiếp nhận', desc: 'Đăng ký và check-in', icon: Users, color: 'blue' },
    { to: '/consultation', label: 'Khám & Điều trị', desc: 'Phiên khám & kê đơn', icon: Stethoscope, color: 'emerald' },
    { to: '/analytics', label: 'Thống kê', desc: 'Xu hướng & chỉ số KPI', icon: BarChart2, color: 'indigo' },
    { to: '/admin', label: 'Quản trị', desc: 'Quản trị hệ thống', icon: Settings, color: 'slate' },
  ],
  receptionist: [
    { to: '/reception', label: 'Tiếp nhận', desc: 'Đăng ký và check-in', icon: Users, color: 'blue' },
    { to: '/scheduling', label: 'Lịch hẹn', desc: 'Quản lý lịch hẹn', icon: Calendar, color: 'amber' },
  ],
  triage_nurse: [
    { to: '/reception', label: 'Tiếp nhận', desc: 'Đăng ký bệnh nhân', icon: Users, color: 'blue' },
  ],
  doctor: [
    { to: '/consultation', label: 'Khám & Điều trị', desc: 'Khám & kê đơn', icon: Stethoscope, color: 'emerald' },
    { to: '/scheduling', label: 'Lịch hẹn', desc: 'Quản lý lịch hẹn', icon: Calendar, color: 'amber' },
    { to: '/chat', label: 'Tư vấn từ xa', desc: 'Chat với bệnh nhân', icon: MessageSquare, color: 'indigo' },
  ],
  clinic_manager: [
    { to: '/analytics', label: 'Thống kê', desc: 'Xu hướng bệnh mãn tính', icon: BarChart2, color: 'indigo' },
    { to: '/reports', label: 'Báo cáo', desc: 'Tổng kết & can thiệp', icon: FileText, color: 'rose' },
  ],
  pharmacist: [
    { to: '/consultation', label: 'Đơn thuốc', desc: 'Quản lý đơn thuốc', icon: Pill, color: 'purple' },
  ],
  patient: [
    { to: '/patient', label: 'Sức khỏe', desc: 'Theo dõi sinh hiệu', icon: Activity, color: 'rose' },
    { to: '/patient/appointments', label: 'Lịch hẹn', desc: 'Đặt hẹn bác sĩ', icon: Calendar, color: 'amber' },
    { to: '/patient/chat', label: 'Tư vấn BS', desc: 'Hỏi đáp trực tuyến', icon: MessageSquare, color: 'indigo' },
  ],
}

const ROLE_TITLES: Record<Role, { title: string; subtitle: string; icon: any }> = {
  admin: { title: 'Quản trị Hệ thống', subtitle: 'Tổng quan hoạt động toàn hệ thống', icon: ShieldCheck },
  receptionist: { title: 'Tiếp nhận', subtitle: 'Quản lý đăng ký và lịch hẹn', icon: Users },
  triage_nurse: { title: 'Tiếp nhận', subtitle: 'Hỗ trợ đăng ký bệnh nhân', icon: Activity },
  doctor: { title: 'Phòng khám', subtitle: 'Bảng điều khiển bác sĩ', icon: Stethoscope },
  clinic_manager: { title: 'Giám sát', subtitle: 'Phân tích hiệu quả và tuân thủ điều trị', icon: BarChart2 },
  pharmacist: { title: 'Dược phẩm', subtitle: 'Quản lý kho thuốc và đơn thuốc', icon: Pill },
  patient: { title: 'Sức khỏe', subtitle: 'Theo dõi hành trình điều trị', icon: Heart },
}

function Heart(props: any) { return <Activity {...props} /> } // Fallback

/* ─── Premium Stat Card ─── */
function StatCard({ label, value, icon: Icon, color, bgColor, trend, trendUp }: {
  label: string; value: string | number; icon: any; color: string; bgColor: string
  trend?: string; trendUp?: boolean
}) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] ${bgColor}`} />

      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center ${color} shadow-sm shadow-current/10`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h4 className="text-3xl font-black text-slate-900 tracking-tightest">{value}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </motion.div>
  )
}

/* ─── Premium Action Tile ─── */
function ActionTile({ to, label, desc, icon: Icon, color, index }: {
  to: string; label: string; desc: string; icon: any; color: string; index: number
}) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/20 text-blue-600 bg-blue-50',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20 text-emerald-600 bg-emerald-50',
    indigo: 'from-indigo-500 to-purple-600 shadow-indigo-500/20 text-indigo-600 bg-indigo-50',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/20 text-amber-600 bg-amber-50',
    rose: 'from-rose-500 to-pink-600 shadow-rose-500/20 text-rose-600 bg-rose-50',
    purple: 'from-purple-500 to-violet-600 shadow-purple-500/20 text-purple-600 bg-purple-50',
    slate: 'from-slate-700 to-slate-900 shadow-slate-900/20 text-slate-700 bg-slate-50',
  }

  const colorStyles = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={to} className="group relative block h-full">
        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10 rounded-[1.5rem] scale-95" />
        <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm group-hover:border-transparent group-hover:shadow-2xl transition-all h-full flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-all group-hover:scale-110 group-hover:-rotate-3 ${colorStyles.split(' ').slice(-2).join(' ')} group-hover:bg-gradient-to-br ${colorStyles.split(' ').slice(0, 2).join(' ')} group-hover:text-white`}>
            <Icon className="w-7 h-7" />
          </div>
          <h5 className="font-black text-slate-800 tracking-tight text-sm mb-1 group-hover:text-blue-600 transition-colors">{label}</h5>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 line-clamp-1">
            {desc}
          </p>
          <div className="mt-4 w-6 h-1 bg-slate-100 group-hover:bg-blue-500 group-hover:w-10 rounded-full transition-all" />
        </div>
      </Link>
    </motion.div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const { branchId, headers } = useTenant()
  const role = getPrimaryStaffRole(user?.roles)

  if (role === 'doctor') return <DoctorDashboard />

  const config = ROLE_TITLES[role] || ROLE_TITLES.receptionist
  const actions = ROLE_ACTIONS[role] || ROLE_ACTIONS.receptionist

  const showAnalytics = ['admin', 'clinic_manager'].includes(role)
  const { data: todayStats } = useQuery({
    queryKey: ['dashboard-today', branchId],
    queryFn: () => getTodaySummary(branchId || undefined, headers),
    enabled: showAnalytics && !!headers?.tenantId,
  })
  const { data: weekStats } = useQuery({
    queryKey: ['dashboard-week', branchId],
    queryFn: () => getWeekSummary(branchId || undefined, headers),
    enabled: showAnalytics && !!headers?.tenantId,
  })

  const greeting = getGreeting()

  return (
    <div className="pb-20 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Premium Hero Header ── */}
      <div className="bg-slate-900 -mx-4 sm:-mx-6 lg:-mx-8 p-10 lg:p-14 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent skew-x-12 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/5 backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest">{greeting}</span>
            </motion.div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex w-20 h-20 bg-white rounded-3xl items-center justify-center text-slate-900 shadow-2xl relative">
                <config.icon className="w-10 h-10" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-4 border-slate-900">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-4xl lg:text-5xl font-black text-white tracking-tightest leading-none uppercase"
                >
                  {config.title}
                </motion.h1>
                <p className="text-slate-400 font-bold mt-2 text-sm max-w-lg leading-relaxed">
                  Xin chào, <span className="text-white font-black">{user?.fullNameVi || 'Người dùng'}</span>. {config.subtitle}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Trạng thái Live</p>
              <div className="flex items-center gap-2 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Ổn định</span>
              </div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Phiên bản</p>
              <p className="text-2xl font-black text-white italic">v2.4.0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 -mt-4 relative z-20">

        {/* ── Main Stats Grid ── */}
        {(showAnalytics || role === 'receptionist') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {showAnalytics ? (
              <>
                <StatCard
                  label="Lượt tiếp nhận hôm nay"
                  value={todayStats?.triageCount ?? 0}
                  icon={UserCheck} color="text-blue-600" bgColor="bg-blue-50"
                  trend={weekStats ? `${weekStats.avgPerDay?.toFixed(0) ?? 0}/ngày` : '—'}
                  trendUp
                />
                <StatCard
                  label="Tỷ lệ hoàn tất"
                  value={todayStats && todayStats.triageCount > 0
                    ? `${Math.round((todayStats.completedCount / todayStats.triageCount) * 100)}%`
                    : '0%'}
                  icon={CheckCircle2} color="text-emerald-600" bgColor="bg-emerald-50"
                  trend="hôm nay"
                  trendUp
                />
                <StatCard
                  label="Theo dõi tuần này"
                  value={weekStats?.completedCount ?? 0}
                  icon={Activity} color="text-violet-600" bgColor="bg-violet-50"
                  trend="tổng ca"
                  trendUp
                />
              </>
            ) : (
              <>
                <StatCard label="Tiếp nhận" value="—" icon={UserCheck} color="text-blue-600" bgColor="bg-blue-50" />
                <StatCard label="Đang chờ" value="—" icon={Clock} color="text-amber-600" bgColor="bg-amber-50" />
                <StatCard label="Hoàn tất" value="—" icon={CheckCircle2} color="text-emerald-600" bgColor="bg-emerald-50" />
              </>
            )}
          </div>
        )}

        {/* ── Quick Actions Section ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Zap className="w-5 h-5 text-slate-900" />
              </div>
              Truy cập nhanh
            </h2>
            <div className="h-px flex-1 bg-slate-100 mx-8 hidden sm:block" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {actions.map((a, i) => (
              <ActionTile key={a.to} {...a} index={i} />
            ))}
          </div>
        </div>

        {/* ── System Details ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Alerts/Activity */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase text-xs">
                <Bell className="w-4 h-4 text-rose-500" />
                Hoạt động gần đây
              </h3>
              <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                Xem tất cả
              </button>
            </div>
            <div className="p-8 space-y-6">
              <ActivityItem
                icon={<UserCheck className="w-5 h-5" />}
                title="Bệnh nhân mới tiếp nhận"
                desc="Bệnh nhân Nguyễn Văn A vừa được check-in tại chi nhánh"
                time="5 phút trước"
                color="blue"
              />
              <ActivityItem
                icon={<CheckCircle2 className="w-5 h-5" />}
                title="Phiên khám hoàn tất"
                desc="Bác sĩ Trần Thị B đã hoàn thành phiên khám mã #4928"
                time="12 phút trước"
                color="emerald"
              />
              <ActivityItem
                icon={<Calendar className="w-5 h-5" />}
                title="Lịch hẹn xác nhận"
                desc="Lịch hẹn mới cho bệnh nhân Lý Văn C đã được hệ thống phê duyệt"
                time="30 phút trước"
                color="amber"
              />
            </div>
          </div>

          {/* System Environment */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
              <Monitor className="w-32 h-32" />
            </div>

            <h3 className="font-black text-white tracking-tight flex items-center gap-3 uppercase text-xs mb-8">
              <Globe className="w-4 h-4 text-blue-400" />
              Thông số vận hành
            </h3>

            <div className="space-y-4">
              <EnvRow label="Vai trò" value={config.title} />
              <EnvRow label="Tên đăng nhập" value={user?.email || '—'} />
              <EnvRow label="Server Node" value="Primary Cluster 01" />
              <EnvRow label="Môi trường" value="Production" status />
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Thiết bị</p>
                  <p className="text-sm font-bold text-white">Quản trị viên Desktop</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Shared UI pieces ─── */

function ActivityItem({ icon, title, desc, time, color }: {
  icon: any; title: string; desc: string; time: string; color: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="flex items-start gap-4 group/item">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-all group-hover/item:scale-110 ${colors[color] || colors.blue}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4 mb-1">
          <h4 className="font-black text-slate-800 text-sm tracking-tight">{title}</h4>
          <span className="text-[10px] font-black text-slate-300 uppercase shrink-0">{time}</span>
        </div>
        <p className="text-xs font-bold text-slate-400 line-clamp-1">{desc}</p>
      </div>
    </div>
  )
}

function EnvRow({ label, value, status }: { label: string; value: string; status?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        {status && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        <span className="text-sm font-black text-white">{value}</span>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}
