import { useRole } from '@/context/RoleContext'
import { CustomSelect } from './CustomSelect'
import { Shield } from 'lucide-react'

export function RoleSelect() {
  const { role, setRole, roles } = useRole()

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vai trò</span>
      <CustomSelect
        options={roles}
        value={role}
        onChange={(val) => setRole(val as any)}
        labelKey="label"
        valueKey="value"
        placeholder="Chọn vai trò"
        size="sm"
        className="w-56"
        icon={<Shield className="w-3.5 h-3.5" />}
      />
    </div>
  )
}
