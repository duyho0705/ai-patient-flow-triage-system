import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getTenant, updateTenantSettings, listTenants } from '@/api/tenants'
import { toastService } from '@/services/toast'
import { Save, RefreshCw, Cpu, ShieldAlert, Sparkles, Globe, Zap, LayoutGrid } from 'lucide-react'
import { CustomSelect } from '@/components/CustomSelect'
import { motion } from 'framer-motion'

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
            toastService.success('✅ Đã lưu cấu hình AI thành công!')
            queryClient.invalidateQueries({ queryKey: ['tenant', selectedTenantId] })
        },
        onError: (e: Error) => toastService.error(e.message),
    })

    const tenantOptions = tenants.map(t => ({
        value: t.id,
        label: `${t.nameVi} (${t.code})`
    }))

    const providerOptions = [
        { value: 'rule-based', label: 'Rule-Based (Regex / Offline)' },
        { value: 'http-endpoint', label: 'External HTTP Model (Python/TF)' },
        { value: 'mock-advanced', label: 'Mock (Advanced RF)' }
    ]

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-5xl mx-auto space-y-12 pb-24"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl text-[#2b8cee]">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cấu hình AI <span className="text-[#2b8cee]">(Triage Intelligence)</span></h1>
                    </div>
                    <p className="text-slate-500 font-medium">Tùy chỉnh thông số vận hành và engine xử lý phân loại tự động.</p>
                </div>

                <div className="w-full md:w-80 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phòng khám đang cấu hình:</p>
                    <CustomSelect
                        options={tenantOptions}
                        value={selectedTenantId}
                        onChange={setSelectedTenantId}
                        labelKey="label"
                        valueKey="value"
                        placeholder="Chọn phòng khám..."
                        icon={<LayoutGrid className="w-5 h-5 text-slate-400" />}
                    />
                </div>
            </div>

            {!selectedTenantId ? (
                <motion.div variants={item} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Globe className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Chưa chọn phòng khám</h3>
                    <p className="text-slate-500 mt-2 font-medium">Vui lòng chọn một phòng khám từ danh sách phía trên để bắt đầu cấu hình hệ thống AI.</p>
                </motion.div>
            ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <RefreshCw className="w-10 h-10 text-[#2b8cee] animate-spin mb-4" />
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Đang tải cấu hình...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Settings Card */}
                    <motion.div variants={item} className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Chế độ hoạt động</h2>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.enableAi}
                                        onChange={(e) => setSettings({ ...settings, enableAi: e.target.checked })}
                                    />
                                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2b8cee]"></div>
                                    <span className="ml-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                                        {settings.enableAi ? 'Đã bật' : 'Đã tắt'}
                                    </span>
                                </label>
                            </div>

                            <div className={`p-8 space-y-10 transition-opacity duration-300 ${!settings.enableAi ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                {/* AI Provider Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-4 h-4 text-[#2b8cee]" />
                                        <label className="text-sm font-black text-slate-700 uppercase tracking-tight">Bộ não xử lý (AI Provider)</label>
                                    </div>
                                    <CustomSelect
                                        options={providerOptions}
                                        value={settings.aiProvider}
                                        onChange={(val) => setSettings({ ...settings, aiProvider: val })}
                                        labelKey="label"
                                        valueKey="value"
                                        placeholder="Chọn bộ não..."
                                        disabled={!settings.enableAi}
                                    />
                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                            {settings.aiProvider === 'rule-based' && "Engine dựa trên tập hợp quy tắc y tế và Regex. Hoạt động ổn định, không yêu cầu internet."}
                                            {settings.aiProvider === 'http-endpoint' && "Kết nối với mô hình AI tùy chỉnh (Python/PyTorch) qua API. Khuyến nghị cho độ chính xác cao nhất."}
                                            {settings.aiProvider === 'mock-advanced' && "Mô phỏng phản hồi từ mô hình RF nâng cao, phục vụ mục đích kiểm tra giao diện."}
                                        </p>
                                    </div>
                                </div>

                                {/* Confidence Threshold */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <ShieldAlert className="w-4 h-4 text-slate-900" />
                                                <label className="text-sm font-black text-slate-700 uppercase tracking-tight">Ngưỡng tin cậy (Confidence)</label>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium italic">Tự động chấp nhận khi độ tin cậy vượt ngưỡng này.</p>
                                        </div>
                                        <div className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-lg">
                                            {(settings.aiConfidenceThreshold * 100).toFixed(0)}%
                                        </div>
                                    </div>

                                    <div className="relative h-2 bg-slate-100 rounded-full">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                            value={settings.aiConfidenceThreshold}
                                            onChange={(e) => setSettings({ ...settings, aiConfidenceThreshold: parseFloat(e.target.value) })}
                                        />
                                        <motion.div
                                            className="absolute h-full bg-gradient-to-r from-[#2b8cee] to-indigo-600 rounded-full"
                                            style={{ width: `${settings.aiConfidenceThreshold * 100}%` }}
                                        />
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-[#2b8cee] rounded-full shadow-lg pointer-events-none"
                                            style={{ left: `calc(${settings.aiConfidenceThreshold * 100}% - 12px)` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Config Card */}
                        <div className={`bg-white rounded-[2rem] border border-slate-100 p-8 shadow-lg shadow-slate-200/30 flex items-center justify-between transition-opacity ${!settings.enableAi ? 'opacity-40 pointer-events-none' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <RefreshCw className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Cơ chế Fallback tự động</h4>
                                    <p className="text-xs text-slate-500 font-medium">Tự động dùng quy tắc (Rule-based) nếu Model chính gặp sự cố.</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.ruleBasedFallback}
                                onChange={(e) => setSettings({ ...settings, ruleBasedFallback: e.target.checked })}
                                className="w-6 h-6 rounded-lg text-[#2b8cee] focus:ring-[#2b8cee] border-slate-300"
                            />
                        </div>
                    </motion.div>

                    {/* Sidebar / Info Card */}
                    <motion.div variants={item} className="space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Sparkles className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-xl font-black tracking-tight leading-tight">Mẹo tối ưu hiệu suất</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                        <p className="text-xs font-medium text-slate-300 leading-relaxed">
                                            Để có độ chính xác cao nhất (85%+), hãy sử dụng <span className="text-white font-bold italic">External HTTP Model</span> và kết nối với dữ liệu thực tế tại địa phương.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                        <p className="text-xs font-medium text-slate-300 leading-relaxed">
                                            Ngưỡng tin cậy <span className="text-white font-bold italic">70%</span> là mức cân bằng tốt nhất giữa an toàn và tốc độ xử lý.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => mutation.mutate()}
                                disabled={mutation.isPending}
                                className="w-full bg-[#2b8cee] text-white py-4 rounded-2xl font-black text-sm tracking-tight shadow-xl shadow-[#2b8cee]/30 hover:bg-blue-700 hover:shadow-[#2b8cee]/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {mutation.isPending ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Lưu Cấu Hình
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['tenant', selectedTenantId] })}
                                className="w-full bg-white text-slate-600 border border-slate-200 py-4 rounded-2xl font-black text-sm tracking-tight hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Tải lại
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    )
}
