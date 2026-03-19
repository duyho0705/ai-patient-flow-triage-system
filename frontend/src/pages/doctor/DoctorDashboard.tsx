import { useState, useMemo } from 'react'
import { PrescriptionModal } from '@/components/modals/PrescriptionModal'
import { AppointmentModal } from '@/components/modals/AppointmentModal'
import { AdviceModal } from '@/components/modals/AdviceModal'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Loader2,
  RefreshCw,
  ChevronRight
} from 'lucide-react'

import { getDoctorDashboard } from '@/api/doctor'
import { getDoctorTodayAppointments } from '@/api/doctorAppointments'
import { ChronicDiseaseService } from '@/services/ChronicDiseaseService'
import { useAuth } from '@/context/AuthContext'

export function DoctorDashboard() {
  const { headers, tenantId } = useTenant()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ['doctor-dashboard', tenantId],
    queryFn: () => getDoctorDashboard(headers),
    enabled: !!tenantId
  })

  const { data: todayAppointments } = useQuery({
    queryKey: ['doctor-today-appointments', tenantId],
    queryFn: () => getDoctorTodayAppointments(headers),
    enabled: !!tenantId
  })

  const sortedRiskPatients = useMemo(() => {
    if (!dashboard?.riskPatients) return [];
    return ChronicDiseaseService.sortRiskPatients(dashboard.riskPatients);
  }, [dashboard?.riskPatients]);

  const displayAppointments = todayAppointments?.length
    ? todayAppointments
    : dashboard?.upcomingAppointments || []

  if (loadingDash) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold text-sm text-slate-400 tracking-tight">Đang tải dữ liệu hồ sơ...</p>
      </div>
    )
  }

  const greeting = getGreeting()

  return (
    <div className="p-4 sm:p-8 w-full animate-in fade-in duration-700 font-sans space-y-10">
      {/* ── Header Section ── */}
      <div className="flex justify-between items-end text-left">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Trình quản lý phòng khám</h2>
          <p className="text-neutral-500">
            {greeting}, Bác sĩ <span className="text-primary font-bold">{user?.fullNameVi || 'Của Tôi'}</span>. Chào mừng quay trở lại.
          </p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries()}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm active:rotate-180 duration-500"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* ── Stats Bento Grid (100% FontText.html style) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="group"
          label="Bệnh nhân quản lý"
          value={dashboard?.totalPatientsToday || 0}
          trend="Cập nhật"
          trendUp
          progress={dashboard?.totalPatientsToday ? 100 : 0}
          onClick={() => navigate('/patients')}
        />
        <StatCard
          icon="priority_high"
          label="Nguy cơ cao"
          value={dashboard?.riskPatients?.length || 0}
          badge="Ưu tiên"
          subText="Cần can thiệp khẩn cấp"
          isAlert
          onClick={() => navigate('/patients')}
        />
        <StatCard
          icon="calendar_month"
          label="Lịch trình chờ"
          value={dashboard?.pendingConsultations || 0}
          badge="Hôm nay"
          subText="Xem chi tiết lịch hẹn"
          onClick={() => navigate('/scheduling')}
        />
        <StatCard
          icon="mail"
          label="Tin nhắn tư vấn"
          value={dashboard?.unreadMessages?.length || 0}
          badge="Mới"
          subText="Phản hồi người bệnh"
          onClick={() => navigate('/chat')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <section className="lg:col-span-2 space-y-8">
          {/* Risk Patients Table style */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Phân tích nguy cơ bệnh nhân</h3>
                <p className="text-xs text-slate-500">Giám sát sinh hiệu tự động 24 giờ</p>
              </div>
              <button
                onClick={() => navigate('/patients')}
                className="text-xs font-bold text-primary hover:underline uppercase tracking-wide"
              >
                Tất cả bệnh nhân
              </button>
            </div>

            <div className="space-y-4">
              {sortedRiskPatients.length > 0 ? (
                sortedRiskPatients.slice(0, 3).map((risk: any, i: number) => (
                  <RiskRow key={i} risk={risk} onClick={() => navigate(`/patients/${risk.patientId}/ehr`)} />
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-primary/5 rounded-2xl">
                  <span className="material-symbols-outlined text-4xl opacity-20 mb-2">check_circle</span>
                  <p className="text-xs font-bold tracking-tight">Tất cả chỉ số đang ổn định</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (Bento blocks) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard
              icon="description"
              label="Kê đơn thuốc"
              desc="Tạo đơn thuốc số"
              color="primary"
              onClick={() => setIsPrescriptionModalOpen(true)}
            />
            <ActionCard
              icon="send"
              label="Gửi tư vấn"
              desc="Can thiệp từ xa"
              color="primary"
              onClick={() => setIsAdviceModalOpen(true)}
            />
            <ActionCard
              icon="event_note"
              label="Lịch tái khám"
              desc="Quản lý lịch hẹn"
              color="primary"
              onClick={() => setIsAppointmentModalOpen(true)}
            />
          </div>
        </section>

        {/* Sidebar Section */}
        <aside className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm flex flex-col h-full">
            <div className="mb-6">
              <h3 className="text-xl font-bold">Lịch hôm nay</h3>
              <p className="text-xs text-slate-500">Tiến độ phiên khám bệnh</p>
            </div>
            <div className="space-y-1 flex-1">
              {displayAppointments.length > 0 ? (
                displayAppointments.slice(0, 6).map((apt: any, i: number) => (
                  <AppointmentRow key={i} apt={apt} onClick={() => navigate('/scheduling')} />
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 italic text-sm">Chưa có lịch hẹn mới</div>
              )}
            </div>
            <button
              onClick={() => navigate('/scheduling')}
              className="mt-6 w-full py-3.5 bg-slate-900 dark:bg-primary text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md active:scale-[0.98]"
            >
              Xem toàn bộ lịch trình
            </button>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <PrescriptionModal isOpen={isPrescriptionModalOpen} onClose={() => setIsPrescriptionModalOpen(false)} />
      <AdviceModal isOpen={isAdviceModalOpen} onClose={() => setIsAdviceModalOpen(false)} />
      <AppointmentModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} />
    </div>
  )
}

function StatCard({ icon, label, value, trend, progress, badge, subText, isAlert, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm transition-all cursor-pointer hover:shadow-md ${isAlert ? 'border-l-4 border-l-red-500' : ''}`}
    >
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

function RiskRow({ risk, onClick }: any) {
  const isCritical = risk.riskLevel === 'CRITICAL'
  return (
    <div
      onClick={onClick}
      className="p-4 bg-background-light dark:bg-slate-800/50 rounded-xl border border-primary/5 hover:border-primary/20 transition-all flex items-center justify-between group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border border-primary/10">
          {risk.patientAvatar ? <img src={risk.patientAvatar} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary text-xl">person</span>}
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{risk.patientName}</h4>
          <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">{risk.reason}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isCritical ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'}`}>
          {isCritical ? 'Nguy cấp' : 'Cần theo dõi'}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all" />
      </div>
    </div>
  )
}

function ActionCard({ icon, label, desc, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm text-left transition-all hover:shadow-md hover:border-primary/20 group"
    >
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{label}</h4>
      <p className="text-[10px] text-slate-400 font-medium tracking-tight">{desc}</p>
    </button>
  )
}

function AppointmentRow({ apt, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 hover:bg-primary/5 rounded-xl transition-all cursor-pointer group border-b border-primary/5 last:border-0"
    >
      <div className="text-center w-12 flex-shrink-0">
        <p className="text-[14px] font-extrabold text-primary leading-none uppercase">{apt.startTime?.slice(0, 5) || '09:00'}</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{apt.patientName}</h5>
        <p className="text-[10px] text-slate-500 font-medium uppercase truncate tracking-wider">
          {apt.appointmentType || 'Khám định kỳ'}
        </p>
      </div>
      {apt.status === 'ARRIVED' && (
        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse" />
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}
