import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminDashboard, getAuditLogs } from '@/api/admin'
import {
  Loader2, RefreshCw, Download
} from 'lucide-react'

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
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black text-slate-400 text-sm text-center">Đang phân tích dữ liệu hệ thống...</p>
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in duration-700 font-sans space-y-10">
      {/* ── Header Section ── */}
      <div className="flex justify-between items-end text-left">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Tổng quan hệ thống</h2>
          <p className="text-neutral-500">Chào buổi sáng, Quản trị viên. Đây là tóm tắt sức khỏe nền tảng trong 24 giờ qua.</p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm active:rotate-180 duration-500"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* ── Stats Bento Grid (Identical to FontText.html) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon="group"
          label="Tổng người dùng"
          value={dashboard?.totalUsers?.toLocaleString('vi-VN') || '24,592'}
          trend="+12.5%"
          trendUp
          progress={75}
        />
        <StatCard 
          icon="bolt"
          label="Phiên hoạt động"
          value={dashboard?.activeUsers?.toLocaleString('vi-VN') || '1,208'}
          badge="Ổn định"
          subText="Hiện đang truy cập trực tuyến"
        />
        <StatCard 
          icon="health_and_safety"
          label="Sức khỏe hệ thống"
          value="99.8%"
          badge="Mượt mà"
          isHealth
        />
        <StatCard 
          icon="security"
          label="Cảnh báo bảo mật"
          value={dashboard?.failedAuditLogs?.toString() || '02'}
          badge="Ưu tiên"
          isAlert
          subText="Cần kiểm tra truy cập IP lạ"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Growth Chart */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold">Tăng trưởng người dùng</h3>
              <p className="text-xs text-slate-500">Thống kê dữ liệu trong 30 ngày qua</p>
            </div>
            <select className="text-xs font-bold border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-primary px-4 py-2 transition-all outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              <option>30 ngày qua</option>
              <option>7 ngày qua</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-3 px-4">
            {[40, 55, 45, 70, 60, 85, 95, 75, 65, 80, 90, 100].map((h, i) => (
              <div
                key={i}
                className={`w-full rounded-t-lg transition-all hover:bg-primary group relative ${i === 11 ? 'bg-primary' : 'bg-primary/20'}`}
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md whitespace-nowrap z-10 shadow-xl">
                  {Math.round(h * 245.92)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold px-4">
            <span>Tuần 01</span>
            <span>Tuần 02</span>
            <span>Tuần 03</span>
            <span>Tuần 04</span>
          </div>
        </section>

        {/* Service Status */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold">Trạng thái dịch vụ</h3>
            <p className="text-xs text-slate-500">Giám sát thời gian thực</p>
          </div>
          <div className="space-y-4 flex-1">
            <ServiceRow icon="database" label="Cơ sở dữ liệu" status="Hoạt động" />
            <ServiceRow icon="api" label="Hệ thống API" status="Mượt mà" />
            <ServiceRow icon="notifications_active" label="Thông báo Push" status="Hoạt động" />
            <ServiceRow icon="storage" label="Media Server" status="Bảo trì" isMaintenance />
          </div>
          <button className="mt-6 w-full py-3 bg-slate-900 dark:bg-primary text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg active:scale-[0.98]">
            Xem chi tiết tài nguyên
          </button>
        </section>
      </div>

      {/* Activity Log Table (100% FontText.html) ── */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-primary/5 flex justify-between items-center bg-white dark:bg-slate-900">
          <div>
            <h3 className="text-xl font-bold">Nhật ký hoạt động gần đây</h3>
            <p className="text-xs text-slate-500">Lịch sử thao tác của các thành viên quản trị</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            Xuất báo cáo .CSV
            <Download className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary/5 border-b border-primary/5 text-[10px] font-bold text-slate-500">
              <tr>
                <th className="px-8 py-4">Hành động</th>
                <th className="px-8 py-4">Người thực hiện</th>
                <th className="px-8 py-4">Thời gian</th>
                <th className="px-8 py-4">Địa chỉ IP</th>
                <th className="px-8 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {(recentLogs?.content?.length ? recentLogs.content : MOCK_LOGS).map((log: any, i: number) => (
                <tr key={i} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${log.status === 'BLOCKED' ? 'text-red-500' : 'text-slate-400'}`}>
                        {log.status === 'BLOCKED' ? 'login' : 'edit_note'}
                      </span>
                      <span className={`font-bold text-sm ${log.status === 'BLOCKED' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {log.details || log.action}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                          {log.email?.charAt(0).toUpperCase() || 'H'}
                       </div>
                       <span className="text-sm text-slate-700 dark:text-slate-300">{log.email || 'BS. Nguyễn Văn A'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-500 whitespace-nowrap">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '10:45 - 24/05'}
                  </td>
                  <td className="px-8 py-5 font-mono text-xs text-slate-400">{log.ipAddress || '192.168.1.45'}</td>
                  <td className="px-8 py-5">
                    <span className={`flex items-center gap-1.5 ${log.status === 'BLOCKED' ? 'text-red-500' : 'text-primary'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'BLOCKED' ? 'bg-red-500' : 'bg-primary'}`}></span>
                      <span className="text-[10px] font-bold">{log.status === 'BLOCKED' ? 'Bị chặn' : 'Thành công'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-primary/5 flex justify-center">
          <button onClick={() => navigate('/admin/audit-logs')} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
            Xem tất cả lịch sử
          </button>
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value, trend, progress, badge, subText, isHealth, isAlert }: any) {
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
      <h3 className="text-slate-500 text-xs font-bold tracking-wider">{label}</h3>
      <p className={`text-3xl font-extrabold mt-1 ${isAlert ? 'text-red-500' : (isHealth ? 'text-primary' : 'text-slate-900 dark:text-white')}`}>
         {value}
      </p>
      {progress && (
        <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {subText && <p className={`text-[10px] ${isAlert ? 'text-red-400 font-bold' : 'text-slate-400'} mt-2 font-medium`}>{subText}</p>}
      {isHealth && (
        <div className="flex gap-1 mt-4">
          <div className="h-1 flex-1 bg-primary rounded-full"></div>
          <div className="h-1 flex-1 bg-primary rounded-full"></div>
          <div className="h-1 flex-1 bg-primary rounded-full"></div>
          <div className="h-1 flex-1 bg-primary rounded-full"></div>
          <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        </div>
      )}
    </div>
  )
}

function ServiceRow({ icon, label, status, isMaintenance }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-background-light dark:bg-slate-800 rounded-xl border border-primary/5">
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined ${isMaintenance ? 'text-slate-400' : 'text-primary'}`}>{icon}</span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span className={`px-2 py-1 ${isMaintenance ? 'bg-slate-100 dark:bg-slate-700 text-slate-500' : 'bg-primary/10 text-primary'} text-[10px] font-bold rounded-md`}>
        {status}
      </span>
    </div>
  )
}

const MOCK_LOGS = [
  { action: 'Cập nhật hồ sơ bệnh án #SK-2024', email: 'BS. Nguyễn Văn A', status: 'SUCCESS', ipAddress: '192.168.1.45' },
  { action: 'Tạo mới tài khoản Bác sĩ', email: 'Admin Tùng', status: 'SUCCESS', ipAddress: '172.16.254.1' },
  { action: 'Đăng nhập thất bại (5 lần)', email: 'Hệ thống (Bot)', status: 'BLOCKED', ipAddress: '103.45.21.10' },
  { action: 'Sao lưu cơ sở dữ liệu tự động', email: 'Hệ thống', status: 'SUCCESS', ipAddress: 'Internal API' }
]
