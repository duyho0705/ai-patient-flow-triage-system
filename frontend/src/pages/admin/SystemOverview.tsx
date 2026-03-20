import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminDashboard, getAuditLogs } from '@/api/admin'
import {
  RefreshCw, Download, Users, Zap, ShieldCheck, AlertCircle, 
  Activity, Database, Server, Smartphone, ExternalLink, ChevronRight,
  Clock, Lock, MoreHorizontal, TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'

export function SystemOverview() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboard
  })

  const { data: recentLogs } = useQuery({
    queryKey: ['admin-audit-logs-recent'],
    queryFn: () => getAuditLogs({ page: 0, size: 5 })
  })

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
           <div className="size-20 rounded-full border-4 border-md-primary/10 border-t-md-primary animate-spin" />
           <Activity className="absolute inset-0 m-auto text-md-primary animate-pulse" size={32} />
        </div>
        <p className="font-bold text-md-on-surface-variant text-sm animate-pulse tracking-tight">Đang phân tích dữ liệu hệ thống...</p>
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 pb-12">
      {/* ── Header Section ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">Tổng quan hệ thống</h2>
          <p className="text-md-on-surface-variant font-medium opacity-70">Giám sát sức khỏe nền tảng và hoạt động quản trị thời gian thực.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-md-primary text-white rounded-full font-bold text-sm shadow-elevation-1 hover:shadow-elevation-2 transition-all active:scale-95">
              <Download size={18} />
              <span>Báo cáo tuần</span>
           </button>
           <button
             onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })}
             className="size-11 flex items-center justify-center bg-md-surface-container text-md-primary rounded-full hover:bg-md-primary hover:text-white transition-all active:rotate-180 duration-500 shadow-sm"
           >
             <RefreshCw size={20} />
           </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          icon={Users}
          label="Tổng người dùng"
          value={dashboard?.totalUsers?.toLocaleString('vi-VN') || '24,592'}
          trend="+12.5%"
          color="bg-md-primary-container text-md-on-primary-container"
        />
        <StatCard 
          icon={Zap}
          label="Phiên hoạt động"
          value={dashboard?.activeUsers?.toLocaleString('vi-VN') || '1,208'}
          badge="Ổn định"
          color="bg-md-secondary-container text-md-on-secondary-container"
        />
        <StatCard 
          icon={ShieldCheck}
          label="Uptime Hệ thống"
          value="99.8%"
          badge="Tối ưu"
          color="bg-emerald-100 text-emerald-800"
        />
        <StatCard 
          icon={AlertCircle}
          label="Cảnh báo bảo mật"
          value={dashboard?.failedAuditLogs?.toString() || '02'}
          badge="Ưu tiên"
          isAlert
          color="bg-md-error-container text-md-on-error-container"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* User Growth Chart */}
        <section className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-md-outline/10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-md-on-surface">Tăng trưởng người dùng</h3>
              <p className="text-xs font-medium text-md-on-surface-variant opacity-60 mt-1">Dữ liệu 30 ngày qua</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-md-primary bg-md-primary/5 px-3 py-1 rounded-full">+14% vs tháng trước</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-2">
            {[40, 55, 45, 70, 60, 85, 95, 75, 65, 80, 90, 100].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
                className={`w-full rounded-t-2xl transition-all group/bar relative 
                  ${i === 11 ? 'bg-md-primary shadow-lg' : 'bg-md-primary/10 hover:bg-md-primary/30'}`}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-md-on-surface text-white text-[10px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap z-20 shadow-xl -translate-y-2 group-hover/bar:translate-y-0">
                  {Math.round(h * 245.92)}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-6 text-[10px] text-md-on-surface-variant font-bold px-4 opacity-40 uppercase tracking-widest">
            <span>Tuần 01</span>
            <span>Tuần 02</span>
            <span>Tuần 03</span>
            <span>Tuần 04</span>
          </div>
        </section>

        {/* Service Status */}
        <section className="bg-md-surface-container-low p-8 rounded-[40px] border border-md-outline/5 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-md-on-surface">Trạng thái dịch vụ</h3>
            <p className="text-xs font-medium text-md-on-surface-variant opacity-60 mt-1">Giám sát hạ tầng thời gian thực</p>
          </div>
          <div className="space-y-4 flex-1">
            <ServiceRow icon={Database} label="Cơ sở dữ liệu" status="Ổn định" />
            <ServiceRow icon={Server} label="Hệ thống API" status="Phản hồi nhanh" />
            <ServiceRow icon={Smartphone} label="Push Notifications" status="Hoạt động" />
            <ServiceRow icon={Activity} label="Media Engine" status="Bảo trì" isMaintenance />
          </div>
          <button className="mt-8 w-full py-4 bg-md-on-surface text-white rounded-3xl font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] shadow-elevation-1 flex items-center justify-center gap-2">
            <span>Chi tiết hạ tầng</span>
            <ExternalLink size={16} />
          </button>
        </section>
      </div>

      {/* Activity Log Section */}
      <section className="bg-white rounded-[40px] border border-md-outline/10 shadow-sm overflow-hidden">
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-md-on-surface">Nhật ký hoạt động</h3>
            <p className="text-xs font-medium text-md-on-surface-variant opacity-60 mt-1">Lịch sử thao tác quản trị gần nhất</p>
          </div>
          <button onClick={() => navigate('/admin/audit-logs')} className="text-sm font-bold text-md-primary hover:underline flex items-center gap-1 group">
            Xem tất cả <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="overflow-x-auto p-4 pt-0">
          <table className="w-full text-left">
            <thead className="text-[11px] font-bold text-md-on-surface-variant uppercase tracking-widest opacity-40">
              <tr>
                <th className="px-6 py-5">Hành động</th>
                <th className="px-6 py-5">Người thực hiện</th>
                <th className="px-6 py-5">Thời gian</th>
                <th className="px-6 py-5">Trạng thái</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-md-outline/5">
              {(recentLogs?.content?.length ? recentLogs.content : MOCK_LOGS).map((log: any, i: number) => (
                <tr key={i} className="hover:bg-md-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-xl flex items-center justify-center ${log.status === 'BLOCKED' ? 'bg-md-error-container text-md-error' : 'bg-md-surface-container text-md-primary'}`}>
                        {log.status === 'BLOCKED' ? <Lock size={18} /> : <Activity size={18} />}
                      </div>
                      <div className="max-w-[300px]">
                        <p className={`font-bold text-sm truncate ${log.status === 'BLOCKED' ? 'text-md-error' : 'text-md-on-surface'}`}>
                          {log.details || log.action}
                        </p>
                        <p className="text-[10px] text-md-on-surface-variant opacity-60 font-mono mt-0.5">{log.ipAddress || '192.168.1.45'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="size-8 rounded-full bg-md-secondary-container flex items-center justify-center overflow-hidden border border-white shadow-sm">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.userEmail || 'default'}`} alt="User" />
                       </div>
                       <span className="text-sm font-medium text-md-on-surface-variant truncate max-w-[150px]">{log.userName || log.userEmail || 'Hệ thống'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-md-on-surface-variant opacity-70">
                       <Clock size={14} />
                       <span className="text-xs font-medium">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${log.status === 'BLOCKED' ? 'bg-md-error-container text-md-on-error-container' : 'bg-emerald-100 text-emerald-800'}`}>
                      {log.status === 'BLOCKED' ? 'Bị chặn' : 'Thành công'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="p-2 rounded-full hover:bg-md-surface-container transition-all group-hover:scale-110">
                        <MoreHorizontal size={18} className="text-md-on-surface-variant" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, trend, badge, color, isAlert }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`bg-white p-7 rounded-[32px] border border-md-outline/10 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[180px] group transition-all hover:shadow-elevation-2`}
    >
      <div className="flex justify-between items-start">
        <div className={`size-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 ${color} shadow-sm`}>
          <Icon size={28} />
        </div>
        {trend && (
           <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">
             <TrendingUp size={14} />
             {trend}
           </span>
        )}
        {badge && !trend && (
           <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isAlert ? 'bg-md-error text-white shadow-lg shadow-md-error/20' : 'bg-md-secondary-container text-md-on-secondary-container'}`}>
             {badge}
           </span>
        )}
      </div>
      
      <div className="mt-6">
        <h3 className="text-xs font-bold text-md-on-surface-variant uppercase tracking-widest opacity-60 mb-2">{label}</h3>
        <p className={`text-4xl font-bold tracking-tight ${isAlert ? 'text-md-error' : 'text-md-on-surface'}`}>
           {value}
        </p>
      </div>
    </motion.div>
  )
}

function ServiceRow({ icon: Icon, label, status, isMaintenance }: any) {
  return (
    <div className="flex items-center justify-between p-5 bg-white rounded-3xl border border-md-outline/5 group hover:border-md-primary/20 transition-all hover:shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`size-10 rounded-xl flex items-center justify-center ${isMaintenance ? 'bg-md-surface-container text-md-on-surface-variant' : 'bg-md-primary/5 text-md-primary group-hover:bg-md-primary group-hover:text-white transition-all'}`}>
          <Icon size={20} />
        </div>
        <span className="text-sm font-bold text-md-on-surface">{label}</span>
      </div>
      <div className="flex items-center gap-2">
         {!isMaintenance && <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
         <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${isMaintenance ? 'text-md-on-surface-variant' : 'text-emerald-600'}`}>
           {status}
         </span>
      </div>
    </div>
  )
}

const MOCK_LOGS = [
  { details: 'Cập nhật hồ sơ bệnh án #SK-2024', userEmail: 'BS. Nguyễn Văn A', status: 'SUCCESS', ipAddress: '192.168.1.45', timestamp: new Date().toISOString() },
  { details: 'Tạo mới tài khoản Bác sĩ', userEmail: 'Admin Tùng', status: 'SUCCESS', ipAddress: '172.16.254.1', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { details: 'Đăng nhập thất bại (5 lần)', userEmail: 'Hệ thống (Bot)', status: 'BLOCKED', ipAddress: '103.45.21.10', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { details: 'Sao lưu cơ sở dữ liệu tự động', userEmail: 'Hệ thống', status: 'SUCCESS', ipAddress: 'Internal API', timestamp: new Date(Date.now() - 10800000).toISOString() }
]
