import { useState, useMemo, useEffect } from 'react'
import {
    Save, Activity, Loader2, BellRing, Settings2, 
    AlertTriangle, RotateCcw, Check, Globe, Clock, Shield, Bell,
    ArrowRight, Heart, Thermometer, Droplets, Smartphone
} from 'lucide-react'
import { toastService } from '@/services/toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSystemSettings, updateSystemSetting } from '@/api/admin'
import { motion, AnimatePresence } from 'framer-motion'

export function SystemSettings() {
    const queryClient = useQueryClient()
    const { data: settings = [], isLoading } = useQuery({
        queryKey: ['system-settings'],
        queryFn: getSystemSettings
    })

    const updateMutation = useMutation({
        mutationFn: ({ key, value }: { key: string, value: string }) => updateSystemSetting(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings'] })
        }
    })

    const initialValues = useMemo(() => {
        const map: Record<string, string> = {}
        if (settings && Array.isArray(settings)) {
            settings.forEach(s => {
                if (s && s.settingKey) {
                    map[s.settingKey] = s.settingValue
                }
            })
        }
        return map
    }, [settings])

    const [localValues, setLocalValues] = useState<Record<string, string>>(initialValues)

    useEffect(() => {
        if (settings && Array.isArray(settings)) {
            setLocalValues(initialValues)
        }
    }, [initialValues, settings])

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
            toastService.success('✅ Cấu hình đã được lưu thành công!')
        } catch (err) {
            toastService.error('Không thể lưu cấu hình. Vui lòng thử lại.')
        }
    }

    const handleRestoreDefaults = () => {
        if (confirm('Bạn có chắc chắn muốn khôi phục cài đặt gốc? Toàn bộ tùy chỉnh sẽ bị xóa.')) {
            const defaults: Record<string, string> = {
                'threshold.heartRate.low': '50',
                'threshold.heartRate.high': '140',
                'threshold.systolic.high': '140',
                'threshold.diastolic.high': '90',
                'threshold.glucose.fasting.high': '7.0',
                'threshold.glucose.afterMeal.high': '11.0',
                'password.min_length': '8',
                'password.expiry_days': '90',
                'password.max_failed_logins': '5',
                'password.require_special_char': 'true',
                'password.require_uppercase_number': 'true',
                'system.language': 'vi',
                'system.timezone': 'Asia/Ho_Chi_Minh',
                'system.maintenance_mode': 'false'
            }
            setLocalValues(defaults)
            toastService.info('Đã tải bộ cài đặt mặc định. Nhấn Lưu để áp dụng.')
        }
    }

    const getVal = (key: string, def: string) => localValues[key] || def

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
               <div className="relative">
                  <div className="size-20 rounded-full border-4 border-md-primary/10 border-t-md-primary animate-spin" />
                  <Settings2 className="absolute inset-0 m-auto text-md-primary animate-pulse" size={32} />
               </div>
               <p className="font-bold text-md-on-surface-variant text-sm tracking-tight">Đang tải cấu hình hệ thống...</p>
            </div>
        )
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">Cấu hình Hệ thống</h2>
                    <p className="text-md-on-surface-variant font-medium opacity-70">Quản lý các thông số vận hành, bảo mật và thông báo toàn hệ thống.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRestoreDefaults}
                        className="flex items-center gap-2 px-6 py-3 bg-md-surface-container text-md-on-surface-variant rounded-full font-bold text-sm hover:bg-md-error hover:text-white transition-all active:scale-95"
                    >
                        <RotateCcw size={18} />
                        <span>Khôi phục gốc</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-8 py-3 bg-md-primary text-white rounded-full font-bold text-sm shadow-elevation-2 hover:shadow-elevation-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {updateMutation.isPending ? <Loader2 className="size-5 animate-spin" /> : <Save size={18} />}
                        <span>Lưu thay đổi</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Left Side: Critical Settings */}
                <div className="md:col-span-7 space-y-10">
                    {/* 1. Ngưỡng cảnh báo sức khỏe */}
                    <Section 
                      icon={Activity} 
                      title="Ngưỡng cảnh báo sức khỏe" 
                      color="bg-md-error-container text-md-on-error-container"
                    >
                        <div className="space-y-10 py-4">
                            <ThresholdModule 
                                icon={Heart}
                                label="Nhịp tim (BPM)"
                                desc="Bradycardia & Tachycardia thresholds"
                                inputs={[
                                    { label: 'Tối thiểu', value: getVal('threshold.heartRate.low', '50'), key: 'threshold.heartRate.low' },
                                    { label: 'Tối đa', value: getVal('threshold.heartRate.high', '140'), key: 'threshold.heartRate.high' }
                                ]}
                                onChange={handleChange}
                            />
                            
                            <ThresholdModule 
                                icon={Thermometer}
                                label="Huyết áp (mmHg)"
                                desc="Systolic & Diastolic high limits"
                                inputs={[
                                    { label: 'Tâm thu (Max)', value: getVal('threshold.systolic.high', '140'), key: 'threshold.systolic.high' },
                                    { label: 'Tâm trương (Max)', value: getVal('threshold.diastolic.high', '90'), key: 'threshold.diastolic.high' }
                                ]}
                                onChange={handleChange}
                            />

                            <ThresholdModule 
                                icon={Droplets}
                                label="Đường huyết (mmol/L)"
                                desc="Fasting & Post-meal limits"
                                inputs={[
                                    { label: 'Lúc đói (Max)', value: getVal('threshold.glucose.fasting.high', '7.0'), key: 'threshold.glucose.fasting.high' },
                                    { label: 'Sau ăn (Max)', value: getVal('threshold.glucose.afterMeal.high', '11.0'), key: 'threshold.glucose.afterMeal.high' }
                                ]}
                                onChange={handleChange}
                            />
                        </div>
                    </Section>

                    {/* 2. Chính sách bảo mật */}
                    <Section 
                      icon={Shield} 
                      title="An toàn & Bảo mật" 
                      color="bg-md-primary-container text-md-on-primary-container"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-4">
                            <MD3Select 
                                label="Độ dài mật khẩu"
                                value={getVal('password.min_length', '8')}
                                onChange={(val: string) => handleChange('password.min_length', val)}
                                options={[
                                    { label: '8 ký tự', value: '8' },
                                    { label: '10 ký tự', value: '10' },
                                    { label: '12 ký tự', value: '12' }
                                ]}
                            />
                            <MD3Select 
                                label="Thời hạn mật khẩu"
                                value={getVal('password.expiry_days', '90')}
                                onChange={(val: string) => handleChange('password.expiry_days', val)}
                                options={[
                                    { label: '30 ngày', value: '30' },
                                    { label: '90 ngày', value: '90' },
                                    { label: 'Vô thời hạn', value: '0' }
                                ]}
                            />
                            <div className="sm:col-span-2 space-y-4 pt-4 border-t border-md-outline/5">
                                <MD3Checkbox 
                                  label="Yêu cầu ký tự đặc biệt (@#$...)" 
                                  checked={getVal('password.require_special_char', 'true') === 'true'}
                                  onChange={(v: boolean) => handleChange('password.require_special_char', v ? 'true' : 'false')}
                                />
                                <MD3Checkbox 
                                  label="Yêu cầu chữ hoa & chữ số" 
                                  checked={getVal('password.require_uppercase_number', 'true') === 'true'}
                                  onChange={(v: boolean) => handleChange('password.require_uppercase_number', v ? 'true' : 'false')}
                                />
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Right Side: Operational Settings */}
                <div className="md:col-span-5 space-y-10">
                    {/* 3. Cấu hình thông báo */}
                    <Section icon={Bell} title="Thông báo đa kênh" color="bg-md-secondary-container text-md-on-secondary-container">
                        <div className="divide-y divide-md-outline/5 -mx-2">
                           <NotificationItem 
                                label="Cảnh báo sức khỏe cấp cứu" 
                                channels={{ app: true, sms: true, email: true }}
                                values={{
                                    app: getVal('notification.health_alert.app', 'true') === 'true',
                                    sms: getVal('notification.health_alert.sms', 'true') === 'true',
                                    email: getVal('notification.health_alert.email', 'true') === 'true'
                                }}
                                onChange={(chan: string, val: boolean) => handleChange(`notification.health_alert.${chan}`, val ? 'true' : 'false')}
                           />
                           <NotificationItem 
                                label="Nhắc lịch uống thuốc" 
                                channels={{ app: true }}
                                values={{ app: getVal('notification.medication.app', 'true') === 'true' }}
                                onChange={(chan: string, val: boolean) => handleChange(`notification.medication.${chan}`, val ? 'true' : 'false')}
                           />
                           <NotificationItem 
                                label="Báo cáo sức khỏe định kỳ" 
                                channels={{ email: true }}
                                values={{ email: getVal('notification.periodic_report.email', 'true') === 'true' }}
                                onChange={(chan: string, val: boolean) => handleChange(`notification.periodic_report.${chan}`, val ? 'true' : 'false')}
                           />
                        </div>
                    </Section>

                    {/* 4. Cấu hình vận hành */}
                    <Section icon={Globe} title="Vận hành hệ thống" color="bg-md-surface-container-high text-md-on-surface">
                        <div className="space-y-6 py-4">
                            <MD3Select 
                                label="Ngôn ngữ mặc định"
                                icon={Globe}
                                value={getVal('system.language', 'vi')}
                                onChange={(v: string) => handleChange('system.language', v)}
                                options={[
                                    { label: 'Tiếng Việt', value: 'vi' },
                                    { label: 'English', value: 'en' }
                                ]}
                            />
                            <MD3Select 
                                label="Múi giờ hệ thống"
                                icon={Clock}
                                value={getVal('system.timezone', 'Asia/Ho_Chi_Minh')}
                                onChange={(v: string) => handleChange('system.timezone', v)}
                                options={[
                                    { label: 'Bangkok, Hanoi (GMT+7)', value: 'Asia/Ho_Chi_Minh' },
                                    { label: 'UTC (Greenwich)', value: 'UTC' }
                                ]}
                            />
                            
                            <div className="pt-6 border-t border-md-outline/10">
                                <div className="flex items-center justify-between p-4 bg-md-surface-container-low rounded-3xl border border-md-outline/5 group hover:border-md-error/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-md-error/10 text-md-error flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-md-on-surface">Chế độ bảo trì</p>
                                            <p className="text-[10px] text-md-on-surface-variant font-medium opacity-60">Ngừng truy cập người dùng</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={getVal('system.maintenance_mode', 'false') === 'true'}
                                            onChange={(e) => handleChange('system.maintenance_mode', e.target.checked ? 'true' : 'false')}
                                        />
                                        <div className="w-11 h-6 bg-md-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-md-error"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    )
}

