import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getQueueDefinitions, getQueueEntries, addQueueEntry, callQueueEntry } from '@/api/queues'
import { getPatient } from '@/api/patients'

export function Queue() {
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Hàng chờ</h1>

      {error && <div className="card border-red-200 bg-red-50 text-red-700">{error}</div>}
      {success && <div className="card border-green-200 bg-green-50 text-green-700">{success}</div>}

      {/* Chọn hàng chờ */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Định nghĩa hàng chờ</h3>
        {definitions?.length ? (
          <div className="flex flex-wrap gap-2">
            {definitions.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedQueueId(d.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  selectedQueueId === d.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                {d.nameVi}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Chưa có định nghĩa hàng chờ cho chi nhánh này.</p>
        )}
      </div>

      {selectedQueueId && (
        <>
          {/* Thêm vào hàng */}
          <div className="card max-w-xl">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Thêm bệnh nhân vào hàng</h3>
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
                className="btn-primary"
              >
                {addEntry.isPending ? 'Đang thêm...' : 'Thêm vào hàng'}
              </button>
            </div>
          </div>

          {/* Danh sách đang chờ */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Danh sách đang chờ (WAITING)</h3>
            {isLoading ? (
              <p className="text-slate-500">Đang tải...</p>
            ) : entries?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 font-medium">Vị trí</th>
                      <th className="text-left py-2 font-medium">Patient ID</th>
                      <th className="text-left py-2 font-medium">Trạng thái</th>
                      <th className="text-left py-2 font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <QueueRow
                        key={e.id}
                        entry={e}
                        onCall={() => callEntry.mutate(e.id)}
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
          </div>
        </>
      )}
    </div>
  )
}

function QueueRow({
  entry,
  onCall,
  loading,
  headers,
}: {
  entry: { id: string; patientId: string; position?: number; status: string }
  onCall: () => void
  loading: boolean
  headers: { tenantId: string; branchId?: string } | null
}) {
  const { data: patient } = useQuery({
    queryKey: ['patient', entry.patientId],
    queryFn: () => getPatient(entry.patientId, headers),
    enabled: !!entry.patientId && !!headers?.tenantId,
  })
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-2">{entry.position ?? '—'}</td>
      <td className="py-2">
        {patient ? patient.fullNameVi : entry.patientId.slice(0, 8) + '…'}
      </td>
      <td className="py-2">{entry.status}</td>
      <td className="py-2">
        {entry.status === 'WAITING' && (
          <button
            type="button"
            onClick={onCall}
            disabled={loading}
            className="btn-success text-xs"
          >
            {loading ? '...' : 'Gọi'}
          </button>
        )}
      </td>
    </tr>
  )
}
