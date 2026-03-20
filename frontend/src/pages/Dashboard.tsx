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
  TrendingUp, Zap, Bell, Monitor, Globe, ChevronRight, ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { DoctorDashboard } from './doctor/DoctorDashboard'
import { ManagerDashboard } from './admin/ManagerDashboard'
import { Admin } from './Admin'

/* ─── role-based quick actions ─── */
const ROLE_ACTIONS: Record<Role, { to: string; label: string; desc: string; icon: any; color: string }[]> = {
  admin: [
    { to: '/reception', label: 'Tiếp nhận', desc: 'Đăng ký và check-in', icon: Users, color: 'md-primary' },
    { to: '/consultation', label: 'Khám & Điều trị', desc: 'Phiên khám & kê đơn thuốc điện tử', icon: Stethoscope, color: 'md-secondary' },
    { to: '/analytics', label: 'Thống kê', desc: 'Xu hướng & chỉ số KPI', icon: BarChart2, color: 'md-tertiary' },
    { to: '/admin', label: 'Quản trị', desc: 'Quản trị hệ thống', icon: Settings, color: 'md-on-surface-variant' },
  ],
  receptionist: [
    { to: '/reception', label: 'Tiếp nhận', desc: 'Đăng ký và check-in', icon: Users, color: 'md-primary' },
    { to: '/scheduling', label: 'Lịch hẹn', desc: 'Quản lý lịch hẹn', icon: Calendar, color: 'md-secondary' },
  ],
  triage_nurse: [
    { to: '/reception', label: 'Tiếp nhận', desc: 'Đăng ký bệnh nhân', icon: Users, color: 'md-primary' },
  ],
  doctor: [
    { to: '/consultation', label: 'Khám & Điều trị', desc: 'Khám & kê đơn thuốc điện tử', icon: Stethoscope, color: 'md-primary' },
    { to: '/scheduling', label: 'Lịch hẹn', desc: 'Quản lý lịch hẹn', icon: Calendar, color: 'md-secondary' },
    { to: '/chat', label: 'Tư vấn từ xa', desc: 'Chat với bệnh nhân', icon: MessageSquare, color: 'md-tertiary' },
  ],
  clinic_manager: [
    { to: '/analytics', label: 'Thống kê', desc: 'Xu hướng bệnh mãn tính', icon: BarChart2, color: 'md-primary' },
    { to: '/reports', label: 'Báo cáo', desc: 'Tổng kết & can thiệp', icon: FileText, color: 'md-secondary' },
  ],
  pharmacist: [
    { to: '/consultation', label: 'Đơn thuốc điện tử', desc: 'Quản lý đơn thuốc điện tử', icon: Pill, color: 'md-primary' },
  ],
  patient: [
    { to: '/patient', label: 'Sức khỏe', desc: 'Theo dõi sinh hiệu', icon: Activity, color: 'md-primary' },
    { to: '/patient/appointments', label: 'Lịch hẹn', desc: 'Đặt hẹn bác sĩ', icon: Calendar, color: 'md-secondary' },
    { to: '/patient/chat', label: 'Tư vấn BS', desc: 'Hỏi đáp trực tuyến', icon: MessageSquare, color: 'md-tertiary' },
  ],
}

const ROLE_TITLES: Record<Role, { title: string; subtitle: string; icon: any }> = {
  admin: { title: 'Quản trị', subtitle: 'Tổng quan hoạt động toàn hệ thống', icon: ShieldCheck },
  receptionist: { title: 'Tiếp nhận', subtitle: 'Quản lý đăng ký và lịch hẹn', icon: Users },
  triage_nurse: { title: 'Tiếp nhận', subtitle: 'Hỗ trợ đăng ký bệnh nhân', icon: Activity },
  doctor: { title: 'Phòng khám', subtitle: 'Bảng điều khiển bác sĩ', icon: Stethoscope },
  clinic_manager: { title: 'Giám sát', subtitle: 'Phân tích hiệu quả và tuân thủ điều trị', icon: BarChart2 },
  pharmacist: { title: 'Dược phẩm', subtitle: 'Quản lý kho thuốc và đơn thuốc', icon: Pill },
  patient: { title: 'Sức khỏe', subtitle: 'Theo dõi hành trình điều trị', icon: Activity },
}

