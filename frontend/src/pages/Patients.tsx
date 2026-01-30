import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { listPatients, findPatientByCccd, createPatient, updatePatient } from '@/api/patients'
import type { PatientDto, CreatePatientRequest } from '@/types/api'

function PatientForm({
  initial,
  onSuccess,
  onCancel,
}: {
  initial?: PatientDto | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const { headers } = useTenant()
  const [form, setForm] = useState<CreatePatientRequest>({
    fullNameVi: initial?.fullNameVi ?? '',
    dateOfBirth: initial?.dateOfBirth ?? '',
    cccd: initial?.cccd ?? '',
    externalId: initial?.externalId ?? '',
    gender: initial?.gender ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    addressLine: initial?.addressLine ?? '',
    city: initial?.city ?? '',
    district: initial?.district ?? '',
    ward: initial?.ward ?? '',
    nationality: initial?.nationality ?? '',
    ethnicity: initial?.ethnicity ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (initial?.id) {
        await updatePatient(initial.id, form, headers)
      } else {
        await createPatient(form, headers)
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi lưu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 max-w-xl">
      <h3 className="text-lg font-semibold">{initial?.id ? 'Cập nhật bệnh nhân' : 'Đăng ký bệnh nhân mới'}</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Họ tên *</label>
          <input
            className="input"
            value={form.fullNameVi}
            onChange={(e) => setForm((f) => ({ ...f, fullNameVi: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Ngày sinh *</label>
          <input
            type="date"
            className="input"
            value={form.dateOfBirth}
            onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">CCCD</label>
          <input
            className="input"
            value={form.cccd ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, cccd: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">Giới tính</label>
          <select
            className="input"
            value={form.gender ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
          >
            <option value="">--</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
        <div>
          <label className="label">SĐT</label>
          <input
            className="input"
            value={form.phone ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={form.email ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Địa chỉ</label>
          <input
            className="input"
            value={form.addressLine ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Đang lưu...' : initial?.id ? 'Cập nhật' : 'Đăng ký'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Hủy
        </button>
      </div>
    </form>
  )
}

export function Patients() {
  const { headers } = useTenant()
  const [page, setPage] = useState(0)
  const [cccdSearch, setCccdSearch] = useState('')
  const [foundPatient, setFoundPatient] = useState<PatientDto | null | 'none'>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<PatientDto | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['patients', headers?.tenantId, page],
    queryFn: () => listPatients({ page, size: 10 }, headers),
    enabled: !!headers?.tenantId,
  })

  const searchCccd = async () => {
    if (!cccdSearch.trim() || !headers) return
    setFoundPatient(null)
    const p = await findPatientByCccd(cccdSearch.trim(), headers)
    setFoundPatient(p ?? 'none')
    if (p) setEditingPatient(p)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý bệnh nhân</h1>
        <button
          type="button"
          onClick={() => {
            setShowForm(true)
            setEditingPatient(null)
            setFoundPatient(null)
          }}
          className="btn-primary"
        >
          + Đăng ký bệnh nhân mới
        </button>
      </div>

      {/* Tìm theo CCCD */}
      <div className="card max-w-xl">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Tìm theo CCCD</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập số CCCD"
            value={cccdSearch}
            onChange={(e) => setCccdSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCccd()}
            className="input flex-1"
          />
          <button type="button" onClick={searchCccd} className="btn-primary">
            Tìm
          </button>
        </div>
        {foundPatient === 'none' && (
          <p className="mt-2 text-sm text-slate-600">Không tìm thấy. Có thể đăng ký mới.</p>
        )}
        {foundPatient && foundPatient !== 'none' && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="font-medium">{foundPatient.fullNameVi}</p>
            <p className="text-sm text-slate-600">
              {foundPatient.dateOfBirth} · {foundPatient.cccd || '—'} · {foundPatient.phone || '—'}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingPatient(foundPatient)
                setShowForm(true)
              }}
              className="btn-secondary mt-2 text-sm"
            >
              Cập nhật thông tin
            </button>
          </div>
        )}
      </div>

      {/* Form đăng ký / cập nhật */}
      {showForm && (
        <PatientForm
          initial={editingPatient}
          onSuccess={() => {
            setShowForm(false)
            setEditingPatient(null)
            refetch()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingPatient(null)
          }}
        />
      )}

      {/* Danh sách phân trang */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Danh sách bệnh nhân</h3>
        {isLoading ? (
          <p className="text-slate-500">Đang tải...</p>
        ) : data?.content?.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-medium">Họ tên</th>
                    <th className="text-left py-2 font-medium">Ngày sinh</th>
                    <th className="text-left py-2 font-medium">CCCD</th>
                    <th className="text-left py-2 font-medium">SĐT</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2">{p.fullNameVi}</td>
                      <td className="py-2">{p.dateOfBirth}</td>
                      <td className="py-2">{p.cccd || '—'}</td>
                      <td className="py-2">{p.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((x) => Math.max(0, x - 1))}
                disabled={data.first}
                className="btn-secondary text-xs"
              >
                Trước
              </button>
              <span className="text-sm text-slate-600">
                Trang {data.page + 1} / {data.totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => setPage((x) => x + 1)}
                disabled={data.last}
                className="btn-secondary text-xs"
              >
                Sau
              </button>
            </div>
          </>
        ) : (
          <p className="text-slate-500">Chưa có bệnh nhân nào.</p>
        )}
      </div>
    </div>
  )
}
