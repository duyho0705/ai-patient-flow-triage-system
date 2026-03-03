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
  Calendar
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

  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard, type: 'link', roles: ['clinic_manager', 'admin', 'doctor'] },
  { to: '/patients', label: 'Danh sách bệnh nhân', icon: Users, roles: ['doctor', 'clinic_manager', 'admin'], type: 'link' },
  { to: '/analytics', label: 'Phân tích nguy cơ', icon: Activity, roles: ['doctor', 'clinic_manager', 'admin'], type: 'link' },
  { to: '/prescriptions', label: 'Toa thuốc', icon: ClipboardList, roles: ['doctor', 'admin'], type: 'link' },
  { to: '/scheduling', label: 'Lịch hẹn khám', icon: Calendar, roles: ['doctor', 'admin'], type: 'link' },
  { to: '/chat', label: 'Tin nhắn', icon: MessageSquare, roles: ['doctor', 'admin'], badge: 3, type: 'link' },

  // SECTION: PHÂN TÍCH & BÁO CÁO (Clinic Manager & Admin)
  { label: 'Quản lý CDM', type: 'header', roles: ['clinic_manager', 'admin'] },

  { to: '/reports/performance', label: 'Hiệu suất điều trị', icon: BarChart3, roles: ['clinic_manager', 'admin'], type: 'link' },
  { to: '/reports/finance', label: 'Thống kê doanh thu', icon: FileText, roles: ['clinic_manager', 'admin'], type: 'link' },

  // SECTION: QUẢN TRỊ (Admin Only)
  { label: 'Hệ thống', type: 'header', roles: ['admin'] },
  { to: '/admin/doctors', label: 'Quản lý Bác sĩ', icon: Stethoscope, roles: ['admin'], type: 'link' },
  { to: '/admin/allocation', label: 'Phân bổ phụ trách', icon: UserPlus, roles: ['admin'], type: 'link' },
  { to: '/admin/config', label: 'Cấu hình AI', icon: Settings, roles: ['admin'], type: 'link' },
]
