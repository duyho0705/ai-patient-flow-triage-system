import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { PrescriptionModal } from '@/components/modals/PrescriptionModal'

export function PatientEhr() {
    const navigate = useNavigate()
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)

    return (
        <div className="font-display bg-background-light dark:bg-background-dark p-8">
            {/* Breadcrumb & Actions */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <button
                            onClick={() => navigate('/patients')}
                            className="text-slate-500 hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                        >
                            Danh sách bệnh nhân
                        </button>
                        <span className="material-symbols-outlined text-slate-400 text-sm leading-none">chevron_right</span>
                        <span className="font-semibold text-slate-900 dark:text-white">Nguyễn Văn A</span>
                    </nav>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                            Xuất báo cáo PDF
                        </button>
                        <button
                            onClick={() => setIsPrescriptionModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 text-sm font-semibold shadow-lg shadow-primary/20 transition-all font-bold"
                        >
                            <span className="material-symbols-outlined text-lg">medical_services</span>
                            Kê đơn thuốc
                        </button>
                    </div>
                </div>

                {/* Patient Summary Card */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6">
                        <div className="relative shrink-0">
                            <img
                                className="size-32 rounded-2xl object-cover"
                                alt="Nguyễn Văn A"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQIVC5UVVnYFrHotJWRdOzSC_E3FBCQEoE184wQ53tVIU99mCmsnvpRBP8AxOgPqY4ybn9yh-ls0TdYzrW84tXyVp1chICLHuqh24SPAwmF-JJMZOAY5b6sWBcWHx0HE2pfkknQ3kbNOCOHncZou8wv9681_qfeqqF6ei7-c2tYKJiOih9gpWegaVqMzBBcsL__BBf1ERBs4ya9r4R9MusSrAo8G1F6a0xU-jwmEaQav_vPqmUpMzOJYXGCugRCcfNmQ_TNYls7KQ"
                            />
                            <div className="absolute -bottom-2 -right-2 size-8 bg-primary rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xs">verified_user</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Nguyễn Văn A</h2>
                                    <span className="px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded-full uppercase tracking-wider">
                                        Nguy cơ cao
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm mt-1">Nam, 65 tuổi • ID: BN0892 • Đã tham gia 2 năm</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-400 uppercase font-extrabold">Bệnh lý nền</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Cao huyết áp</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-400 uppercase font-extrabold">Dị ứng</p>
                                    <p className="text-sm font-bold text-red-500">Penicillin</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-400 uppercase font-extrabold">Nhóm máu</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">O+</p>
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
                            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:shadow-md transition-all active:scale-[0.98]">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-xl">event_available</span>
                                    Đặt lịch khám mới
                                </span>
                                <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:shadow-md transition-all active:scale-[0.98]">
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
                    <VitalCard icon="blood_pressure" label="Huyết áp" value="165/105" unit="mmHg" status="NGUY HIỂM" statusColor="red" />
                    <VitalCard icon="bloodtype" label="Đường huyết" value="5.8" unit="mmol/L" status="CẢNH BÁO" statusColor="amber" />
                    <VitalCard icon="favorite" label="Nhịp tim" value="82" unit="bpm" status="BÌNH THƯỜNG" statusColor="primary" />
                    <VitalCard icon="air" label="SpO2" value="98" unit="%" status="BÌNH THƯỜNG" statusColor="primary" />
                    <VitalCard icon="body_fat" label="Chỉ số BMI" value="24.5" unit="kg/m²" status="BÌNH THƯỜNG" statusColor="primary" />
                </div>

                {/* Main Grid */}
                <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8 pb-12">
                    {/* Left: Charts & History */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* Interactive Chart Container */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Xu hướng chỉ số (30 ngày)</h3>
                                    <p className="text-sm text-slate-500 font-semibold">Biểu đồ so sánh Huyết áp & Đường huyết</p>
                                </div>
                                <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-bold focus:ring-primary/50 py-2 px-3 cursor-pointer">
                                    <option>30 ngày qua</option>
                                    <option>90 ngày qua</option>
                                </select>
                            </div>
                            <div className="h-64 relative w-full overflow-hidden">
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
                                    <path d="M0,150 Q50,140 100,160 T200,130 T300,140 T400,110 T500,120 T600,80 T700,90 T800,60" fill="none" stroke="#4ade80" strokeWidth="3"></path>
                                    <path className="fill-primary/5" d="M0,150 Q50,140 100,160 T200,130 T300,140 T400,110 T500,120 T600,80 T700,90 T800,60 V200 H0 Z"></path>
                                    <path d="M0,100 Q50,90 100,110 T200,80 T300,90 T400,60 T500,70 T600,30 T700,40 T800,10" fill="none" stroke="#ef4444" strokeDasharray="5,5" strokeWidth="2"></path>
                                </svg>
                                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-400 font-extrabold uppercase pt-4">
                                    <span>01/10</span><span>07/10</span><span>14/10</span><span>21/10</span><span>28/10</span>
                                </div>
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
                                    date="20 Tháng 10, 2023"
                                    tag="Khám định kỳ"
                                    title="Kiểm tra huyết áp & Tư vấn dinh dưỡng"
                                    content="Bệnh nhân có dấu hiệu mệt mỏi, huyết áp tăng nhẹ. Khuyến nghị giảm muối trong khẩu phần ăn và tập thể dục nhẹ 15 phút mỗi ngày."
                                    diagnosis="Tăng huyết áp độ 2"
                                    isActive={true}
                                />
                                <TimelineItem
                                    date="05 Tháng 09, 2023"
                                    tag="Xét nghiệm"
                                    title="Xét nghiệm máu tổng quát"
                                    content="Chỉ số mỡ máu hơi cao (Cholesterol: 6.2 mmol/L). Các chỉ số khác trong ngưỡng bình thường."
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
                                <MedicationItem
                                    name="Lisinopril 10mg"
                                    instruction="Ngưng theo chỉ định ngày 20/10"
                                    status="ĐÃ NGƯNG"
                                    isStopped={true}
                                />
                            </div>
                        </div>

                        {/* Notes/Alerts Section */}
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-red-500 font-bold">warning</span>
                                <h3 className="font-bold text-red-900 dark:text-red-400">Ghi chú quan trọng</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-sm text-red-700 dark:text-red-300 font-semibold">
                                    <span className="material-symbols-outlined text-sm mt-1 scale-50">circle</span>
                                    Bệnh nhân có tiền sử sốc phản vệ với kháng sinh nhóm Penicillin.
                                </li>
                                <li className="flex gap-3 text-sm text-red-700 dark:text-red-300 font-semibold">
                                    <span className="material-symbols-outlined text-sm mt-1 scale-50">circle</span>
                                    Cần theo dõi sát chỉ số huyết áp tại nhà vào buổi sáng.
                                </li>
                            </ul>
                        </div>

                        {/* Care Team */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Đội ngũ chăm sóc</h3>
                            <div className="space-y-4">
                                <CareMember
                                    name="Điều dưỡng Minh Thư"
                                    role="Người phụ trách trực tiếp"
                                    avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuCAMdduUoZ4g5eUhX_ehc5zcKQppo-gzX7sAx_pX0v4a6tyRuFNh4Oy45uhXGDS3b-QX_RTdFzoF9uvu30YeAiRTCk1X9F9lvVcnMxL11XUER1qc7Jc7ve-P2bUzmEsYMMdq70C7pRQ3F_uzAbWVC_W2Gec6Wz58dI0s_GaTIfTEN2DB21dNoeNKbZv-k7ih-fxeBMfB5UN5sBpK6XOSb0KhsPgdqYUxolbX948pSeuliMslvIkD0t-H0yqIVPu3lRQfn8gdCyIl0Q"
                                />
                                <CareMember
                                    name="BS. Thu Hương"
                                    role="Chuyên gia dinh dưỡng"
                                    avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuAbaa9Nnp4OBpt2Q-ZsAEF0vD5RKT0pVLioM7Knawwta7yPZ9PS_zhI90RQSra0kWb9DEk1Wz_He3kw8aMjDnqZog3rFzgOehVH907u2Zhw_01A3apU3Ybi2ZxQ2snuxmYhMD8Q63Vj_sVLYtvzSDvnMLZJhMi6eUK3RiqedE5f3LLkYioNd397nGgGM9Nl6FECuTZEm_YZxP0-3j0NsAhQ5wh4yWV6AohVRztaS8n0CqB4QWDl731RFDzjAXsg0_YTXFT6ICS_bGc"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                patientName="Nguyễn Văn A"
            />
        </div>
    )
}

function VitalCard({ icon, label, value, unit, status, statusColor }: { icon: string, label: string, value: string, unit: string, status: string, statusColor: string }) {
    const colorClasses: Record<string, string> = {
        red: 'text-red-500 bg-red-50 dark:bg-red-900/20',
        amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
        primary: 'text-primary bg-primary/10'
    }

    const iconColors: Record<string, string> = {
        red: 'text-red-500',
        amber: 'text-amber-500',
        primary: 'text-primary'
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className={`material-symbols-outlined ${iconColors[statusColor]}`}>{icon}</span>
                <span className={`text-[10px] font-extrabold ${colorClasses[statusColor]} px-1.5 py-0.5 rounded uppercase`}>
                    {status}
                </span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{value}</h4>
                <span className="text-[10px] text-slate-400 font-bold">{unit}</span>
            </div>
        </div>
    )
}

function TimelineItem({ date, tag, title, content, diagnosis, isActive }: { date: string, tag: string, title: string, content: string, diagnosis?: string, isActive: boolean }) {
    return (
        <div className="relative pl-10">
            <div className={`absolute left-0 top-1 size-6 ${isActive ? 'bg-primary/20' : 'bg-slate-200 dark:bg-slate-700'} rounded-full flex items-center justify-center`}>
                <div className={`size-2.5 ${isActive ? 'bg-primary' : 'bg-slate-400'} rounded-full`}></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{date}</p>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] rounded uppercase font-extrabold tracking-wider border border-slate-200 dark:border-slate-700">
                    {tag}
                </span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-base">{title}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
                {content}
            </p>
            {diagnosis && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs italic text-slate-500 font-semibold text-primary">Chẩn đoán: {diagnosis}</p>
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
                <span className={`text-[10px] font-extrabold uppercase ${isStopped ? 'text-slate-400' : 'text-primary'}`}>{status}</span>
            </div>
            <p className={`text-xs mt-1 font-semibold ${isStopped ? 'text-slate-400' : 'text-slate-500'}`}>{instruction}</p>
            {!isStopped && daysLeft && (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    Còn {daysLeft} ngày thuốc
                </div>
            )}
        </div>
    )
}

function CareMember({ name, role, avatar }: { name: string, role: string, avatar: string }) {
    return (
        <div className="flex items-center gap-3 group">
            <img
                className="size-8 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all"
                alt={name}
                src={avatar}
            />
            <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{name}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{role}</p>
            </div>
            <button className="ml-auto p-1.5 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                <span className="material-symbols-outlined text-lg">chat</span>
            </button>
        </div>
    )
}
