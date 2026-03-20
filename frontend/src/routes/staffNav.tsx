import type { LucideIcon } from 'lucide-react'
import type { Role } from '@/context/RoleContext'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  FileText,
  Activity,
  ClipboardList,
  MessageSquare,
  Settings,
  Stethoscope,
  Calendar,
  Cpu,
  Shield
} from 'lucide-react'

export type StaffNavItem = {
  to?: string
  label: string
  icon?: LucideIcon
  roles?: Role[]
  badge?: number
  type?: 'link' | 'header'
}

/** Cấu hình menu staff - Chronic Disease Management */
export const STAFF_NAV: StaffNavItem[] = [
  // SECTION: TỔNG QUAN

  // SECTION: LÂM SÀNG (Doctor Only)
  { label: 'Chuyên môn', type: 'header', roles: ['doctor'] },
  { to: '/patients', label: 'Danh sách bệnh nhân', icon: Users, roles: ['doctor'], type: 'link' },
  { to: '/analytics', label: 'Phân tích nguy cơ', icon: Activity, roles: ['doctor'], type: 'link' },
  { to: '/prescriptions', label: 'Đơn thuốc điện tử', icon: ClipboardList, roles: ['doctor'], type: 'link' },
  { to: '/scheduling', label: 'Lịch hẹn khám', icon: Calendar, roles: ['doctor'], type: 'link' },
  { to: '/chat', label: 'Tin nhắn', icon: MessageSquare, roles: ['doctor'], type: 'link' },

  // SECTION: QUẢN LÝ (Clinic Manager Only)
  { label: 'Quản lý Phòng khám', type: 'header', roles: ['clinic_manager'] },
  { to: '/patients', label: 'Bệnh nhân & Chỉ số', icon: Users, roles: ['clinic_manager'], type: 'link' },
  { to: '/analytics', label: 'Thống kê nguy cơ', icon: Activity, roles: ['clinic_manager'], type: 'link' },
  { to: '/admin/doctors', label: 'Quản lý Bác sĩ', icon: Stethoscope, roles: ['clinic_manager'], type: 'link' },
  { to: '/admin/allocation', label: 'Phân bổ phụ trách', icon: UserPlus, roles: ['clinic_manager'], type: 'link' },
  { to: '/reports/performance', label: 'Hiệu suất điều trị', icon: BarChart3, roles: ['clinic_manager'], type: 'link' },
  { to: '/reports/finance', label: 'Thống kê doanh thu', icon: FileText, roles: ['clinic_manager'], type: 'link' },

  // SECTION: QUẢN TRỊ (Admin Only)

  { to: '/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, type: 'link', roles: ['admin'] },
  { to: '/admin/tenants', label: 'Quản lý Phòng khám', icon: ClipboardList, roles: ['admin'], type: 'link' },
  { to: '/admin/users', label: 'Người dùng', icon: Users, roles: ['admin'], type: 'link' },
  { to: '/admin/audit-logs', label: 'Nhật ký hệ thống', icon: ClipboardList, roles: ['admin'], type: 'link' },
  { to: '/admin/ai-config', label: 'Cấu hình AI', icon: Cpu, roles: ['admin'], type: 'link' },
  { to: '/admin/settings', label: 'Cài đặt hệ thống', icon: Settings, roles: ['admin'], type: 'link' },
]
