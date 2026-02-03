import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { listAiAudits } from '@/api/ai-audit'
import {
  Brain, ShieldCheck, AlertTriangle, Clock,
  ArrowRight, ChevronLeft, ChevronRight, Search,
  Filter, MoreHorizontal, Fingerprint, Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function AiAudit() {
  const { headers, branchId } = useTenant()
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['ai-audit', branchId, page, headers?.tenantId],
    queryFn: () => listAiAudits({ branchId: branchId!, page, size: 20 }, headers),
    enabled: !!branchId && !!headers?.tenantId,
  })

  const getAcuityColor = (level: string) => {
    const l = level?.toString()
    if (l === '1') return 'bg-rose-500 text-white shadow-rose-200'
    if (l === '2') return 'bg-orange-500 text-white shadow-orange-200'
    if (l === '3') return 'bg-amber-500 text-white shadow-amber-200'
    if (l === '4') return 'bg-emerald-500 text-white shadow-emerald-200'
    if (l === '5') return 'bg-blue-500 text-white shadow-blue-200'
    return 'bg-slate-400 text-white shadow-slate-200'
  }

  if (!branchId) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cần chọn Chi nhánh</h3>
        <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Vui lòng chọn chi nhánh để xem dữ liệu AI Audit</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nhật ký AI Audit</h1>
          </div>
          <p className="text-slate-500 font-medium ml-1 flex items-center gap-2">
            Giám sát và kiểm soát chất lượng phân loại bệnh nhân bằng trí tuệ nhân tạo.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] gap-1 shadow-inner">
          <div className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white rounded-2xl shadow-xl flex items-center gap-2">
            <Fingerprint className="w-3 h-3 text-blue-500" />
            Audit Log
          </div>
        </div>
      </div>

      {/* Main Content Table Area */}
      <section className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian giao dịch</th>
                <th className="px-10 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Phiên xử lý (AI)</th>
                <th className="px-10 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">So sánh kết quả</th>
                <th className="px-10 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-10 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Độ trễ (ms)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-10 h-24 bg-slate-50/10" />
                  </tr>
                ))
              ) : data?.content?.map((a) => (
                <tr key={a.id} className="group hover:bg-slate-50/40 transition-all duration-300">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 tracking-tight leading-none mb-2">
                          {a.calledAt ? new Date(a.calledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {a.calledAt ? new Date(a.calledAt).toLocaleDateString('vi-VN') : '—'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <span className="font-mono text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                      #{a.triageSessionId?.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Đề xuất AI</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg ${getAcuityColor(a.suggestedAcuity || '')}`}>
                          {a.suggestedAcuity ?? '?'}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-200" />
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Thực tế y tá</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg ${getAcuityColor(a.actualAcuity)}`}>
                          {a.actualAcuity}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    {a.matched ? (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Hệ thống khớp</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100/50">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Cần can thiệp</span>
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-lg font-black ${(a.latencyMs || 0) > 1000 ? 'text-rose-500' : 'text-slate-900'}`}>{a.latencyMs?.toLocaleString() ?? '—'}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">milliseconds</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="bg-slate-50/50 px-10 py-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest items-center flex gap-2">
            <Activity className="w-4 h-4 text-slate-300" />
            Trang {data?.page ? data.page + 1 : 1} / {data?.totalPages || 1} — Tổng cộng {data?.totalElements || 0} bản ghi audit
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={data?.first || isLoading}
              className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={data?.last || isLoading}
              className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
