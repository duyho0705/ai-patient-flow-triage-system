import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { listAiAudits } from '@/api/ai-audit'

/**
 * Trang AI Audit – so sánh đề xuất AI vs quyết định thực tế (Explainability).
 * Enterprise / CV: AI Audit + Explainability.
 */
export function AiAudit() {
  const { headers, branchId } = useTenant()
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['ai-audit', branchId, page, headers?.tenantId],
    queryFn: () => listAiAudits({ branchId: branchId!, page, size: 20 }, headers),
    enabled: !!branchId && !!headers?.tenantId,
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="page-header">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          AI Audit – Explainability
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          So sánh đề xuất AI (suggested acuity) vs quyết định thực tế (actual acuity). Để tuân thủ và đánh giá model.
        </p>
      </header>

      {!branchId ? (
        <p className="text-slate-500">Chọn chi nhánh để xem AI audit.</p>
      ) : isLoading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : data?.content?.length ? (
        <>
          <section className="card">
            <h2 className="section-title mb-4">Lịch sử gọi AI phân loại</h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="table-th">Thời gian</th>
                    <th className="table-th">AI đề xuất</th>
                    <th className="table-th">Thực tế</th>
                    <th className="table-th">Khớp</th>
                    <th className="table-th">Latency (ms)</th>
                    <th className="table-th">Session ID</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80">
                      <td className="table-td text-sm text-slate-600">
                        {a.calledAt ? new Date(a.calledAt).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="table-td font-medium text-slate-900">
                        {a.suggestedAcuity ?? '—'}
                      </td>
                      <td className="table-td font-medium text-slate-900">
                        {a.actualAcuity}
                      </td>
                      <td className="table-td">
                        {a.matched ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                            Khớp
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                            Override
                          </span>
                        )}
                      </td>
                      <td className="table-td text-slate-600">{a.latencyMs ?? '—'}</td>
                      <td className="table-td font-mono text-xs text-slate-500">
                        {a.triageSessionId?.slice(0, 8)}…
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={data.first}
                className="btn-secondary rounded-lg text-sm"
              >
                Trước
              </button>
              <span className="text-sm text-slate-600">
                Trang {data.page + 1} / {data.totalPages || 1} ({data.totalElements} bản ghi)
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={data.last}
                className="btn-secondary rounded-lg text-sm"
              >
                Sau
              </button>
            </div>
          </section>
        </>
      ) : (
        <p className="text-slate-500">Chưa có bản ghi AI audit nào cho chi nhánh này.</p>
      )}
    </div>
  )
}
