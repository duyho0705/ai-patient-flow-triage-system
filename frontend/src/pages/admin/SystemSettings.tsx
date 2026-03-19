import { useState, useMemo, useEffect } from 'react'
import {
    Save,
    Activity,
    Loader2,
    ShieldCheck,
    BellRing,
    Settings2,
    AlertTriangle
} from 'lucide-react'
import { toastService } from '@/services/toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSystemSettings, updateSystemSetting } from '@/api/admin'

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
            toastService.success('✅ Đã cập nhật cấu hình hệ thống!')
        } catch (err) {
            toastService.error('Lỗi khi lưu cấu hình.')
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
            <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-gray-400 font-bold tracking-tight text-[10px]">Đang tải cấu hình hệ thống...</p>
            </div>
        )
    }

    return (
        <div className="w-full animate-in fade-in duration-700 font-sans space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-end text-left">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Cấu hình Hệ thống</h2>
                    <p className="text-neutral-500">Quản lý toàn bộ các thiết lập vận hành, bảo mật và thông báo của Sống Khỏe.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Lưu tất cả thay đổi
                </button>
            </div>

            <div className="grid grid-cols-12 gap-8 text-left">
                {/* Left Column: Alert Thresholds & Password Policy */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    {/* 1. Cài đặt ngưỡng cảnh báo (Alert Thresholds) */}
                    <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="p-5 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/50">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="font-bold text-neutral-800">Cài đặt ngưỡng cảnh báo</h3>
                        </div>
                        <div className="p-6 space-y-8">
                            {/* Heart Rate */}
                            <ThresholdGroup 
                                label="Nhịp tim (BPM)"
                                badge={`Dưới ${getVal('threshold.heartRate.low', '50')} hoặc Trên ${getVal('threshold.heartRate.high', '140')}`}
                                inputs={[
                                    { label: 'Ngưỡng thấp (Bradycardia)', value: getVal('threshold.heartRate.low', '50'), key: 'threshold.heartRate.low' },
                                    { label: 'Ngưỡng cao (Tachycardia)', value: getVal('threshold.heartRate.high', '140'), key: 'threshold.heartRate.high' }
                                ]}
                                onChange={handleChange}
                            />
                            
                            {/* Blood Pressure */}
                            <ThresholdGroup 
                                label="Huyết áp (mmHg)"
                                badge={`Huyết áp cao: Tâm thu > ${getVal('threshold.systolic.high', '140')}`}
                                badgeType="orange"
                                inputs={[
                                    { label: 'Tâm thu (Systolic) Max', value: getVal('threshold.systolic.high', '140'), key: 'threshold.systolic.high' },
                                    { label: 'Tâm trương (Diastolic) Max', value: getVal('threshold.diastolic.high', '90'), key: 'threshold.diastolic.high' }
                                ]}
                                onChange={handleChange}
                            />

                            {/* Blood Glucose */}
                            <div className="text-left">
                                <label className="text-sm font-semibold text-neutral-700 block mb-4">Chỉ số đường huyết (mmol/L)</label>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-xs text-neutral-500 block">Đường huyết lúc đói Max</span>
                                        <input 
                                            type="number"
                                            step="0.1"
                                            value={getVal('threshold.glucose.fasting.high', '7.0')}
                                            onChange={(e) => handleChange('threshold.glucose.fasting.high', e.target.value)}
                                            className="w-full text-sm border-neutral-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs text-neutral-500 block">Đường huyết sau ăn Max</span>
                                        <input 
                                            type="number"
                                            step="0.1"
                                            value={getVal('threshold.glucose.afterMeal.high', '11.0')}
                                            onChange={(e) => handleChange('threshold.glucose.afterMeal.high', e.target.value)}
                                            className="w-full text-sm border-neutral-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. Chính sách mật khẩu (Password Policy) */}
                    <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="p-5 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/50">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-neutral-800">Chính sách mật khẩu</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-semibold text-neutral-700 block">Độ dài tối thiểu</label>
                                    <select 
                                        className="w-full text-sm border-neutral-200 rounded-lg focus:ring-primary-500"
                                        value={getVal('password.min_length', '8')}
                                        onChange={(e) => handleChange('password.min_length', e.target.value)}
                                    >
                                        <option value="8">8 ký tự</option>
                                        <option value="10">10 ký tự</option>
                                        <option value="12">12 ký tự</option>
                                    </select>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-semibold text-neutral-700 block">Thời hạn mật khẩu</label>
                                    <select 
                                        className="w-full text-sm border-neutral-200 rounded-lg focus:ring-primary-500"
                                        value={getVal('password.expiry_days', '90')}
                                        onChange={(e) => handleChange('password.expiry_days', e.target.value)}
                                    >
                                        <option value="30">30 ngày</option>
                                        <option value="90">90 ngày</option>
                                        <option value="180">180 ngày</option>
                                        <option value="0">Không bao giờ hết hạn</option>
                                    </select>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-semibold text-neutral-700 block">Giới hạn đăng nhập sai</label>
                                    <select 
                                        className="w-full text-sm border-neutral-200 rounded-lg focus:ring-primary-500"
                                        value={getVal('password.max_failed_logins', '5')}
                                        onChange={(e) => handleChange('password.max_failed_logins', e.target.value)}
                                    >
                                        <option value="3">3 lần</option>
                                        <option value="5">5 lần</option>
                                        <option value="10">10 lần</option>
                                    </select>
                                </div>
                                <div className="space-y-4 pt-2 text-left">
                                    <CheckboxItem 
                                        label="Yêu cầu ký tự đặc biệt (@#$...)" 
                                        checked={getVal('password.require_special_char', 'true') === 'true'}
                                        onChange={(checked) => handleChange('password.require_special_char', checked ? 'true' : 'false')}
                                    />
                                    <CheckboxItem 
                                        label="Yêu cầu chữ hoa & số" 
                                        checked={getVal('password.require_uppercase_number', 'true') === 'true'}
                                        onChange={(checked) => handleChange('password.require_uppercase_number', checked ? 'true' : 'false')}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Notification Settings & General Config */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    {/* 2. Cài đặt thông báo (Notification Settings) */}
                    <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="p-5 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/50">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                                <BellRing className="w-5 h-5 text-primary-500" />
                            </div>
                            <h3 className="font-bold text-neutral-800">Cài đặt thông báo</h3>
                        </div>
                        <div className="p-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-neutral-400 font-bold tracking-widest border-b border-neutral-100">
                                        <th className="pb-3 text-left">Sự kiện hệ thống</th>
                                        <th className="pb-3 text-center">App</th>
                                        <th className="pb-3 text-center">SMS</th>
                                        <th className="pb-3 text-center">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    <NotificationRow 
                                        label="Cảnh báo sức khỏe khẩn cấp" 
                                        app={getVal('notification.health_alert.app', 'true') === 'true'} 
                                        sms={getVal('notification.health_alert.sms', 'true') === 'true'} 
                                        email={getVal('notification.health_alert.email', 'true') === 'true'}
                                        onChange={(subKey: string, val: boolean) => handleChange(`notification.health_alert.${subKey}`, val ? 'true' : 'false')}
                                    />
                                    <NotificationRow 
                                        label="Nhắc nhở uống thuốc" 
                                        app={getVal('notification.medication.app', 'true') === 'true'}
                                        onChange={(subKey: string, val: boolean) => handleChange(`notification.medication.${subKey}`, val ? 'true' : 'false')}
                                    />
                                    <NotificationRow 
                                        label="Đăng nhập từ thiết bị lạ" 
                                        app={getVal('notification.login_alert.app', 'true') === 'true'} 
                                        email={getVal('notification.login_alert.email', 'true') === 'true'}
                                        onChange={(subKey: string, val: boolean) => handleChange(`notification.login_alert.${subKey}`, val ? 'true' : 'false')}
                                    />
                                    <NotificationRow 
                                        label="Báo cáo tuần/tháng" 
                                        email={getVal('notification.periodic_report.email', 'true') === 'true'}
                                        onChange={(subKey: string, val: boolean) => handleChange(`notification.periodic_report.${subKey}`, val ? 'true' : 'false')}
                                    />
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 4. Cấu hình hệ thống (General System Config) */}
                    <section className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="p-5 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/50">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                                <Settings2 className="w-5 h-5 text-neutral-600" />
                            </div>
                            <h3 className="font-bold text-neutral-800">Cấu hình chung</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-semibold text-neutral-700 block">Ngôn ngữ mặc định</label>
                                <select 
                                    className="w-full text-sm border-neutral-200 rounded-lg focus:ring-primary-500"
                                    value={getVal('system.language', 'vi')}
                                    onChange={(e) => handleChange('system.language', e.target.value)}
                                >
                                    <option value="vi">Tiếng Việt (Vietnam)</option>
                                    <option value="en">English (United States)</option>
                                </select>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-semibold text-neutral-700 block">Múi giờ</label>
                                <select 
                                    className="w-full text-sm border-neutral-200 rounded-lg focus:ring-primary-500"
                                    value={getVal('system.timezone', 'Asia/Ho_Chi_Minh')}
                                    onChange={(e) => handleChange('system.timezone', e.target.value)}
                                >
                                    <option value="Asia/Ho_Chi_Minh">(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                                    <option value="UTC">(GMT+00:00) UTC</option>
                                </select>
                            </div>
                            <div className="pt-4 border-t border-neutral-100 space-y-4 text-left">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-800">Chế độ bảo trì</p>
                                        <p className="text-[11px] text-neutral-500">Tạm thời ngừng truy cập để nâng cấp</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={getVal('system.maintenance_mode', 'false') === 'true'}
                                            onChange={(e) => handleChange('system.maintenance_mode', e.target.checked ? 'true' : 'false')}
                                        />
                                        <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-12 pt-8 border-t border-neutral-200 text-left">
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-100 p-3 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-900">Khôi phục cài đặt gốc</h4>
                            <p className="text-sm text-red-700">Xóa toàn bộ cấu hình tùy chỉnh và quay về thiết lập ban đầu của hệ thống.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleRestoreDefaults}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                        Thực hiện Khôi phục
                    </button>
                </div>
            </div>
        </div>
    )
}

