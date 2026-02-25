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
  Calendar,
  MessageSquare,
  Settings,
} from 'lucide-react'

export type StaffNavItem = {
  to?: string
  label: string
  icon?: LucideIcon
  roles?: Role[]
  badge?: number
  type?: 'link' | 'header'
}

/** Cấu hình menu staff - Cập nhật giống 100% Dashboard.html cho role Quản lý */
export const STAFF_NAV: StaffNavItem[] = [
  // SECTION: CHÍNH
  { label: 'Chính', type: 'header', roles: ['clinic_manager', 'admin'] },
  { to: '/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, type: 'link' },
  { to: '/admin/doctors', label: 'Quản lý Bác sĩ', icon: Users, roles: ['clinic_manager', 'admin'], type: 'link' },
  { to: '/admin/allocation', label: 'Phân bổ Bệnh nhân', icon: UserPlus, roles: ['clinic_manager', 'admin'], type: 'link' },

  // Role doctor & receptionist items
  { to: '/patients', label: 'Danh sách bệnh nhân', icon: Users, roles: ['doctor', 'receptionist'], type: 'link' },
  { to: '/scheduling', label: 'Lịch hẹn', icon: Calendar, roles: ['doctor', 'receptionist', 'admin'], type: 'link' },
  { to: '/prescriptions', label: 'Toa thuốc', icon: ClipboardList, roles: ['doctor', 'admin'], type: 'link' },
  { to: '/chat', label: 'Tin nhắn', icon: MessageSquare, roles: ['doctor', 'admin'], badge: 3, type: 'link' },

  // SECTION: DỮ LIỆU & BÁO CÁO
  { label: 'Dữ liệu & Báo cáo', type: 'header', roles: ['clinic_manager', 'admin'] },
  { to: '/reports/finance', label: 'Báo cáo tài chính', icon: BarChart3, roles: ['clinic_manager', 'admin'], type: 'link' },
  { to: '/reports/monthly', label: 'Báo cáo hàng tháng', icon: FileText, roles: ['clinic_manager', 'admin'], type: 'link' },
  { to: '/reports/performance', label: 'Hiệu suất bác sĩ', icon: Activity, roles: ['clinic_manager', 'admin'], type: 'link' },

  // Admin section
  { label: 'Hệ thống', type: 'header', roles: ['admin'] },
  { to: '/admin', label: 'Cấu hình hệ thống', icon: Settings, roles: ['admin'], type: 'link' },
]
