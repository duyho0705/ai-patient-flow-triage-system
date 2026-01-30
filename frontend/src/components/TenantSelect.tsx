import { useState, useEffect } from 'react'
import { useTenant } from '@/context/TenantContext'
import { getTenant, getTenantByCode, getBranches } from '@/api/tenants'
import type { TenantDto, TenantBranchDto } from '@/types/api'

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
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {!tenantId ? (
        <>
          <input
            type="text"
            placeholder="Mã tenant (VD: CLINIC01)"
            value={tenantCode}
            onChange={(e) => setTenantCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadByCode()}
            className="input w-40"
          />
          <button type="button" onClick={loadByCode} className="btn-primary" disabled={loading}>
            {loading ? 'Đang tải...' : 'Chọn tenant'}
          </button>
        </>
      ) : (
        <>
          <span className="text-sm text-slate-600">
            {tenant?.nameVi || tenantId.slice(0, 8)}
          </span>
          <select
            value={branchId || ''}
            onChange={(e) => setTenant(tenantId, e.target.value || null)}
            className="input w-48"
          >
            <option value="">-- Chi nhánh --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameVi}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setTenant(null, null)}
            className="btn-secondary text-xs"
          >
            Đổi tenant
          </button>
        </>
      )}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