/* ─── Premium MD3 Stat Card ─── */
function StatCard({ label, value, icon: Icon, trend, trendUp }: {
  label: string; value: string | number; icon: any; trend?: string; trendUp?: boolean
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-md-surface-container-low p-6 rounded-[32px] border border-md-outline/5 shadow-elevation-1 flex flex-col justify-between min-h-[160px]"
    >
      <div className="flex items-center justify-between">
        <div className="size-12 rounded-2xl bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center shadow-sm">
          <Icon className="size-6" />
        </div>
        {trend && (
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${trendUp ? 'bg-md-secondary-container text-md-primary font-black' : 'bg-md-error-container text-md-error font-black'}`}>
            {trendUp ? <TrendingUp size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>

      <div className="mt-4">
        <h4 className="text-4xl font-bold text-md-on-surface tracking-tight">{value}</h4>
        <p className="text-xs font-medium text-md-on-surface-variant opacity-70 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </motion.div>
  )
}

/* ─── Action Tile ─── */
function ActionTile({ to, label, desc, icon: Icon, index }: {
  to: string; label: string; desc: string; icon: any; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={to} className="group block bg-white border border-md-outline/5 p-6 rounded-[28px] hover:bg-md-primary/5 hover:border-md-primary/10 transition-all hover:shadow-elevation-2 h-full">
         <div className={`size-14 rounded-2xl mb-5 flex items-center justify-center transition-all bg-md-surface-container-high text-md-primary group-hover:bg-md-primary group-hover:text-white group-hover:rotate-3 shadow-sm`}>
            <Icon className="size-7" />
         </div>
         <div className="flex items-center justify-between">
            <div>
              <h5 className="font-bold text-md-on-surface text-base mb-1 group-hover:text-md-primary transition-colors">{label}</h5>
              <p className="text-xs text-md-on-surface-variant font-medium leading-relaxed opacity-70">{desc}</p>
            </div>
            <div className="size-8 rounded-full flex items-center justify-center text-md-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
               <ArrowRight size={20} />
            </div>
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
  if (role === 'clinic_manager') return <ManagerDashboard />
  if (role === 'admin') return <Admin />

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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── MD3 Surface Header ── */}
      <div className="bg-[#F3EDF7] rounded-[48px] p-10 lg:p-14 relative overflow-hidden shadow-elevation-1 border border-md-outline/5">
        <div className="blur-blob size-80 bg-md-primary/10 -top-20 -right-20" />
        <div className="blur-blob size-60 bg-md-secondary/10 -bottom-20 -left-10" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-md-primary/10 rounded-full border border-md-primary/10"
            >
              <Sparkles className="size-4 text-md-primary" />
              <span className="text-xs font-bold text-md-primary uppercase tracking-widest">{greeting}</span>
            </motion.div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex size-20 bg-white rounded-3xl items-center justify-center text-md-primary shadow-elevation-1 relative border border-md-outline/5">
                <config.icon className="size-10" />
              </div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-4xl lg:text-5xl font-bold text-md-on-surface tracking-tight"
                >
                  {config.title}
                </motion.h1>
                <p className="text-md-on-surface-variant font-medium mt-3 text-base max-w-lg leading-relaxed opacity-80">
                  Xin chào, <span className="text-md-primary font-bold">{user?.fullNameVi || 'Người dùng'}</span>. {config.subtitle}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
                <p className="text-[11px] font-bold text-md-on-surface-variant uppercase tracking-widest opacity-60 mb-2">Hệ thống</p>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-full border border-md-outline/5 shadow-sm">
                   <div className="size-2 rounded-full bg-md-primary animate-pulse" />
                   <span className="text-sm font-bold text-md-on-surface tracking-tight">Ổn định</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* ── Main Stats Grid ── */}
        {(showAnalytics || role === 'receptionist') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {showAnalytics ? (
              <>
                <StatCard
                  label="Tiếp nhận hôm nay"
                  value={todayStats?.triageCount ?? 0}
                  icon={UserCheck}
                  trend={weekStats ? `${weekStats.avgPerDay?.toFixed(0) ?? 0}/ngày` : '—'}
                  trendUp
                />
                <StatCard
                  label="Tỷ lệ hoàn tất"
                  value={todayStats && todayStats.triageCount > 0
                    ? `${Math.round((todayStats.completedCount / todayStats.triageCount) * 100)}%`
                    : '0%'}
                  icon={CheckCircle2}
                  trend="hôm nay"
                  trendUp
                />
                <StatCard
                  label="Theo dõi tuần này"
                  value={weekStats?.completedCount ?? 0}
                  icon={Activity}
                  trend="tổng ca"
                  trendUp
                />
              </>
            ) : (
              <>
                <StatCard label="Tiếp nhận" value="—" icon={UserCheck} />
                <StatCard label="Đang chờ" value="—" icon={Clock} />
                <StatCard label="Hoàn tất" value="—" icon={CheckCircle2} />
              </>
            )}
          </div>
        )}

        {/* ── Quick Actions Section ── */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-md-primary-container text-md-primary rounded-xl flex items-center justify-center">
                <Zap size={22} />
            </div>
            <h2 className="text-2xl font-bold text-md-on-surface tracking-tight">Truy cập nhanh</h2>
            <div className="h-px flex-1 bg-md-outline/10 ml-4 hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {actions.map((a, i) => (
              <ActionTile key={a.to} {...a} index={i} />
            ))}
          </div>
        </div>

        {/* ── Additional Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white rounded-[40px] border border-md-outline/10 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center">
                       <Bell size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-md-on-surface">Hoạt động gần đây</h3>
                 </div>
                 <button className="text-sm font-bold text-md-primary hover:underline flex items-center gap-1">
                    Xem tất cả <ChevronRight size={16} />
                 </button>
              </div>
              <div className="flex flex-col items-center justify-center py-16 opacity-40">
                 <Activity size={48} className="text-md-on-surface-variant mb-4" />
                 <p className="text-sm font-medium text-md-on-surface-variant text-center max-w-xs">
                    Hiện chưa có hoạt động mới nào được ghi nhận trong phiên làm việc này.
                 </p>
              </div>
           </div>

           <div className="bg-md-primary rounded-[40px] p-10 text-white relative overflow-hidden shadow-elevation-2">
              <div className="absolute top-0 right-0 size-64 bg-white/5 -mr-20 -mt-20 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-3">
                    <Globe size={20} className="text-md-primary-container" />
                    <h4 className="text-[11px] font-bold uppercase tracking-widest opacity-70">Thông số vận hành</h4>
                 </div>
                 
                 <div className="space-y-6">
                    <EnvRow label="Vai trò" value={config.title} />
                    <EnvRow label="Sử dụng" value={user?.email || '—'} />
                    <EnvRow label="Server" value="Standard Node 01" />
                    <EnvRow label="Phiên bản" value="v2.5.0-PRO" />
                 </div>

                 <div className="pt-8 border-t border-white/10 mt-4">
                    <div className="flex items-center gap-4">
                       <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center">
                          <Monitor size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Thiết bị</p>
                          <p className="text-sm font-bold">SafeGuard Console</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function EnvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium opacity-60 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold tracking-tight">{value}</span>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}