/* --- Shared Components --- */

function ThresholdGroup({ label, badge, badgeType = 'red', inputs, onChange }: any) {
    const badgeColors = {
        red: 'bg-red-50 text-red-600 border-red-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100'
    }
    return (
        <div className="text-left">
            <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-neutral-700">{label}</label>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 ${badgeColors[badgeType as keyof typeof badgeColors]} text-xs font-bold rounded-full border`}>
                        {badge}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                {inputs.map((inp: any) => (
                    <div key={inp.key} className="space-y-2">
                        <span className="text-xs text-neutral-500 block">{inp.label}</span>
                        <input 
                            type="number"
                            value={inp.value}
                            onChange={(e) => onChange(inp.key, e.target.value)}
                            className="w-full text-sm border-neutral-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

function CheckboxItem({ label, checked, onChange }: { label: string, checked?: boolean, onChange?: (checked: boolean) => void }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <input 
                type="checkbox" 
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500" 
            />
            <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">{label}</span>
        </label>
    )
}

function NotificationRow({ label, app, sms, email, onChange }: any) {
    return (
        <tr>
            <td className="py-4 text-neutral-700 font-medium text-left">{label}</td>
            <td className="py-4 text-center">
                <input 
                    type="checkbox" 
                    checked={app} 
                    onChange={(e) => onChange('app', e.target.checked)}
                    className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500" 
                />
            </td>
            <td className="py-4 text-center">
                <input 
                    type="checkbox" 
                    checked={sms} 
                    onChange={(e) => onChange('sms', e.target.checked)}
                    className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500" 
                />
            </td>
            <td className="py-4 text-center">
                <input 
                    type="checkbox" 
                    checked={email} 
                    onChange={(e) => onChange('email', e.target.checked)}
                    className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500" 
                />
            </td>
        </tr>
    )
}
