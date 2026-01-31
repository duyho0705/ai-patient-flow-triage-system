import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getPatient, findPatientByCccd } from '@/api/patients'
import { suggestAcuity, createTriageSession } from '@/api/triage'
import { getQueueDefinitions, addQueueEntry } from '@/api/queues'
import type { PatientDto, VitalItem, ComplaintItem, QueueDefinitionDto, TriageSessionDto } from '@/types/api'

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
  const [overrideReason, setOverrideReason] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [triageResultSession, setTriageResultSession] = useState<TriageSessionDto | null>(null)

  const { data: queueDefinitions } = useQuery({
    queryKey: ['queue-definitions', branchId, headers?.tenantId],
    queryFn: () => getQueueDefinitions(branchId!, headers),
    enabled: !!branchId && !!headers?.tenantId,
  })

  const addToQueue = useMutation({
    mutationFn: (queueId: string) => {
      if (!triageResultSession) throw new Error('Chưa có phiên phân loại')
      return addQueueEntry({ queueDefinitionId: queueId, patientId, triageSessionId: triageResultSession.id }, headers)
    },
    onSuccess: () => {
      setSuccess('Đã thêm vào hàng chờ thành công.')
      setTriageResultSession(null)
      // Reset form
      setPatientId('')
      setCccdSearch('')
      setChiefComplaint('')
      setVitals([])
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (e: Error) => setError(e.message),
  })

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
          overrideReason: overrideReason.trim() || undefined,
        },
        headers
      )
    },
    onSuccess: (data) => {
      setSuccess('Đã tạo phiên phân loại. Chọn hàng chờ để chuyển bệnh nhân vào.')
      setTriageResultSession(data)
      queryClient.invalidateQueries({ queryKey: ['triage'] })
      // Don't auto-clear success immediately
    },
    onError: (e: Error) => setError(e.message),
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="page-header">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Phân loại ưu tiên</h1>
        <p className="mt-1 text-sm text-slate-600">Tìm bệnh nhân, nhập lý do khám và sinh hiệu, gợi ý AI mức ưu tiên 1–5.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}

      {/* Chọn bệnh nhân */}
      <section className="card max-w-2xl">
        <h2 className="section-title mb-4">Bệnh nhân</h2>
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
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <p className="font-semibold text-slate-900">{patient.fullNameVi}</p>
            <p className="mt-1 text-sm text-slate-600">
              {patient.dateOfBirth} · {patient.phone || '—'}
            </p>
          </div>
        )}
      </section>

      {patientId && (
        <>
          {/* Kết quả phân loại & Chuyển hàng chờ */}
          {triageResultSession ? (
            <section className="card max-w-2xl bg-blue-50 border-blue-100">
              <h2 className="section-title mb-4 text-blue-900">Hoàn tất phân loại</h2>
              <div className="mb-4 text-sm text-blue-800">
                <p>Mức ưu tiên: <strong>{triageResultSession.acuityLevel}</strong></p>
                <p>Gợi ý AI: {triageResultSession.aiSuggestedAcuity ?? '—'} (tin cậy: {triageResultSession.aiConfidenceScore})</p>
              </div>
              <h3 className="mb-3 font-semibold text-blue-900">Chuyển bệnh nhân vào hàng chờ:</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {queueDefinitions?.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => addToQueue.mutate(q.id)}
                    disabled={addToQueue.isPending}
                    className="flex items-center justify-between rounded-lg border border-blue-200 bg-white p-3 hover:bg-blue-100 disabled:opacity-50"
                  >
                    <span className="font-medium text-slate-900">{q.nameVi}</span>
                    <span className="text-xs text-slate-500">
                      {addToQueue.isPending ? '...' : 'Chọn'}
                    </span>
                  </button>
                ))}
              </div>
              {!queueDefinitions?.length && (
                <p className="text-sm text-slate-500">Chưa có hàng chờ nào được cấu hình.</p>
              )}
            </section>
          ) : (
            <>
              {/* Lý do khám + AI gợi ý */}
              <section className="card max-w-2xl">
                <h2 className="section-title mb-4">Lý do đến khám / Triệu chứng</h2>
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
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={runSuggest} className="btn-secondary rounded-lg">
                    Gợi ý mức ưu tiên (AI)
                  </button>
                  {suggestion && (
                    <span className="text-sm text-slate-600">
                      Gợi ý: <strong className="text-slate-900">{suggestion.suggestedAcuity}</strong> (độ tin cậy {suggestion.confidence}, {suggestion.latencyMs}ms)
                    </span>
                  )}
                </div>
              </section>

              {/* Sinh hiệu */}
              <section className="card max-w-2xl">
                <h2 className="section-title mb-4">Sinh hiệu (tùy chọn)</h2>
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
              </section>

              {/* Mức ưu tiên + Ghi chú + Tạo phiên */}
              <section className="card max-w-2xl">
                <h2 className="section-title mb-4">Mức ưu tiên & Ghi chú</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Mức độ ưu tiên (ESI 1–5)</label>
                    <select
                      className="input w-32 rounded-lg"
                      value={acuityLevel}
                      onChange={(e) => setAcuityLevel(e.target.value)}
                    >
                      {ACUITY_LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Lý do override (khi không chấp nhận gợi ý AI)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ghi lý do nếu bạn thay đổi mức ưu tiên so với AI"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
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
                    className="btn-success rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:ring-emerald-500"
                  >
                    {createSession.isPending ? 'Đang tạo...' : 'Tạo phiên phân loại'}
                  </button>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  )
}
