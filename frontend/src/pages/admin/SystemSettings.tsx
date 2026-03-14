import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
    Bell, 
    Mail, 
    MessageSquare, 
    ShieldAlert, 
    Save, 
    RefreshCw,
    Activity,
    Droplets,
    Scale,
    Loader2
} from 'lucide-react'
import { toastService } from '@/services/toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSystemSettings, updateSystemSetting, SystemSettingDto } from '@/api/admin'

export function SystemSettings() {
    const [activeSection, setActiveSection] = useState<'thresholds' | 'notifications'>('thresholds')

    const { data: settings = [], isLoading } = useQuery({
        queryKey: ['system-settings'],
        queryFn: getSystemSettings
    })

    if (isLoading) {
        return (
            <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang tải cấu hình hệ thống...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Cấu hình Enterprise Hub</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Thiết lập tham số y tế mặc định và tích hợp hạ tầng toàn cục</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveSection('thresholds')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSection === 'thresholds' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                    >
                        Ngưỡng cảnh báo
                    </button>
                    <button 
                        onClick={() => setActiveSection('notifications')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSection === 'notifications' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                    >
                        Cổng thông báo
                    </button>
                </div>
            </div>

            {activeSection === 'thresholds' ? <ThresholdSettings settings={settings} /> : <NotificationGatewaySettings settings={settings} />}
        </div>
    )
}

function ThresholdSettings({ settings }: { settings: SystemSettingDto[] }) {
    const queryClient = useQueryClient()
    const updateMutation = useMutation({
        mutationFn: ({ key, value }: { key: string, value: string }) => updateSystemSetting(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings'] })
        }
    })

    const initialValues = useMemo(() => {
        const map: Record<string, string> = {}
        settings.forEach(s => {
            map[s.settingKey] = s.settingValue
        })
        return map
    }, [settings])

    const [localValues, setLocalValues] = useState<Record<string, string>>(initialValues)

    const handleChange = (key: string, value: string) => {
        setLocalValues(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        try {
            await Promise.all(
                Object.entries(localValues).map(([key, value]) => 
                    updateMutation.mutateAsync({ key, value })
                )
            )
            toastService.success('✅ Đã cập nhật tất cả cấu hình ngưỡng!')
        } catch (err) {
            toastService.error('Lỗi khi lưu cấu hình.')
        }
    }

    const getVal = (key: string, def: string) => localValues[key] || def

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500">
                        <Activity className="size-5" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Huyết áp & Nhịp tim</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <ThresholdInput label="Systolic (Max)" value={getVal('threshold.systolic.high', '140')} unit="mmHg" onChange={(val: string) => handleChange('threshold.systolic.high', val)} />
                    <ThresholdInput label="Systolic (Min)" value={getVal('threshold.systolic.low', '90')} unit="mmHg" onChange={(val: string) => handleChange('threshold.systolic.low', val)} />
                    <ThresholdInput label="Diastolic (Max)" value={getVal('threshold.diastolic.high', '90')} unit="mmHg" onChange={(val: string) => handleChange('threshold.diastolic.high', val)} />
                    <ThresholdInput label="Diastolic (Min)" value={getVal('threshold.diastolic.low', '60')} unit="mmHg" onChange={(val: string) => handleChange('threshold.diastolic.low', val)} />
                    <ThresholdInput label="Nhịp tim (Max)" value={getVal('threshold.heartRate.high', '100')} unit="bpm" onChange={(val: string) => handleChange('threshold.heartRate.high', val)} />
                    <ThresholdInput label="Nhịp tim (Min)" value={getVal('threshold.heartRate.low', '60')} unit="bpm" onChange={(val: string) => handleChange('threshold.heartRate.low', val)} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">
                        <Droplets className="size-5" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Đường huyết & SpO2</h3>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <ThresholdInput label="Đường huyết (Max)" value={getVal('threshold.glucose.high', '180')} unit="mg/dL" onChange={(val: string) => handleChange('threshold.glucose.high', val)} />
                        <ThresholdInput label="Đường huyết (Min)" value={getVal('threshold.glucose.low', '70')} unit="mg/dL" onChange={(val: string) => handleChange('threshold.glucose.low', val)} />
                    </div>
                    <ThresholdInput label="Ngưỡng SpO2 tối thiểu" value={getVal('threshold.spo2.low', '94')} unit="%" onChange={(val: string) => handleChange('threshold.spo2.low', val)} />
                </div>

                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
                            <Scale className="size-5" />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Cân nặng</h3>
                    </div>
                    <ThresholdInput label="Tăng cân bất thường (Tuần)" value={getVal('threshold.weight.gain', '2.0')} unit="kg" onChange={(val: string) => handleChange('threshold.weight.gain', val)} />
                </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-slate-900 transition-all shadow-xl disabled:opacity-50"
                >
                    {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Xác nhận lưu thay đổi
                </button>
            </div>
        </div>
    )
}

function ThresholdInput({ label, value, unit, onChange }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            <div className="relative group">
                <input 
                    type="text" 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-6 pr-14 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-tight group-focus-within:text-primary transition-colors">{unit}</span>
            </div>
        </div>
    )
}

function NotificationGatewaySettings({ settings }: { settings: SystemSettingDto[] }) {
    const queryClient = useQueryClient()
    const updateMutation = useMutation({
        mutationFn: ({ key, value }: { key: string, value: string }) => updateSystemSetting(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings'] })
        }
    })

    const getVal = (key: string) => settings.find(s => s.settingKey === key)?.settingValue || ''

    const handleFieldChange = async (key: string, value: string) => {
        try {
            await updateMutation.mutateAsync({ key, value })
            toastService.success(`Đã cập nhật ${key}`)
        } catch (err) {
            toastService.error('Lỗi khi cập nhật cấu hình.')
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/10">
                    <div className="flex items-center gap-3">
                        <Bell className="text-amber-500 size-5" />
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Cấu hình Cổng kết nối (Hub)</h3>
                    </div>
                </div>

                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    <GatewayItem 
                        icon={<Mail className="text-blue-500" />}
                        title="Email (SMTP)"
                        desc="Hạ tầng gửi đơn thuốc điện tử và báo cáo định kỳ"
                        fields={[
                            { key: 'email.smtp.host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
                            { key: 'email.smtp.port', label: 'Port', placeholder: '587' },
                            { key: 'email.smtp.user', label: 'Username', placeholder: 'noreply@songkhoe.vn' }
                        ]}
                        getVal={getVal}
                        onSave={handleFieldChange}
                    />
                    <GatewayItem 
                        icon={<MessageSquare className="text-emerald-500" />}
                        title="SMS Gateway"
                        desc="Truyền tin cảnh báo khẩn cấp qua nhà mạng"
                        fields={[
                            { key: 'sms.api.key', label: 'API Key', placeholder: 'sk_sms_...' },
                            { key: 'sms.brandname', label: 'Brandname', placeholder: 'SONGKHOE' }
                        ]}
                        getVal={getVal}
                        onSave={handleFieldChange}
                    />
                    <GatewayItem 
                        icon={<ShieldAlert className="text-purple-500" />}
                        title="Firebase (Push Notifications)"
                        desc="Thông báo đẩy thời gian thực trên đa nền tảng"
                        fields={[
                            { key: 'fcm.project.id', label: 'Project ID', placeholder: 'chronic-cdm-...' },
                            { key: 'fcm.server.key', label: 'Server Key', placeholder: 'AAAA...' }
                        ]}
                        getVal={getVal}
                        onSave={handleFieldChange}
                    />
                </div>
            </div>
        </div>
    )
}

function GatewayItem({ icon, title, desc, fields, getVal, onSave }: any) {
    const [isExpanded, setIsExpanded] = useState(false)
    return (
        <div className="p-8 space-y-6 transition-all hover:bg-slate-50/30">
            <div className="flex items-center justify-between cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-5">
                    <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    <div>
                        <p className="font-black text-slate-900 dark:text-white text-base tracking-tight">{title}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{desc}</p>
                    </div>
                </div>
                <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/10 px-4 py-2 rounded-xl transition-all">
                    {isExpanded ? 'Đóng' : 'Cấu hình'}
                </button>
            </div>

            {isExpanded && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6"
                >
                    {fields.map((f: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{f.label}</label>
                            <input 
                                type="text"
                                defaultValue={getVal(f.key)}
                                onBlur={(e) => e.target.value !== getVal(f.key) && onSave(f.key, e.target.value)}
                                placeholder={f.placeholder}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20"
                            />
                        </div>
                    ))}
                    <div className="md:col-span-2 lg:col-span-3">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl flex items-center justify-between border border-emerald-500/20">
                            <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 tracking-widest flex items-center gap-2">
                                <RefreshCw className="size-3" />
                                ĐÃ KẾT NỐI VỚI HẠ TẦNG SONGKHOE HUB
                            </p>
                            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline px-4">Kiểm tra kết nối</button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

