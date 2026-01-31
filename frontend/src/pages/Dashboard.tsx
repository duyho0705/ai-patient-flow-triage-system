import { Link } from 'react-router-dom'
import { useRole } from '@/context/RoleContext'
import type { Role } from '@/context/RoleContext'

/** Cấu hình dashboard theo role — khớp spec thực tế phòng khám VN */
const ROLE_CONFIG: Record<
  Role,
  { title: string; subtitle: string; actions: { to: string; label: string; desc: string }[] }
> = {
  admin: {
    title: 'Admin – Quản trị hệ thống',
    subtitle: 'Quản lý tenant, người dùng, phân quyền, cấu hình, AI audit. Không đụng bệnh nhân.',
    actions: [
      { to: '/reports', label: 'Báo cáo / Dữ liệu', desc: 'Xem báo cáo tổng hợp (wait time, volume, AI)' },
      { to: '/ai-audit', label: 'AI Audit', desc: 'Xem lịch sử AI, so sánh đề xuất vs quyết định (sẽ có)' },
      { to: '/queue', label: 'Cấu hình hàng chờ', desc: 'Quản lý queue theo chi nhánh (sẽ có)' },
    ],
  },
  receptionist: {
    title: 'Lễ tân (Receptionist)',
    subtitle: 'Tiếp nhận bệnh nhân, đặt lịch / check-in, walk-in. Gửi sang y tá phân loại. Không quyết định ưu tiên.',
    actions: [
      { to: '/patients', label: 'Tiếp nhận bệnh nhân', desc: 'Tìm CCCD/SĐT, tạo mới, đặt lịch, check-in, walk-in' },
      { to: '/queue', label: 'Luồng bệnh nhân', desc: 'Xem trạng thái: đã chờ, đang phân loại, đang khám' },
    ],
  },
  triage_nurse: {
    title: 'Y tá phân loại (Triage Nurse)',
    subtitle: 'Thu thập lý do khám + sinh hiệu. AI gợi ý mức nguy cấp. Chấp nhận hoặc override, đưa vào hàng theo ưu tiên.',
    actions: [
      { to: '/triage', label: 'Phân loại', desc: 'Lý do khám, sinh hiệu, AI gợi ý acuity, override, đưa vào hàng' },
      { to: '/patients', label: 'Bệnh nhân', desc: 'Tìm bệnh nhân theo CCCD trước khi phân loại' },
      { to: '/queue', label: 'Hàng chờ', desc: 'Thêm bệnh nhân vào hàng theo mức ưu tiên (không FIFO)' },
    ],
  },
  doctor: {
    title: 'Bác sĩ (Doctor)',
    subtitle: 'Danh sách chờ theo mức nguy cấp + thời gian. Xem trước hồ sơ, khám, ghi chẩn đoán/chỉ định.',
    actions: [
      { to: '/queue', label: 'Danh sách chờ khám', desc: 'Sắp xếp theo acuity + thời gian chờ, gọi số' },
      { to: '/patients', label: 'Hồ sơ bệnh nhân', desc: 'Xem lý do khám, sinh hiệu, kết quả AI triage' },
    ],
  },
  clinic_manager: {
    title: 'Quản lý vận hành (Clinic Manager)',
    subtitle: 'Báo cáo thời gian chờ, số bệnh nhân/ngày. So sánh trước/sau AI. Đánh giá hiệu quả nhân sự.',
    actions: [
      { to: '/reports', label: 'Báo cáo hoạt động', desc: 'Số bệnh nhân/ngày, thời gian chờ, hiệu quả AI' },
      { to: '/reports?tab=wait-time', label: 'Thời gian chờ', desc: 'Chi tiết thời gian chờ trung bình' },
    ],
  },
}

export function Dashboard() {
  const { role } = useRole()
  const config = ROLE_CONFIG[role]

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {config.title}
        </h1>
        <p className="mt-2 text-slate-600">
          {config.subtitle}
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Thao tác nhanh
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.actions.map((a) => (
            <li key={a.to}>
              <Link
                to={a.to}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <span className="font-semibold text-slate-900">{a.label}</span>
                <span className="mt-1 text-sm text-slate-600">{a.desc}</span>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-teal-700">
                  Mở
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-slate-500">
        Chọn vai trò khác ở góc phải trên nếu bạn đang đảm nhiệm vai trò khác.
      </p>
    </div>
  )
}
