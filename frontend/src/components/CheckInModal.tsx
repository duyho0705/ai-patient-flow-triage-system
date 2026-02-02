import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getQueueDefinitions, addQueueEntry } from '@/api/queues'
import { toastService } from '@/services/toast'
import type { PatientDto } from '@/types/api'

interface CheckInModalProps {
    patient: PatientDto
    onClose: () => void
    onSuccess: () => void
}

/**
 * Enterprise Check-In Modal
 * Allows receptionist to add patient to triage queue with one click
 */
export function CheckInModal({ patient, onClose, onSuccess }: CheckInModalProps) {
    const { headers, branchId } = useTenant()
    const queryClient = useQueryClient()
    const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null)

    // Get available queue definitions for this branch
    const { data: queues, isLoading: loadingQueues } = useQuery({
        queryKey: ['queue-definitions', branchId],
        queryFn: () => getQueueDefinitions(branchId!, headers),
        enabled: !!branchId && !!headers?.tenantId,
    })

    // Mutation to add patient to queue
    const checkInMutation = useMutation({
        mutationFn: () => {
            if (!selectedQueueId) throw new Error('Vui lòng chọn hàng chờ')
            return addQueueEntry(
                {
                    queueDefinitionId: selectedQueueId,
                    patientId: patient.id,
                    position: 999, // Will be calculated by backend
                },
                headers
            )
        },
        onSuccess: () => {
            toastService.success(`✅ Đã tiếp đón ${patient.fullNameVi} vào hàng chờ!`)
            queryClient.invalidateQueries({ queryKey: ['queue-entries'] })
            onSuccess()
            onClose()
        },
        onError: (e: Error) => {
            toastService.error(e.message)
        },
    })

    // Auto-select first queue (usually Triage Queue)
    const triageQueue = queues?.find(q =>
        q.nameVi?.toLowerCase().includes('triage') ||
        q.nameVi?.toLowerCase().includes('phân loại')
    ) || queues?.[0]

    if (triageQueue && !selectedQueueId) {
        setSelectedQueueId(triageQueue.id)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d3436]/10 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Tiếp đón bệnh nhân</h2>
                        <p className="text-sm text-slate-600 mt-1">Thêm vào hàng chờ phân loại</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Patient Info Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                            👤
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{patient.fullNameVi}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {patient.dateOfBirth && (
                                    <span className="inline-flex items-center text-xs text-slate-600 bg-white px-2 py-0.5 rounded-full">
                                        📅 {patient.dateOfBirth}
                                    </span>
                                )}
                                {patient.phone && (
                                    <span className="inline-flex items-center text-xs text-slate-600 bg-white px-2 py-0.5 rounded-full">
                                        📱 {patient.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Queue Selection */}
                <div className="mb-6">
                    <label className="label mb-2">Chọn hàng chờ</label>
                    {loadingQueues ? (
                        <div className="animate-pulse h-10 bg-slate-200 rounded-lg"></div>
                    ) : queues?.length ? (
                        <div className="space-y-2">
                            {queues.map((q) => (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => setSelectedQueueId(q.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${selectedQueueId === q.id
                                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{q.nameVi}</span>
                                        {selectedQueueId === q.id && (
                                            <span className="text-blue-500">✓</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Chưa có hàng chờ nào được cấu hình.</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 btn-secondary"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={() => checkInMutation.mutate()}
                        disabled={!selectedQueueId || checkInMutation.isPending}
                        className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                    >
                        {checkInMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : (
                            '✅ Tiếp đón ngay'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
