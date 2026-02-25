import type { LucideIcon } from 'lucide-react'
import type { Role } from '@/context/RoleContext'
import {
  LayoutDashboard,
  Users,
  Activity,
  ClipboardList,
  Calendar,
  MessageSquare,
  Settings,
  FileText,
} from 'lucide-react'

export type StaffNavItem = {
  to: string
  label: string
  icon: LucideIcon
  roles?: Role[]
  badge?: number
}

/** Cấu hình menu staff - Cập nhật theo thiết kế Dashboard.html */
export const STAFF_NAV: StaffNavItem[] = [
  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/patients', label: 'Danh sách bệnh nhân', icon: Users, roles: ['doctor', 'receptionist', 'admin'] },
  { to: '/analytics', label: 'Phân tích nguy cơ', icon: Activity, roles: ['doctor', 'clinic_manager', 'admin'] },
  { to: '/prescriptions', label: 'Toa thuốc', icon: ClipboardList, roles: ['doctor', 'admin'] },
  { to: '/scheduling', label: 'Lịch hẹn', icon: Calendar, roles: ['doctor', 'receptionist', 'admin'] },
  { to: '/chat', label: 'Tin nhắn', icon: MessageSquare, roles: ['doctor', 'admin'], badge: 3 },
  { to: '/reports', label: 'Báo cáo', icon: FileText, roles: ['clinic_manager', 'admin'] },
  { to: '/admin', label: 'Cấu hình hệ thống', icon: Settings, roles: ['admin'] },
]
