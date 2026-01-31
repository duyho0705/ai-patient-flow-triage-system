import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getQueueDefinitions, getQueueEntries, addQueueEntry, callQueueEntry } from '@/api/queues'
import { startConsultation } from '@/api/clinical'
import { getPatient } from '@/api/patients'

export function Queue() {
  const navigate = useNavigate()
  const { headers, branchId } = useTenant()
  const queryClient = useQueryClient()
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null)
  const [addPatientId, setAddPatientId] = useState('')
  const [addTriageSessionId, setAddTriageSessionId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data: definitions } = useQuery({
    queryKey: ['queue-definitions', branchId, headers?.tenantId],
    queryFn: () => getQueueDefinitions(branchId!, headers),
    enabled: !!branchId && !!headers?.tenantId,
  })

  const { data: entries, isLoading } = useQuery({
    queryKey: ['queue-entries', selectedQueueId, branchId, headers?.tenantId],
    queryFn: () => getQueueEntries(selectedQueueId!, branchId!, headers),
    enabled: !!selectedQueueId && !!branchId && !!headers?.tenantId,
  })

  const addEntry = useMutation({
    mutationFn: () => {
      if (!selectedQueueId || !addPatientId.trim() || !headers?.tenantId) throw new Error('Chọn hàng chờ và nhập ID bệnh nhân')
      return addQueueEntry(
        {
          queueDefinitionId: selectedQueueId,
          patientId: addPatientId.trim(),
          triageSessionId: addTriageSessionId.trim() || undefined,
        },
        headers
      )
    },
    onSuccess: () => {
      setSuccess('Đã thêm vào hàng chờ.')
      setAddPatientId('')
      setAddTriageSessionId('')
      queryClient.invalidateQueries({ queryKey: ['queue-entries'] })
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (e: Error) => setError(e.message),
  })

  const callEntry = useMutation({
    mutationFn: (entryId: string) => callQueueEntry(entryId, headers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-entries'] })
    },
  })

  const startExam = useMutation({
    mutationFn: (queueEntryId: string) => startConsultation({ queueEntryId }, headers),
    onSuccess: (data) => {
      navigate(`/doctor/consultation/${data.id}`)
    },
    onError: (e: Error) => setError('Không thể bắt đầu khám: ' + e.message),
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="page-header">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hàng chờ</h1>
        <p className="mt-1 text-sm text-slate-600">Xem danh sách đang chờ, thêm bệnh nhân, gọi số.</p>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}

      {/* Chọn hàng chờ */}
      <section className="card">
        <h2 className="section-title mb-4">Định nghĩa hàng chờ</h2>
        {definitions?.length ? (
          <div className="flex flex-wrap gap-2">
            {definitions.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedQueueId(d.id)}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${selectedQueueId === d.id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {d.nameVi}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Chưa có định nghĩa hàng chờ cho chi nhánh này.</p>
        )}
      </section>

      {selectedQueueId && (
        <>
          {/* Thêm vào hàng */}
          <section className="card max-w-2xl">
            <h2 className="section-title mb-4">Thêm bệnh nhân vào hàng</h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="ID bệnh nhân (UUID)"
                value={addPatientId}
                onChange={(e) => setAddPatientId(e.target.value)}
                className="input w-72"
              />
              <input
                type="text"
                placeholder="ID phiên phân loại (tùy chọn)"
                value={addTriageSessionId}
                onChange={(e) => setAddTriageSessionId(e.target.value)}
                className="input w-72"
              />
              <button
                type="button"
                onClick={() => addEntry.mutate()}
                disabled={addEntry.isPending || !addPatientId.trim()}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {addEntry.isPending ? 'Đang thêm...' : 'Thêm vào hàng'}
              </button>
            </div>
          </section>

          {/* Danh sách đang chờ */}
          <section className="card">
            <h2 className="section-title mb-4">Danh sách đang chờ (WAITING)</h2>
            {isLoading ? (
              <p className="text-slate-500">Đang tải...</p>
            ) : entries?.length ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="table-th">Ưu tiên</th>
                      <th className="table-th">Vị trí</th>
                      <th className="table-th">Bệnh nhân</th>
                      <th className="table-th">Trạng thái</th>
                      <th className="table-th">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <QueueRow
                        key={e.id}
                        entry={e}
                        onCall={() => callEntry.mutate(e.id)}
                        onStartExam={() => startExam.mutate(e.id)}
                        loading={callEntry.isPending && callEntry.variables === e.id}
                        headers={headers}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500">Không có bệnh nhân nào đang chờ.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function QueueRow({
  entry,
  onCall,
  onStartExam,
  loading,
  headers,
}: {
  entry: { id: string; patientId: string; position?: number; status: string; acuityLevel?: string | null }
  onCall: () => void
  onStartExam: () => void
  loading: boolean
  headers: { tenantId: string; branchId?: string } | null
}) {
  const { data: patient } = useQuery({
    queryKey: ['patient', entry.patientId],
    queryFn: () => getPatient(entry.patientId, headers),
    enabled: !!entry.patientId && !!headers?.tenantId,
  })
  return (
    <tr className="hover:bg-slate-50/80">
      <td className="table-td font-semibold text-slate-900">{entry.acuityLevel ?? '—'}</td>
      <td className="table-td font-medium text-slate-900">{entry.position ?? '—'}</td>
      <td className="table-td font-medium text-slate-900">
        {patient ? patient.fullNameVi : entry.patientId.slice(0, 8) + '…'}
      </td>
      <td className="table-td">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {entry.status}
        </span>
      </td>
      <td className="table-td">
        {entry.status === 'WAITING' && (
          <button
            type="button"
            onClick={onCall}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? '...' : 'Gọi'}
          </button>
        )}
        {entry.status === 'CALLED' && (
          <button
            type="button"
            onClick={onStartExam}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Khám
          </button>
        )}
      </td>
    </tr>
  )
}
