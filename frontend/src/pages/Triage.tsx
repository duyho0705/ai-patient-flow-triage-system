import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getPatient, findPatientByCccd } from '@/api/patients'
import { suggestAcuity, createTriageSession } from '@/api/triage'
import type { VitalItem, ComplaintItem } from '@/types/api'
import { toastService } from '@/services/toast'

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
  const [suggestion, setSuggestion] = useState<{ suggestedAcuity: string; confidence: number; latencyMs: number; explanation?: string } | null>(null)
  const [vitals, setVitals] = useState<{ type: string; value: string; unit: string }[]>([])
  const [notes, setNotes] = useState('')
  const [overrideReason, setOverrideReason] = useState('')

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId, headers),
    enabled: !!patientId && !!headers?.tenantId,
  })

  const searchByCccd = async () => {
    if (!cccdSearch.trim() || !headers) return
    const p = await findPatientByCccd(cccdSearch.trim(), headers)
    if (p) {
      setPatientId(p.id)
      toastService.success(`Đã tìm thấy: ${p.fullNameVi}`)
    } else {
      toastService.warning('Không tìm thấy bệnh nhân với CCCD này')
    }
  }

  const runSuggest = async () => {
    if (!headers?.tenantId) return
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
        explanation: res.explanation,
      })
      setAcuityLevel(res.suggestedAcuity)
      toastService.info('🤖 AI đã phân tích và đề xuất mức độ ưu tiên')
    } catch (e) {
      toastService.error(e instanceof Error ? e.message : 'Lỗi gợi ý AI')
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
          // Nếu đã chạy suggest trước đó: gửi kết quả chi tiết và KHÔNG chạy lại AI ở backend (useAiSuggestion=false)
          // Nếu chưa chạy suggest nhưng muốn backend tự chạy: useAiSuggestion=true
          useAiSuggestion: suggestion ? false : useAi,
          aiSuggestedAcuity: suggestion?.suggestedAcuity,
          aiConfidenceScore: suggestion?.confidence,
          aiExplanation: suggestion?.explanation,
          acuitySource: suggestion ? 'AI' : undefined,
          chiefComplaintText: chiefComplaint.trim() || undefined,
          vitals: vitalItems.length ? vitalItems : undefined,
          complaints: complaints.length ? complaints : undefined,
          notes: notes.trim() || undefined,
          overrideReason: overrideReason.trim() || undefined,
        },
        headers
      )
    },
    onSuccess: () => {
      toastService.success('✅ Đã tạo phiên phân loại thành công!')
      queryClient.invalidateQueries({ queryKey: ['triage'] })
      // Reset form
      setChiefComplaint('')
      setVitals([])
      setNotes('')
      setOverrideReason('')
      setSuggestion(null)
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="page-header">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Phân loại ưu tiên</h1>
        <p className="mt-1 text-sm text-slate-600">Tìm bệnh nhân, nhập lý do khám và sinh hiệu, gợi ý AI mức ưu tiên 1–5.</p>
      </header>

      {/* Chọn bệnh nhân */}
      <section className="card max-w-2xl">
        <h2 className="section-title mb-4">Bệnh nhân</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Nhập CCCD để tìm"
            value={cccdSearch}
            onChange={(e) => setCccdSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchByCccd()}
            className="input flex-1 w-full"
          />
          <button type="button" onClick={searchByCccd} className="btn-primary w-full sm:w-auto">
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
              <span className="text-sm">Dùng gợi ý AI (dựa trên quy tắc)</span>
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

            {/* AI Explanation Card */}
            {suggestion?.explanation && (
              <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.93813.9L13 4l-5.93813 9.9A2 2 0 0 1 8.683 13H15a2 2 0 0 1 1.732 1l-5.93813 9.9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900 text-sm mb-1">Lập luận của AI:</p>
                    <p className="text-sm text-amber-800">{suggestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sinh hiệu */}
          <section className="card max-w-2xl">
            <h2 className="section-title mb-4">Sinh hiệu (tùy chọn)</h2>
            <div className="space-y-2">
              {VITAL_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="w-48 text-sm">
                    {type === 'TEMPERATURE' && 'Nhiệt độ'}
                    {type === 'HEART_RATE' && 'Nhịp tim'}
                    {type === 'BLOOD_PRESSURE_SYSTOLIC' && 'Huyết áp tâm thu'}
                    {type === 'BLOOD_PRESSURE_DIASTOLIC' && 'Huyết áp tâm trương'}
                    {type === 'RESPIRATORY_RATE' && 'Nhịp thở'}
                    {type === 'SPO2' && 'Chỉ số SpO2'}
                  </span>
                  <input
                    type="text"
                    placeholder="Giá trị"
                    className="input w-24 sm:flex-1 min-w-[5rem]"
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
                    className="input w-20 sm:w-24"
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
                  className="input w-full sm:w-48 rounded-lg"
                  value={acuityLevel}
                  onChange={(e) => setAcuityLevel(e.target.value)}
                >
                  {ACUITY_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Lý do điều chỉnh (khi không chấp nhận gợi ý AI)</label>
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
    </div>
  )
}
