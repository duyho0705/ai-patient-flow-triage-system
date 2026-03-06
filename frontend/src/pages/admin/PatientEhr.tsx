import { useNavigate, useParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PrescriptionModal } from '@/components/modals/PrescriptionModal'
import { AppointmentModal } from '@/components/modals/AppointmentModal'
import { ThresholdModal } from '@/components/modals/ThresholdModal'
import { useTenant } from '@/context/TenantContext'
import { getPatientFullProfile, getPatientClinicalSummary } from '@/api/doctor'
import { getPatientHealthMetrics, getPatientHealthTrends, METRIC_TYPE_UNITS } from '@/api/doctorHealth'
import { Loader2 } from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

export function PatientEhr() {
    const navigate = useNavigate()
    const { patientId } = useParams()
    const { headers, tenantId } = useTenant()

    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
    const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false)
    const [chartDays, setChartDays] = useState(30)

    // ─── Lấy Thông tin bệnh nhân ───
    const { data: profile, isLoading: loadingProfile } = useQuery({
        queryKey: ['patient-full-profile', tenantId, patientId],
        queryFn: () => getPatientFullProfile(patientId!, headers),
        enabled: !!patientId && !!tenantId
    })

    // ─── Lấy Tóm tắt lâm sàng (có thể đang trả về chuỗi text từ AI) ───
    const { data: clinicalSummary } = useQuery({
        queryKey: ['patient-clinical-summary', tenantId, patientId],
        queryFn: () => getPatientClinicalSummary(patientId!, headers),
        enabled: !!patientId && !!tenantId
    })

    // ─── Lấy Chỉ số Sinh tồn Hiện tại ───
    const { data: metrics } = useQuery({
        queryKey: ['patient-health-metrics', tenantId, patientId],
        queryFn: () => getPatientHealthMetrics(patientId!, headers),
        enabled: !!patientId && !!tenantId
    })

    // ─── Lấy Xu hướng (Charts) ───
    const { data: sysTrends } = useQuery({
        queryKey: ['patient-trends', 'BLOOD_PRESSURE_SYS', chartDays, tenantId, patientId],
        queryFn: () => getPatientHealthTrends(patientId!, 'BLOOD_PRESSURE_SYS', headers, chartDays),
        enabled: !!patientId && !!tenantId
    })

    const { data: gluTrends } = useQuery({
        queryKey: ['patient-trends', 'BLOOD_GLUCOSE', chartDays, tenantId, patientId],
        queryFn: () => getPatientHealthTrends(patientId!, 'BLOOD_GLUCOSE', headers, chartDays),
        enabled: !!patientId && !!tenantId
    })

    // ─── Helper: Chỉ số hiển thị trên thẻ (Vitals) ───
    const getMetricValue = (type: string) => {
        const met = (metrics || []).filter(m => m.metricType === type).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
        return met ? Number(met.value).toFixed(type === 'BLOOD_GLUCOSE' || type === 'BMI' ? 1 : 0) : '--'
    }

    const getMetricStatus = (type: string) => {
        const met = (metrics || []).filter(m => m.metricType === type).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
        if (!met) return { label: 'CHƯA ĐO', color: 'slate' }
        if (met.status === 'CRITICAL') return { label: 'NGUY HIỂM', color: 'red' }
        if (met.status === 'WARNING') return { label: 'CẢNH BÁO', color: 'amber' }
        return { label: 'BÌNH THƯỜNG', color: 'primary' }
    }

    // ─── Ghép dữ liệu sys/glu theo ngày cho biểu đồ ───
    const chartData = useMemo(() => {
        if (!sysTrends && !gluTrends) return []
        const map = new Map<string, any>()

        // Helper format date sang dd/MM
        const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

        sysTrends?.forEach(t => {
            const date = formatDate(t.recordedAt)
            if (!map.has(date)) map.set(date, { date, sortTime: new Date(t.recordedAt).getTime() })
            map.get(date)!.sys = t.value
        })

        gluTrends?.forEach(t => {
            const date = formatDate(t.recordedAt)
            if (!map.has(date)) map.set(date, { date, sortTime: new Date(t.recordedAt).getTime() })
            map.get(date)!.glu = t.value
        })

        // Sort theo thời gian
        return Array.from(map.values()).sort((a, b) => a.sortTime - b.sortTime)
    }, [sysTrends, gluTrends])

    // Lấy tuổi
    const getAge = (dob?: string) => {
        if (!dob) return '--'
        const diff = Date.now() - new Date(dob).getTime()
        return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
    }

    if (loadingProfile) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400 font-display">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="font-bold text-sm uppercase tracking-widest">Đang tải hồ sơ bệnh nhân...</p>
            </div>
        )
    }

    const patientName = profile?.fullNameVi || 'Khách hàng'

    return (
        <div className="font-display bg-background-light dark:bg-background-dark p-8">
            {/* Breadcrumb & Actions */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <button
                            onClick={() => navigate('/patients')}
                            className="text-slate-500 hover:text-primary transition-colors bg-transparent border-none cursor-pointer font-bold"
                        >
                            Danh sách bệnh nhân
                        </button>
                        <span className="material-symbols-outlined text-slate-400 text-sm leading-none">chevron_right</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{patientName}</span>
                    </nav>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setIsThresholdModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 text-sm font-bold transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">settings</span>
                            Thiết lập ngưỡng cảnh báo
                        </button>
                        <button
                            onClick={() => setIsPrescriptionModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 text-sm shadow-lg shadow-primary/20 transition-all font-bold"
                        >
                            <span className="material-symbols-outlined text-lg">medical_services</span>
                            Kê đơn thuốc điện tử
                        </button>
                    </div>
                </div>

                {/* Patient Summary Card */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6">
                        <div className="relative shrink-0 flex items-center justify-center">
                            <div className="size-32 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center overflow-hidden">
                                {profile?.avatarUrl ? (
                                    <img className="size-full object-cover" alt={patientName} src={profile.avatarUrl} />
                                ) : (
                                    <span className="text-4xl font-black text-slate-300 dark:text-slate-600">{patientName.charAt(0)}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 size-8 bg-primary rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xs">verified_user</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{patientName}</h2>
                                    {/* Mức độ nguy cơ lấy từ tóm tắt hệ thống (tạm thời Hardcode mock nhãn nếu không có) */}
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${metrics?.some(m => m.status === 'CRITICAL') ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'}`}>
                                        {metrics?.some(m => m.status === 'CRITICAL') ? 'Nguy cơ cao' : 'Khá ổn định'}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm mt-1">{profile?.gender === 'MALE' ? 'Nam' : profile?.gender === 'FEMALE' ? 'Nữ' : 'Chưa rõ'}, {getAge(profile?.dateOfBirth)} tuổi • ID: {profile?.id?.slice(0, 8)} • SĐT: {profile?.phone || '--'}</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-400 uppercase font-extrabold">CCCD / CMND</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile?.cccd || '--'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-400 uppercase font-extrabold">Dị ứng</p>
                                    <p className="text-sm font-bold text-red-500">Chưa ghi nhận</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-400 uppercase font-extrabold">Dân tộc</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile?.ethnicity || 'Kinh'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/20 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">Thao tác nhanh</h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-semibold">Kết nối trực tiếp với bệnh nhân</p>
                            </div>
                            <div className="size-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined font-bold">bolt</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setIsAppointmentModalOpen(true)}
                                className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:shadow-md transition-all active:scale-[0.98]"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-xl">event_available</span>
                                    Đặt lịch tái khám
                                </span>
                                <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/chat')}
                                className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:shadow-md transition-all active:scale-[0.98]"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-xl">forum</span>
                                    Gửi tin nhắn tư vấn
                                </span>
                                <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vitals Dashboard */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <VitalCard
                        icon="favorite"
                        label="Nhịp tim"
                        value={getMetricValue('HEART_RATE')}
                        unit={METRIC_TYPE_UNITS['HEART_RATE']}
                        status={getMetricStatus('HEART_RATE').label}
                        statusColor={getMetricStatus('HEART_RATE').color}
                    />
                    <VitalCard
                        icon="blood_pressure"
                        label="H/Áp (Tâm thu)"
                        value={getMetricValue('BLOOD_PRESSURE_SYS')}
                        unit={METRIC_TYPE_UNITS['BLOOD_PRESSURE_SYS']}
                        status={getMetricStatus('BLOOD_PRESSURE_SYS').label}
                        statusColor={getMetricStatus('BLOOD_PRESSURE_SYS').color}
                    />
                    <VitalCard
                        icon="bloodtype"
                        label="Đường huyết"
                        value={getMetricValue('BLOOD_GLUCOSE')}
                        unit={METRIC_TYPE_UNITS['BLOOD_GLUCOSE']}
                        status={getMetricStatus('BLOOD_GLUCOSE').label}
                        statusColor={getMetricStatus('BLOOD_GLUCOSE').color}
                    />
                    <VitalCard
                        icon="air"
                        label="SpO2"
                        value={getMetricValue('SPO2')}
                        unit={METRIC_TYPE_UNITS['SPO2']}
                        status={getMetricStatus('SPO2').label}
                        statusColor={getMetricStatus('SPO2').color}
                    />
                    <VitalCard
                        icon="body_fat"
                        label="Chỉ số BMI"
                        value={getMetricValue('BMI')}
                        unit={METRIC_TYPE_UNITS['BMI']}
                        status={getMetricStatus('BMI').label}
                        statusColor={getMetricStatus('BMI').color}
                    />
                </div>

                {/* Main Grid */}
                <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8 pb-12">
                    {/* Left: Charts & History */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* Interactive Chart Container */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Xu hướng chỉ số ({chartDays} ngày)</h3>
                                    <p className="text-sm text-slate-500 font-semibold">Biểu đồ so sánh Huyết áp & Đường huyết (từ Cảm biến/Bệnh nhân)</p>
                                </div>
                                <select
                                    value={chartDays}
                                    onChange={(e) => setChartDays(Number(e.target.value))}
                                    className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-bold focus:ring-primary/50 py-2 px-3 cursor-pointer outline-none"
                                >
                                    <option value={7}>7 ngày qua</option>
                                    <option value={14}>14 ngày qua</option>
                                    <option value={30}>30 ngày qua</option>
                                    <option value={90}>90 ngày qua</option>
                                </select>
                            </div>
                            <div className="h-64 w-full relative">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                                dy={10}
                                            />
                                            <YAxis hide domain={['auto', 'auto']} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: 'none',
                                                    borderRadius: '16px',
                                                    padding: '12px',
                                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                                                }}
                                                itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                                                labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
                                            />
                                            <Line
                                                name="Huyết áp tâm thu"
                                                type="monotone"
                                                dataKey="sys"
                                                stroke="#ef4444"
                                                strokeWidth={3}
                                                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                                activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
                                            />
                                            <Line
                                                name="Đường huyết"
                                                type="monotone"
                                                dataKey="glu"
                                                stroke="#4ade80"
                                                strokeWidth={3}
                                                dot={{ fill: '#4ade80', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                                activeDot={{ r: 6, strokeWidth: 0, fill: '#4ade80' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-xs">
                                        Không có dữ liệu thiết bị ({chartDays} ngày qua)
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-6 mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="size-3 rounded-full bg-red-500"></span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Huyết áp tâm thu</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="size-3 rounded-full bg-primary"></span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Đường huyết</span>
                                </div>
                            </div>
                        </div>

                        {/* Medical History Timeline */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Lịch sử khám bệnh</h3>
                            <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                                <TimelineItem
                                    date="Hôm nay"
                                    tag="Lâm sàng"
                                    title="Tóm tắt sức khỏe mới nhất"
                                    content={clinicalSummary || 'Chưa có phân tích lâm sàng từ hệ thống AI.'}
                                    isActive={true}
                                />
                                <TimelineItem
                                    date="05 Tháng 09, 2023"
                                    tag="Khám định kỳ"
                                    title="Kiểm tra huyết áp & Đo điện tâm đồ"
                                    content="Bệnh nhân có phản ứng tốt với phác đồ hiện tại. Chỉ số nhịp tim ổn định."
                                    diagnosis="Tăng huyết áp vô căn (nguyên phát)"
                                    isActive={false}
                                />
                            </div>
                            <button className="w-full mt-8 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors border border-dashed border-primary/30">
                                Xem tất cả lịch sử
                            </button>
                        </div>
                    </div>

                    {/* Right: Medications & Notes */}
                    <div className="space-y-8">
                        {/* Current Medications */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Đơn thuốc hiện tại</h3>
                                <span className="size-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-xl">pill</span>
                                </span>
                            </div>
                            <div className="space-y-4">
                                <MedicationItem
                                    name="Amlodipine 5mg"
                                    instruction="Uống 1 viên vào buổi sáng sau ăn"
                                    status="ĐANG DÙNG"
                                    daysLeft={12}
                                />
                                <MedicationItem
                                    name="Metformin 500mg"
                                    instruction="Uống 2 viên chia 2 lần (Sáng/Chiều)"
                                    status="ĐANG DÙNG"
                                    daysLeft={5}
                                />
                            </div>
                        </div>

                        {/* Notes/Alerts Section */}
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-red-500 font-bold">warning</span>
                                <h3 className="font-bold text-red-900 dark:text-red-400">Ghi chú AI phân tích</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-sm text-red-700 dark:text-red-300 font-semibold">
                                    <span className="material-symbols-outlined text-sm mt-1 scale-50">circle</span>
                                    {metrics?.some(m => m.status === 'CRITICAL') ? 'Có chỉ số báo động đỏ trong 24h qua! Cần ưu tiên kiểm tra.' : 'Mọi chỉ số hiện tại không vượt ngưỡng khẩn cấp.'}
                                </li>
                                <li className="flex gap-3 text-sm text-red-700 dark:text-red-300 font-semibold">
                                    <span className="material-symbols-outlined text-sm mt-1 scale-50">circle</span>
                                    Hệ thống cảnh báo tự động sẽ báo cho bệnh nhân nếu bỏ liều thuốc 3 ngày liên tiếp.
                                </li>
                            </ul>
                        </div>

                        {/* Care Team */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Đội ngũ chăm sóc</h3>
                            <div className="space-y-4">
                                <CareMember
                                    name="Hệ thống AI CDM"
                                    role="Giám sát 24/7"
                                    avatar="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png"
                                />
                                <CareMember
                                    name="Bác sĩ Phụ trách"
                                    role="BS Điều trị"
                                    avatar="https://ui-avatars.com/api/?name=BS+Phu+Thanh&background=random"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                patientName={patientName}
            />

            <AppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                patientName={patientName}
                patientId={patientId}
            />

            <ThresholdModal
                isOpen={isThresholdModalOpen}
                onClose={() => setIsThresholdModalOpen(false)}
                patientId={patientId}
            />
        </div>
    )
}

function VitalCard({ icon, label, value, unit, status, statusColor }: { icon: string, label: string, value: string, unit: string, status: string, statusColor: string }) {
    const colorClasses: Record<string, string> = {
        red: 'text-red-500 bg-red-50 dark:bg-red-900/20',
        amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
        primary: 'text-primary bg-primary/10',
        slate: 'text-slate-500 bg-slate-100 dark:bg-slate-800'
    }

    const iconColors: Record<string, string> = {
        red: 'text-red-500',
        amber: 'text-amber-500',
        primary: 'text-primary',
        slate: 'text-slate-400'
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors cursor-pointer">
            {statusColor === 'red' && <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-2xl bg-red-500 animate-pulse" />}
            <div className="flex items-center justify-between mb-2">
                <span className={`material-symbols-outlined ${iconColors[statusColor]}`}>{icon}</span>
                <span className={`text-[10px] font-extrabold ${colorClasses[statusColor]} px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm z-10`}>
                    {status}
                </span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-3">{label}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{value}</h4>
                <span className="text-[10px] text-slate-400 font-bold ml-1 tracking-wider">{unit}</span>
            </div>
        </div>
    )
}

function TimelineItem({ date, tag, title, content, diagnosis, isActive }: { date: string, tag: string, title: string, content: string, diagnosis?: string, isActive: boolean }) {
    return (
        <div className="relative pl-10">
            <div className={`absolute left-0 top-1 size-6 ${isActive ? 'bg-primary/20' : 'bg-slate-200 dark:bg-slate-700'} rounded-full flex items-center justify-center`}>
                <div className={`size-2.5 ${isActive ? 'bg-primary' : 'bg-slate-400'} rounded-full ${isActive ? 'shadow-[0_0_8px_rgba(74,222,128,0.5)]' : ''}`}></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{date}</p>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] rounded uppercase font-extrabold tracking-wider border border-slate-200 dark:border-slate-700 shadow-sm">
                    {tag}
                </span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-base">{title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
                {content}
            </p>
            {diagnosis && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs italic text-slate-500 font-semibold flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider">Chẩn đoán:</span>
                        <span className="text-primary">{diagnosis}</span>
                    </p>
                </div>
            )}
        </div>
    )
}

function MedicationItem({ name, instruction, status, daysLeft, isStopped }: { name: string, instruction: string, status: string, daysLeft?: number, isStopped?: boolean }) {
    return (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start">
                <h4 className={`font-bold text-sm ${isStopped ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{name}</h4>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${isStopped ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>{status}</span>
            </div>
            <p className={`text-xs mt-2 font-semibold ${isStopped ? 'text-slate-400' : 'text-slate-500'}`}>{instruction}</p>
            {!isStopped && daysLeft && (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-t border-slate-200 dark:border-slate-700 pt-3">
                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                    Còn <span className="text-primary">{daysLeft}</span> ngày thuốc
                </div>
            )}
        </div>
    )
}

function CareMember({ name, role, avatar }: { name: string, role: string, avatar: string }) {
    return (
        <div className="flex items-center gap-3 group">
            <div className="size-10 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 group-hover:border-primary transition-all overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 shadow-sm">
                {avatar ? (
                    <img className="size-full object-cover" alt={name} src={avatar} />
                ) : (
                    <span className="font-black text-slate-400 text-xs">{name.charAt(0)}</span>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{name}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{role}</p>
            </div>
            <button className="ml-auto p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95">
                <span className="material-symbols-outlined text-[16px]">chat</span>
            </button>
        </div>
    )
}
