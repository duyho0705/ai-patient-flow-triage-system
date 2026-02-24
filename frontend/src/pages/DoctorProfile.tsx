import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getDoctorProfile } from '@/api/doctor'
import { User, Shield, Clock, Phone, Mail } from 'lucide-react'

const CustomStarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
)

export function DoctorProfile() {
    const { user } = useAuth()
    const { headers } = useTenant()

    const { data: profile, isLoading } = useQuery({
        queryKey: ['doctor-profile'],
        queryFn: () => getDoctorProfile(headers),
        enabled: !!headers?.tenantId,
        retry: false
    })

    if (isLoading) return <div className="p-8 animate-pulse text-slate-400">Đang tải hồ sơ...</div>

    // If no doctor profile, show generic staff/admin profile
    const displayProfile = profile || {
        name: user?.fullNameVi || 'Người dùng',
        specialty: (user?.roles?.[0] || 'Nhân viên').toUpperCase(),
        online: true,
        email: user?.email || '—'
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Banner */}
            <div className="relative h-48 rounded-[3rem] bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Profile Info Card */}
            <div className="-mt-24 relative px-8 flex flex-col md:flex-row gap-8 items-end md:items-center">
                <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl border-4 border-white overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                        <User className="w-20 h-20" />
                    </div>
                </div>
                <div className="flex-1 pb-4">
                    <div className="flex flex-wrap items-center gap-4 mb-2">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tightest uppercase">{displayProfile.name}</h1>
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">
                            {displayProfile.online ? 'Trực tuyến' : 'Ngoại tuyến'}
                        </span>
                    </div>
                    <p className="text-xl font-bold text-blue-600 tracking-tight">{displayProfile.specialty}</p>
                </div>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                    Chỉnh sửa hồ sơ
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                {/* Stats */}
                <div className="md:col-span-1 space-y-6">
                    <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Shield className="w-4 h-4 text-blue-500" />
                            Thông tin định danh
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Email công việc</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{(displayProfile as any).email || 'doctor@patientflow.ai'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Số điện thoại</p>
                                    <p className="text-sm font-bold text-slate-900">+84 123 456 789</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">Trạng thái làm việc</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="text-xs font-bold text-slate-400">Ca làm việc</span>
                                    <span className="text-sm font-black text-white">Sáng (07:30 - 11:30)</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <span className="text-xs font-bold text-slate-400">Khu vực</span>
                                    <span className="text-sm font-black text-white italic">Khu A - Tầng 2</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600/20 blur-3xl" />
                    </section>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-4">
                            Tóm tắt chuyên môn
                            <div className="h-px flex-1 bg-slate-50" />
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-inner">
                                    <CustomStarIcon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 leading-none mb-2">Bằng cấp & Chứng chỉ</h4>
                                    <p className="text-sm font-bold text-slate-500 leading-relaxed italic">Thạc sĩ Y khoa - Chuyên ngành Nội khoa tổng quát, Đại học Y Dược TP.HCM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 leading-none mb-2">Kinh nghiệm</h4>
                                    <p className="text-sm font-bold text-slate-500 leading-relaxed">Hơn 10 năm công tác tại các bệnh viện trung ương, chuyên sâu về điều trị các bệnh mãn tính.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Mô tả chi tiết</h4>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-blue-500 pl-6 py-2">
                                "Tận tâm chăm sóc sức khỏe cộng đồng bằng việc ứng dụng các công nghệ y học hiện đại và chuẩn mực quản lý bệnh lý mãn tính. Luôn hướng tới sự an tâm và chính xác tuyệt đối trong mọi lộ trình điều trị."
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
