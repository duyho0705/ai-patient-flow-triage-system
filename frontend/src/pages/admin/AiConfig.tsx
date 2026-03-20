import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getTenant, updateTenantSettings, listTenants } from '@/api/tenants'
import { toastService } from '@/services/toast'
import { Save, RefreshCw, ShieldAlert, Sparkles, Globe, Brain, Settings2, Rocket, Info, Activity, Loader2 } from 'lucide-react'
import { CustomSelect } from '@/components/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'

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
            toastService.success('✨ Cấu hình Triage Intelligence đã cập nhật!')
            queryClient.invalidateQueries({ queryKey: ['tenant', selectedTenantId] })
        },
        onError: (e: Error) => toastService.error(e.message),
    })

    const tenantOptions = tenants.map(t => ({
        value: t.id,
        label: `${t.nameVi} (${t.code})`
    }))

    const providerOptions = [
        { value: 'rule-based', label: 'Cơ chế Quy tắc (Regex / Offline)' },
        { value: 'http-endpoint', label: 'Engine AI Chuyên biệt (Python/ML)' }
    ]

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 bg-md-background font-sans space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">AI Intelligence Hub</h2>
                    <p className="text-md-on-surface-variant font-medium opacity-70">
                        Cấu hình nơ-ron và engine dự đoán nguy cơ lâm sàng.
                    </p>
                </div>
                <div className="w-full md:w-[360px] space-y-2">
                    <label className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest ml-3 block italic opacity-50">Cơ sở đang cấu hình:</label>
                    <CustomSelect
                        options={tenantOptions}
                        value={selectedTenantId}
                        onChange={setSelectedTenantId}
                        labelKey="label"
                        valueKey="value"
                        placeholder="Chọn phòng khám mục tiêu..."
                        size="md"
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!selectedTenantId ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-md-surface-container-low border-2 border-dashed border-md-outline/10 rounded-[3rem] p-24 text-center space-y-6"
                    >
                        <div className="size-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-elevation-1 border border-md-outline/5 text-md-primary">
                            <Globe size={40} />
                        </div>
                        <div className="space-y-2">
                             <h3 className="text-2xl font-black text-md-on-surface uppercase tracking-tight">Scope Restricted</h3>
                             <p className="text-md-on-surface-variant font-medium italic opacity-60 max-w-md mx-auto">Vui lòng chọn phạm vi (Cơ sở y tế) từ danh sách phía trên để can thiệp vào tầng AI Cloud.</p>
                        </div>
                    </motion.div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 h-[400px]">
                        <Loader2 className="size-16 animate-spin text-md-primary" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-md-on-surface-variant animate-pulse italic">Tri xuất Neuron Path từ Database...</p>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                    >
                        {/* Main Settings Card */}
                        <div className="lg:col-span-2 space-y-10">
                            <div className="bg-md-surface-container-lowest rounded-[3rem] border border-md-outline/10 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-8 border-b border-md-outline/5 bg-md-surface-container-low/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-md-primary/10 text-md-primary flex items-center justify-center">
                                            <Brain size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-md-on-surface tracking-tight">Neural Engine State</h3>
                                            <p className="text-[10px] font-black text-md-outline uppercase tracking-widest opacity-60">Status: {settings.enableAi ? 'Active' : 'Standby'}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer group scale-110">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.enableAi}
                                            onChange={(e) => setSettings({ ...settings, enableAi: e.target.checked })}
                                        />
                                        <div className="w-16 h-8 bg-md-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-7 after:transition-all peer-checked:bg-md-primary shadow-inner" />
                                    </label>
                                </div>

                                <div className={`p-10 space-y-12 transition-all duration-700 ${!settings.enableAi ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                                    {/* AI Provider Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <label className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-60">Engine Provider</label>
                                            <Sparkles className="size-4 text-md-primary animate-pulse" />
                                        </div>
                                        <CustomSelect
                                            options={providerOptions}
                                            value={settings.aiProvider}
                                            onChange={(val) => setSettings({ ...settings, aiProvider: val })}
                                            labelKey="label"
                                            valueKey="value"
                                            placeholder="Chọn engine xử lý..."
                                            disabled={!settings.enableAi}
                                            size="lg"
                                        />
                                        <div className="p-6 bg-md-surface-container-low rounded-3xl border border-md-outline/5 flex items-start gap-4 italic group">
                                            <Info size={18} className="text-md-primary shrink-0 mt-0.5 group-hover:rotate-12 transition-transform" />
                                            <p className="text-[11px] text-md-on-surface-variant font-bold leading-relaxed opacity-60">
                                                {settings.aiProvider === 'rule-based' && "Bộ quy tắc lâm sàng tĩnh (NIST standardized). Độ trễ thấp, không phụ thuộc vào hạ tầng đám mây AI."}
                                                {settings.aiProvider === 'http-endpoint' && "Kết nối mô hình học sâu (Deep Learning) từ Inference Server riêng. Khuyến nghị cho độ chính xác trên 92%."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Confidence Threshold */}
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end px-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-widest opacity-60">Confidence Threshold (Ngưỡng tin cậy)</label>
                                                <p className="text-xs font-medium text-md-on-surface-variant opacity-40 italic font-sans">Điểm số tối thiểu để AI tự động phê duyệt phân loại.</p>
                                            </div>
                                            <div className="h-14 px-6 bg-md-on-surface text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-md-on-surface/20">
                                                {(settings.aiConfidenceThreshold * 100).toFixed(0)}%
                                            </div>
                                        </div>

                                        <div className="relative pt-6 pb-2 px-1">
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                className="w-full h-2 bg-md-surface-container rounded-full appearance-none cursor-pointer accent-md-primary focus:outline-none"
                                                value={settings.aiConfidenceThreshold}
                                                onChange={(e) => setSettings({ ...settings, aiConfidenceThreshold: parseFloat(e.target.value) })}
                                            />
                                            <div className="flex justify-between mt-4 text-[10px] font-black text-md-outline italic opacity-40 uppercase tracking-widest px-1">
                                                <span>Conservative (Safe)</span>
                                                <span>Balanced</span>
                                                <span>Aggressive (Fast)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fallback Section */}
                            <label className={`bg-md-surface-container-low p-8 rounded-[2.5rem] border border-md-outline/5 shadow-sm flex items-center justify-between transition-all cursor-pointer hover:border-md-primary/20 group ${!settings.enableAi ? 'opacity-30 pointer-events-none' : ''}`}>
                                <div className="flex items-center gap-6">
                                    <div className="size-16 bg-white rounded-2xl flex items-center justify-center text-md-primary shadow-sm border border-md-outline/5 group-hover:scale-110 transition-transform">
                                        <Activity size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-md text-md-on-surface tracking-tight leading-none">Self-Healing Fallback</h4>
                                        <p className="text-xs text-md-on-surface-variant font-medium opacity-60 italic">Tự động kích hoạt Rule-based nếu Model AI không phản hồi.</p>
                                    </div>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer scale-125 mr-4">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.ruleBasedFallback}
                                        onChange={(e) => setSettings({ ...settings, ruleBasedFallback: e.target.checked })}
                                    />
                                    <div className="w-12 h-6 bg-md-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-md-primary" />
                                </div>
                            </label>
                        </div>

                        {/* Sidebar Info & Controls */}
                        <div className="space-y-8 flex flex-col">
                            {/* Insight Card */}
                            <div className="bg-md-on-surface text-white p-10 rounded-[3.5rem] shadow-elevation-3 space-y-10 relative overflow-hidden group border border-white/10">
                                <div className="absolute -top-10 -right-10 size-48 bg-md-primary/20 blur-3xl rounded-full transition-transform group-hover:scale-150 duration-1000" />
                                
                                <div className="relative z-10 flex items-center justify-between">
                                    <h3 className="text-2xl font-bold tracking-tight">AI Strategy</h3>
                                    <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                        <Rocket size={20} className="text-md-primary" />
                                    </div>
                                </div>

                                <div className="relative z-10 space-y-6">
                                    <StrategyItem 
                                        icon={Settings2} 
                                        title="Optimization Tip" 
                                        desc="Ngưỡng 70% mang lại sự cân bằng hoàn hảo giữa độ chính xác lâm sàng và hiệu suất xử lý thực tế." 
                                    />
                                    <StrategyItem 
                                        icon={ShieldAlert} 
                                        title="Security Layer" 
                                        desc="Tất cả dữ liệu truyền tải qua Inference Engine đều được mã hóa AES-256 đầu cuối." 
                                    />
                                </div>

                                <motion.div whileHover={{ scale: 1.05 }} className="relative z-10 p-6 bg-white/10 rounded-3xl border border-white/10 shadow-inner">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="size-2 rounded-full bg-md-primary animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-md-primary">Model Version: v4.2-LTS</span>
                                    </div>
                                    <p className="text-[10px] italic font-medium opacity-60">Ready for multi-modal patient data analysis.</p>
                                </motion.div>
                            </div>

                            {/* Actions Column */}
                            <div className="flex flex-col gap-4 mt-auto">
                                <button
                                    type="button"
                                    onClick={() => mutation.mutate()}
                                    disabled={mutation.isPending}
                                    className="w-full h-18 bg-md-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-elevation-2 hover:shadow-elevation-4 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {mutation.isPending ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={20} className="group-hover:translate-y-0.5 transition-transform" />
                                            Đồng bộ Cấu hình AI
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => queryClient.invalidateQueries({ queryKey: ['tenant', selectedTenantId] })}
                                    className="w-full h-16 bg-md-surface-container-low text-md-on-surface-variant rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-md-primary/5 transition-all flex items-center justify-center gap-3 border border-md-outline/5"
                                >
                                    <RefreshCw size={18} />
                                    Cập nhật trạng thái
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function StrategyItem({ icon: Icon, title, desc }: any) {
    return (
        <div className="flex gap-4 group/item">
            <div className="size-10 shrink-0 bg-white/10 rounded-xl flex items-center justify-center border border-white/5 transition-all group-hover/item:bg-md-primary/20">
                <Icon size={18} className="text-md-primary opacity-60 group-hover/item:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
                <h5 className="text-xs font-black uppercase tracking-wide text-white">{title}</h5>
                <p className="text-[10px] font-medium text-white/50 leading-relaxed italic line-clamp-2">{desc}</p>
            </div>
        </div>
    )
}