/* --- Styled Components --- */

function Section({ icon: Icon, title, children, color }: any) {
    return (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[40px] border border-md-outline/10 shadow-sm overflow-hidden"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className={`size-12 rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
                    <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-md-on-surface tracking-tight">{title}</h3>
            </div>
            {children}
        </motion.section>
    )
}

function ThresholdModule({ icon: Icon, label, desc, inputs, onChange }: any) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Icon className="text-md-primary/60" size={18} />
                <div>
                   <h4 className="text-sm font-bold text-md-on-surface leading-none">{label}</h4>
                   <p className="text-[10px] text-md-on-surface-variant opacity-50 mt-1 uppercase font-bold tracking-wider">{desc}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                {inputs.map((inp: any) => (
                    <div key={inp.key} className="space-y-2 group">
                        <span className="text-[11px] font-bold text-md-on-surface-variant opacity-60 ml-1 block">{inp.label}</span>
                        <div className="relative">
                            <input 
                                type="number"
                                step="any"
                                value={inp.value}
                                onChange={(e) => onChange(inp.key, e.target.value)}
                                className="w-full h-12 px-4 bg-md-surface-container-low border border-md-outline/5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-md-primary/20 focus:border-md-primary transition-all outline-none"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function MD3Select({ label, icon: Icon, value, onChange, options }: any) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-md-on-surface-variant opacity-60 ml-1 block">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant" size={18} />}
                <select 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full h-12 ${Icon ? 'pl-11' : 'px-4'} pr-10 bg-md-surface-container-low border border-md-outline/5 rounded-2xl text-sm font-bold appearance-none hover:bg-md-primary/5 focus:ring-2 focus:ring-md-primary/20 transition-all cursor-pointer`}
                >
                    {options.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <ArrowRight size={16} className="rotate-90" />
                </div>
            </div>
        </div>
    )
}

function MD3Checkbox({ label, checked, onChange }: any) {
    return (
        <label className="flex items-center gap-4 p-4 rounded-3xl hover:bg-md-primary/5 transition-all cursor-pointer group">
            <div className="relative size-6">
                <input 
                    type="checkbox" 
                    className="size-6 border-2 border-md-outline/30 rounded-lg appearance-none checked:bg-md-primary checked:border-md-primary transition-all cursor-pointer"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <AnimatePresence>
                    {checked && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <Check size={16} className="text-white" strokeWidth={4} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <span className="text-sm font-bold text-md-on-surface-variant group-hover:text-md-on-surface transition-colors">{label}</span>
        </label>
    )
}

function NotificationItem({ label, channels, values, onChange }: any) {
    return (
        <div className="p-4 py-6 hover:bg-md-surface-container-low rounded-[24px] transition-all group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-sm font-bold text-md-on-surface group-hover:text-md-primary transition-colors">{label}</span>
                <div className="flex items-center gap-2">
                    {channels.app && (
                        <ChannelToggle icon={Smartphone} label="App" active={values.app} onToggle={(v: boolean) => onChange('app', v)} />
                    )}
                    {channels.sms && (
                        <ChannelToggle icon={BellRing} label="SMS" active={values.sms} onToggle={(v: boolean) => onChange('sms', v)} />
                    )}
                    {channels.email && (
                        <ChannelToggle icon={Globe} label="Email" active={values.email} onToggle={(v: boolean) => onChange('email', v)} />
                    )}
                </div>
            </div>
        </div>
    )
}

function ChannelToggle({ icon: Icon, label, active, onToggle }: any) {
    return (
        <button 
            onClick={() => onToggle(!active)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${active ? 'bg-md-primary/10 border-md-primary/30 text-md-primary' : 'bg-transparent border-md-outline/10 text-md-on-surface-variant opacity-40 hover:opacity-100 hover:bg-md-surface-container'}`}
        >
            <Icon size={14} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
        </button>
    )
}
