import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getTenant, updateTenantSettings, listTenants } from '@/api/tenants'
import { toastService } from '@/services/toast'
import { Save, RefreshCw } from 'lucide-react'

export function AiConfig() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()

    // Initialize with context tenant, but allow Admin to switch
    const [selectedTenantId, setSelectedTenantId] = useState<string>(headers?.tenantId || '')

    const { data: tenants = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: listTenants,
    })

    const [settings, setSettings] = useState<{
        enableAi: boolean
        aiProvider: string
        aiConfidenceThreshold: number
        ruleBasedFallback: boolean
    }>({
        enableAi: true,
        aiProvider: 'rule-based',
        aiConfidenceThreshold: 0.7,
        ruleBasedFallback: true,
    })

    const { data: tenant, isLoading } = useQuery({
        queryKey: ['tenant', selectedTenantId],
        queryFn: () => getTenant(selectedTenantId),
        enabled: !!selectedTenantId,
    })

    useEffect(() => {
        if (tenant?.settingsJson) {
            try {
                const parsed = JSON.parse(tenant.settingsJson)
                setSettings((prev) => ({ ...prev, ...parsed }))
            } catch (e) {
                console.error('Invalid settings JSON', e)
            }
        } else if (tenant) {
            // Reset to defaults if no settings found
            setSettings({
                enableAi: true,
                aiProvider: 'rule-based',
                aiConfidenceThreshold: 0.7,
                ruleBasedFallback: true,
            })
        }
    }, [tenant])

    const mutation = useMutation({
        mutationFn: () => updateTenantSettings(selectedTenantId, settings),
        onSuccess: () => {
            toastService.success('✅ Đã lưu cấu hình AI')
            queryClient.invalidateQueries({ queryKey: ['tenant', selectedTenantId] })
        },
        onError: (e: Error) => toastService.error(e.message),
    })

    if (!selectedTenantId && tenants.length === 0) return <div className="p-8">Đang tải danh sách Tenant...</div>

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="page-header">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cấu hình AI (Triage Intelligence)</h1>
                <p className="mt-1 text-sm text-slate-600">Quản lý các tham số cho việc phân loại bệnh nhân tự động.</p>

                <div className="mt-4 flex items-center gap-2">
                    <label className="text-sm font-medium">Chọn Tenant:</label>
                    <select
                        className="input w-64"
                        value={selectedTenantId}
                        onChange={(e) => setSelectedTenantId(e.target.value)}
                    >
                        <option value="">-- Chọn chi nhánh để cấu hình --</option>
                        {tenants.map(t => (
                            <option key={t.id} value={t.id}>{t.nameVi} ({t.code})</option>
                        ))}
                    </select>
                </div>
            </header>

            {!selectedTenantId ? (
                <div className="card p-10 text-center text-slate-500">
                    Vui lòng chọn Tenant ở trên để bắt đầu cấu hình.
                </div>
            ) : isLoading ? (
                <div className="card p-10 text-center text-slate-500">Đang tải cấu hình...</div>
            ) : (
                <>
                    <section className="card space-y-6">
                        <h2 className="text-lg font-semibold text-slate-900 border-b pb-2">Chế độ hoạt động</h2>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-900">Bật tính năng AI Gợi ý</label>
                                <p className="text-sm text-slate-500">Cho phép Y tá sử dụng nút "Gợi ý AI" trong màn hình phân loại.</p>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="toggle-checkbox h-6 w-11 rounded-full border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                                    checked={settings.enableAi}
                                    onChange={(e) => setSettings({ ...settings, enableAi: e.target.checked })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">AI Provider</label>
                                <select
                                    className="input w-full"
                                    value={settings.aiProvider}
                                    onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
                                    disabled={!settings.enableAi}
                                >
                                    <option value="rule-based">Rule-Based (Regex / Offline)</option>
                                    <option value="http-endpoint">External HTTP Model (Python/TensorFlow)</option>
                                    <option value="mock-advanced">Mock (Advanced Random Forest)</option>
                                </select>
                                <p className="mt-1 text-xs text-slate-500">
                                    Chọn engine xử lý phân loại. 'Rule-Based' chạy logic cứng, 'External' gọi API Python.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Ngưỡng chấp nhận tự động (Confidence Threshold): {(settings.aiConfidenceThreshold * 100).toFixed(0)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    value={settings.aiConfidenceThreshold}
                                    onChange={(e) => setSettings({ ...settings, aiConfidenceThreshold: parseFloat(e.target.value) })}
                                    disabled={!settings.enableAi}
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Các gợi ý có độ tin cậy thấp hơn mức này sẽ hiển thị cảnh báo "Cần kiểm tra kỹ".
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={settings.ruleBasedFallback}
                                    onChange={(e) => setSettings({ ...settings, ruleBasedFallback: e.target.checked })}
                                    disabled={!settings.enableAi}
                                />
                                <span className="text-sm text-slate-700">Tự động Fallback về Rule-Based nếu External Model lỗi (Timeout/500)</span>
                            </label>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['tenant', selectedTenantId] })}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Tải lại
                        </button>
                        <button
                            type="button"
                            onClick={() => mutation.mutate()}
                            disabled={mutation.isPending}
                            className="btn-primary bg-slate-900 text-white flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {mutation.isPending ? 'Đang lưu...' : 'Lưu Cấu Hình'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
