import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getPatient, findPatientByCccd } from '@/api/patients'
import { suggestAcuity, createTriageSession } from '@/api/triage'
import type { PatientDto, VitalItem, ComplaintItem } from '@/types/api'

const ACUITY_LEVELS = ['1', '2', '3', '4', '5'] as const
const VITAL_TYPES = ['TEMPERATURE', 'HEART_RATE', 'BLOOD_PRESSURE_SYSTOLIC', 'BLOOD_PRESSURE_DIASTOLIC', 'RESPIRATORY_RATE', 'SPO2'] as const

export function Triage() {
  const { headers, branchId } = useTenant()
  const queryClient = useQueryClient()
  const [patientId, setPatientId] = useState('')
  const [cccdSearch, setCccdSearch] = useState('')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [acuityLevel, setAcuityLevel] = useState<string>('3')
  const [useAi, setUseAi] = useState(true)
  const [suggestion, setSuggestion] = useState<{ suggestedAcuity: string; confidence: number; latencyMs: number } | null>(null)
  const [vitals, setVitals] = useState<{ type: string; value: string; unit: string }[]>([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId, headers),
    enabled: !!patientId && !!headers?.tenantId,
  })

  const searchByCccd = async () => {
    if (!cccdSearch.trim() || !headers) return
    setError('')
    const p = await findPatientByCccd(cccdSearch.trim(), headers)
    if (p) {
      setPatientId(p.id)
    } else {
      setError('Không tìm thấy bệnh nhân với CCCD này.')
    }
  }

  const runSuggest = async () => {
    if (!headers?.tenantId) return
    setError('')
    setSuggestion(null)
    try {
      const age = patient?.dateOfBirth
        ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
        : undefined
      const res = await suggestAcuity(
        {
          chiefComplaintText: chiefComplaint.trim() || undefined,
          patientId: patientId || undefined,
          ageInYears: age,
          vitals: vitals
            .filter((v) => v.value)
            .map((v) => ({
              vitalType: v.type,
              valueNumeric: parseFloat(v.value),
              unit: v.unit || undefined,
            })),
        },
        headers
      )
      setSuggestion({
        suggestedAcuity: res.suggestedAcuity,
        confidence: res.confidence,
        latencyMs: res.latencyMs,
      })
      setAcuityLevel(res.suggestedAcuity)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi gợi ý AI')
    }
  }

  const createSession = useMutation({
    mutationFn: () => {
      if (!headers?.tenantId || !branchId || !patientId) throw new Error('Thiếu tenant/chi nhánh/bệnh nhân')
      const vitalItems: VitalItem[] = vitals
        .filter((v) => v.value)
        .map((v) => ({
          vitalType: v.type,
          valueNumeric: parseFloat(v.value),
          unit: v.unit || undefined,
          recordedAt: new Date().toISOString(),
        }))
      const complaints: ComplaintItem[] = chiefComplaint.trim()
        ? [{ complaintType: 'CHIEF', complaintText: chiefComplaint.trim(), displayOrder: 0 }]
        : []
      return createTriageSession(
        {
          branchId,
          patientId,
          startedAt: new Date().toISOString(),
          acuityLevel,
          useAiSuggestion: useAi,
          chiefComplaintText: chiefComplaint.trim() || undefined,
          vitals: vitalItems.length ? vitalItems : undefined,
          complaints: complaints.length ? complaints : undefined,
          notes: notes.trim() || undefined,
        },
        headers
      )
    },
    onSuccess: () => {
      setSuccess('Đã tạo phiên phân loại.')
      queryClient.invalidateQueries({ queryKey: ['triage'] })
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (e: Error) => setError(e.message),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Phân loại ưu tiên (Triage)</h1>

      {error && <div className="card border-red-200 bg-red-50 text-red-700">{error}</div>}
      {success && <div className="card border-green-200 bg-green-50 text-green-700">{success}</div>}

      {/* Chọn bệnh nhân */}
      <div className="card max-w-xl">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Bệnh nhân</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập CCCD để tìm"
            value={cccdSearch}
            onChange={(e) => setCccdSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchByCccd()}
            className="input flex-1"
          />
          <button type="button" onClick={searchByCccd} className="btn-primary">
            Tìm
          </button>
        </div>
        {patient && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="font-medium">{patient.fullNameVi}</p>
            <p className="text-sm text-slate-600">
              {patient.dateOfBirth} · {patient.phone || '—'}
            </p>
          </div>
        )}
      </div>

      {patientId && (
        <>
          {/* Lý do khám + AI gợi ý */}
          <div className="card max-w-2xl">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Lý do đến khám / Triệu chứng</h3>
            <textarea
              className="input min-h-[80px]"
              placeholder="Nhập lý do khám (tiếng Việt hoặc tiếng Anh)..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
            />
            <label className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={useAi}
                onChange={(e) => setUseAi(e.target.checked)}
              />
              <span className="text-sm">Dùng gợi ý AI (rule-based)</span>
            </label>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={runSuggest} className="btn-secondary">
                Gợi ý mức ưu tiên (AI)
              </button>
              {suggestion && (
                <span className="text-sm text-slate-600 self-center">
                  Gợi ý: <strong>{suggestion.suggestedAcuity}</strong> (độ tin cậy {suggestion.confidence}, {suggestion.latencyMs}ms)
                </span>
              )}
            </div>
          </div>

          {/* Sinh hiệu */}
          <div className="card max-w-2xl">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Sinh hiệu (tùy chọn)</h3>
            <div className="space-y-2">
              {VITAL_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="w-48 text-sm">{type}</span>
                  <input
                    type="text"
                    placeholder="Giá trị"
                    className="input w-24"
                    value={vitals.find((v) => v.type === type)?.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setVitals((prev) => {
                        const rest = prev.filter((v) => v.type !== type)
                        if (!val) return rest
                        return [...rest, { type, value: val, unit: '' }]
                      })
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Đơn vị"
                    className="input w-20"
                    value={vitals.find((v) => v.type === type)?.unit ?? ''}
                    onChange={(e) => {
                      const unit = e.target.value
                      setVitals((prev) => {
                        const existing = prev.find((v) => v.type === type)
                        if (existing) return prev.map((v) => (v.type === type ? { ...v, unit } : v))
                        return [...prev, { type, value: '', unit }]
                      })
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mức ưu tiên + Ghi chú + Tạo phiên */}
          <div className="card max-w-2xl">
            <div className="space-y-3">
              <div>
                <label className="label">Mức độ ưu tiên (ESI 1–5)</label>
                <select
                  className="input w-32"
                  value={acuityLevel}
                  onChange={(e) => setAcuityLevel(e.target.value)}
                >
                  {ACUITY_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Ghi chú</label>
                <input
                  type="text"
                  className="input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => createSession.mutate()}
                disabled={createSession.isPending}
                className="btn-success"
              >
                {createSession.isPending ? 'Đang tạo...' : 'Tạo phiên phân loại'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
