import type { LucideIcon } from 'lucide-react'
import type { Role } from '@/context/RoleContext'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  BarChart2,
  FileText,
  Calendar,
  Settings,
  MessageSquare,
} from 'lucide-react'

export type StaffNavItem = {
  to: string
  label: string
  icon: LucideIcon
  roles?: Role[]
}

/** Cấu hình menu staff - nguồn sự thật duy nhất cho path, label, icon và roles */
export const STAFF_NAV: StaffNavItem[] = [
  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/reception', label: 'Tiếp nhận', icon: Users, roles: ['receptionist', 'admin'] },
  { to: '/consultation', label: 'Khám & Điều trị', icon: Stethoscope, roles: ['doctor', 'admin'] },
  { to: '/scheduling', label: 'Lịch hẹn', icon: Calendar, roles: ['doctor', 'receptionist', 'admin'] },
  { to: '/chat', label: 'Tư vấn từ xa', icon: MessageSquare, roles: ['doctor', 'admin'] },
  { to: '/reports', label: 'Báo cáo', icon: FileText, roles: ['clinic_manager', 'admin'] },
  { to: '/analytics', label: 'Thống kê', icon: BarChart2, roles: ['clinic_manager', 'admin'] },
  { to: '/admin', label: 'Quản trị', icon: Settings, roles: ['admin'] },
]
