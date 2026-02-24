import { useState, useEffect } from 'react'
import { useTenant } from '@/context/TenantContext'
import { getTenant, getTenantByCode, getBranches } from '@/api/tenants'
import type { TenantDto, TenantBranchDto } from '@/types/api'
import { CustomSelect } from './CustomSelect'
import { MapPin, Building, RotateCcw, Search } from 'lucide-react'

type Props = { className?: string }

export function TenantSelect({ className = '' }: Props) {
  const { tenantId, branchId, setTenant } = useTenant()
  const [tenant, setTenantData] = useState<TenantDto | null>(null)
  const [branches, setBranches] = useState<TenantBranchDto[]>([])
  const [tenantCode, setTenantCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tenantId) {
      setTenantData(null)
      setBranches([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([getTenant(tenantId), getBranches(tenantId)])
      .then(([t, b]) => {
        if (!cancelled) {
          setTenantData(t)
          setBranches(b)
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Lỗi tải tenant')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [tenantId])

  const loadByCode = () => {
    if (!tenantCode.trim()) return
    setLoading(true)
    setError('')
    getTenantByCode(tenantCode.trim())
      .then((t) => {
        setTenant(t.id, null)
        setTenantData(t)
        return getBranches(t.id)
      })
      .then(setBranches)
      .catch((e) => setError(e.message || 'Không tìm thấy tenant'))
      .finally(() => setLoading(false))
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {!tenantId ? (
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2b8cee] transition-colors" />
            <input
              type="text"
              placeholder="Mã phòng khám..."
              value={tenantCode}
              onChange={(e) => setTenantCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadByCode()}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-4 focus:ring-[#2b8cee]/10 focus:border-[#2b8cee] outline-none transition-all w-48"
            />
          </div>
          <button
            type="button"
            onClick={loadByCode}
            disabled={loading}
            className="bg-[#2b8cee] text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-[#2b8cee]/90 transition-all disabled:opacity-50"
          >
            {loading ? '...' : 'Chọn'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              {tenant?.nameVi || 'Cơ sở'}
            </span>
            <button
              type="button"
              onClick={() => setTenant(null, null)}
              title="Đổi phòng khám"
              className="ml-1 p-0.5 text-slate-400 hover:text-red-500 hover:bg-white rounded transition-all"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <CustomSelect
            options={branches}
            value={branchId || ''}
            onChange={(val) => setTenant(tenantId, val || null)}
            labelKey="nameVi"
            valueKey="id"
            placeholder="Chọn chi nhánh"
            size="sm"
            className="w-48"
            icon={<MapPin className="w-3.5 h-3.5" />}
          />
        </div>
      )}
      {error && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 animate-pulse">{error}</span>}
    </div>
  )
}
