import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import {
    User,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    Camera,
    Save,
    Loader2,
    Lock,
    X,
    Eye,
    EyeOff,
    Droplets,
    Ruler,
    Weight,
    History,
    AlertCircle,
    Edit3,
    Download
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { UpdatePatientProfileRequest, ChangePasswordRequest } from '@/types/api'
import { getPortalProfile, updatePortalProfile, changePortalPassword, uploadPortalAvatar } from '@/api/portal'


const genderMap: Record<string, string> = {
    'MALE': 'Nam',
    'FEMALE': 'Nữ',
    'OTHER': 'Khác'
}

export default function PatientProfile() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<UpdatePatientProfileRequest>({
        fullNameVi: '',
        dateOfBirth: '',
        gender: 'OTHER',
        phone: '',
        email: '',
        addressLine: '',
        city: '',
        district: '',
        ward: '',
        nationality: 'Việt Nam',
        ethnicity: 'Kinh',
        cccd: ''
    })

    // Password change state
    const [isPassModalOpen, setIsPassModalOpen] = useState(false)
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
    const [passErrors, setPassErrors] = useState<Record<string, string>>({})
    const [showOldPass, setShowOldPass] = useState(false)
    const [showNewPass, setShowNewPass] = useState(false)

    const { data: profile, isLoading } = useQuery({
        queryKey: ['portal-profile'],
        queryFn: () => getPortalProfile(headers),
        enabled: !!headers?.tenantId
    })

    useEffect(() => {
        if (profile) {
            setFormData({
                fullNameVi: profile.fullNameVi || '',
                dateOfBirth: profile.dateOfBirth || '',
                gender: profile.gender || 'OTHER',
                phone: profile.phone || '',
                email: profile.email || '',
                addressLine: profile.addressLine || '',
                city: profile.city || '',
                district: profile.district || '',
                ward: profile.ward || '',
                nationality: profile.nationality || 'Việt Nam',
                ethnicity: profile.ethnicity || 'Kinh',
                cccd: profile.cccd || ''
            })
        }
    }, [profile])

    const validateProfile = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.fullNameVi?.trim()) newErrors.fullNameVi = 'Họ tên không được để trống'
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ'
        }
        if (formData.phone && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0987654321)'
        }
        if (formData.dateOfBirth) {
            const dob = new Date(formData.dateOfBirth)
            if (dob > new Date()) newErrors.dateOfBirth = 'Ngày sinh không thể ở tương lai'
            if (isNaN(dob.getTime())) newErrors.dateOfBirth = 'Ngày sinh không hợp lệ'
        }
        return Object.keys(newErrors).length === 0
    }

    const validatePassword = () => {
        const newErrors: Record<string, string> = {}
        if (!passData.oldPassword) newErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ'

        const pass = passData.newPassword
        if (!pass) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới'
        } else if (pass.length < 8) {
            newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(pass)) {
            newErrors.newPassword = 'Mật khẩu phải bao gồm chữ hoa, chữ thường và số'
        } else if (pass === passData.oldPassword) {
            newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu cũ'
        }

        if (passData.confirmPassword !== passData.newPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
        }

        setPassErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const updateMutation = useMutation({
        mutationFn: (data: UpdatePatientProfileRequest) => updatePortalProfile(data, headers),
        onSuccess: () => {
            toast.success('Cập nhật hồ sơ thành công!')
            queryClient.invalidateQueries({ queryKey: ['portal-profile'] })
            setIsEditing(false)
        },
        onError: (err: any) => {
            if (err.details?.errors) {
                const newErrors: Record<string, string> = {}
                err.details.errors.forEach((e: any) => {
                    newErrors[e.field] = e.message
                })
                toast.error('Vui lòng kiểm tra lại các trường thông tin.')
            } else {
                toast.error(err.message || 'Có lỗi xảy ra khi cập nhật.')
            }
        }
    })

    const passwordMutation = useMutation({
        mutationFn: (data: ChangePasswordRequest) => changePortalPassword(data, headers),
        onSuccess: () => {
            toast.success('Đổi mật khẩu thành công!')
            setIsPassModalOpen(false)
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' })
            setPassErrors({})
        },
        onError: (err: any) => {
            toast.error(err.message || 'Mật khẩu cũ không đúng hoặc có lỗi xảy ra.')
        }
    })

    const handleSave = () => {
        if (validateProfile()) {
            updateMutation.mutate(formData)
        } else {
            toast.error('Vui lòng kiểm tra lại thông tin')
        }
    }

    const handleChangePass = (e: React.FormEvent) => {
        e.preventDefault()
        if (validatePassword()) {
            passwordMutation.mutate({
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            })
        }
    }

    const uploadMutation = useMutation({
        mutationFn: (file: File) => uploadPortalAvatar(file, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-profile'] })
            toast.success('Cập nhật ảnh đại diện thành công!')
        },
        onError: (error: any) => {
            toast.error('Lỗi: ' + error.message)
        }
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Kích thước ảnh không được vượt quá 2MB')
                return
            }
            uploadMutation.mutate(file)
        }
    }

    if (isLoading) return (
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#4ade80] animate-spin" />
        </div>
    )

    const profileData = profile as any

    return (
        <div className="space-y-8 pb-20 py-8">
            {/* 1. Header Card */}
            <header className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-[#4ade80]/5 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ade80]/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="relative flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative group">
                        <div className="w-36 h-36 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border-4 border-[#4ade80]/20 p-1 overflow-hidden shadow-2xl">
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full bg-[#4ade80] text-slate-900 flex items-center justify-center text-4xl font-black">
                                    {profile?.fullNameVi?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            id="avatar-upload-header"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="avatar-upload-header"
                            className="absolute bottom-1 right-1 bg-[#4ade80] text-slate-900 p-2.5 rounded-full border-4 border-white dark:border-slate-900 cursor-pointer shadow-lg hover:scale-110 transition-transform"
                        >
                            <Camera className="w-4 h-4" />
                        </label>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                {profile?.fullNameVi}
                            </h2>
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 w-fit mx-auto md:mx-0">
                                Đang theo dõi sức khỏe
                            </span>
                        </div>

                        <p className="text-sm font-bold text-slate-400">
                            Mã bệnh nhân: <span className="font-mono text-emerald-500 font-black">#ID-{profile?.id?.slice(0, 8).toUpperCase()}</span> • Tham gia tháng 01/2023
                        </p>

                        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                                    <Droplets className="w-4 h-4 text-rose-500" />
                                </div>
                                <span>Nhóm máu: {profileData?.bloodType || 'O+'}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                    <Ruler className="w-4 h-4 text-[#4ade80]" />
                                </div>
                                <span>Chiều cao: {profileData?.height || '172 cm'}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                                    <Weight className="w-4 h-4 text-blue-500" />
                                </div>
                                <span>Cân nặng: {profileData?.weight || '68 kg'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#4ade80] text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-[#4ade80]/20 hover:bg-[#4ade80]/90 hover:-translate-y-0.5 transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                            {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
                        </button>
                        <button className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all">
                            <Download className="w-4 h-4" />
                            Tải tóm tắt bệnh án
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* 2. Personal & Contact Info (Left/Middle) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Information Form/View */}
                    <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/20 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
                                    <User className="w-5 h-5 text-[#4ade80]" />
                                </div>
                                Thông tin cá nhân
                            </h3>
                            {isEditing && (
                                <button
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#4ade80] text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#4ade80]/20 active:scale-95 transition-all"
                                >
                                    {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    Lưu ngay
                                </button>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="group">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Số CCCD / Hộ chiếu</p>
                                    {isEditing && !profile?.cccd ? (
                                        <input
                                            type="text"
                                            value={formData.cccd}
                                            onChange={e => setFormData({ ...formData, cccd: e.target.value })}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Nhập số CCCD..."
                                        />
                                    ) : (
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            {profile?.cccd || '—'}
                                        </p>
                                    )}
                                </div>
                                <div className="group">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ngày sinh</p>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : '—'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="group">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Giới tính</p>
                                    {isEditing ? (
                                        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            {Object.entries(genderMap).map(([value, label]) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, gender: value })}
                                                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${formData.gender === value ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                            {genderMap[profile?.gender || ''] || '—'}
                                        </p>
                                    )}
                                </div>
                                <div className="group">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Dân tộc & Quốc tịch</p>
                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        {profile?.ethnicity || 'Kinh'} • {profile?.nationality || 'Việt Nam'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-slate-50 dark:border-slate-800">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                                    <Phone className="w-5 h-5 text-blue-500" />
                                </div>
                                Thông tin liên hệ
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-5 group">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Số điện thoại</p>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-transparent border-none font-black text-slate-700 dark:text-slate-200 focus:ring-0 p-0 text-sm"
                                            />
                                        ) : (
                                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{profile?.phone || 'Chưa cập nhật'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 group">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Địa chỉ Email</p>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-transparent border-none font-black text-slate-700 dark:text-slate-200 focus:ring-0 p-0 text-sm"
                                            />
                                        ) : (
                                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{profile?.email || 'Chưa cập nhật'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 group">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Địa chỉ thường trú</p>
                                        {isEditing ? (
                                            <textarea
                                                value={`${formData.addressLine || ''}, ${formData.ward || ''}, ${formData.district || ''}, ${formData.city || ''}`}
                                                onChange={e => setFormData({ ...formData, addressLine: e.target.value })}
                                                className="w-full bg-transparent border-none font-black text-slate-700 dark:text-slate-200 focus:ring-0 p-0 text-sm resize-none"
                                                rows={1}
                                            />
                                        ) : (
                                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                                                {[profile?.addressLine, profile?.ward, profile?.district, profile?.city].filter(Boolean).join(', ') || 'Chưa cập nhật'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 3. Summary & Emergency (Right Column) */}
                <div className="space-y-8">
                    {/* Medical Quick Summary */}
                    <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/20 border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-2xl">
                                <History className="w-5 h-5 text-rose-500" />
                            </div>
                            Tóm tắt y tế
                        </h3>

                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Bệnh lý mãn tính</p>
                                <div className="flex flex-wrap gap-2">
                                    {(profileData?.chronicConditions || []).map((cond: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-tight border border-rose-100 dark:border-rose-900/30">
                                            {cond}
                                        </span>
                                    ))}
                                    {(!profileData?.chronicConditions || profileData.chronicConditions.length === 0) && (
                                        <span className="text-xs font-bold text-slate-300 italic">Không có</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Tiền sử dị ứng</p>
                                <div className="flex flex-wrap gap-2">
                                    {(profileData?.allergies || []).map((alg: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-tight border border-orange-100 dark:border-orange-900/30">
                                            {alg}
                                        </span>
                                    ))}
                                    {(!profileData?.allergies || profileData.allergies.length === 0) && (
                                        <span className="text-xs font-bold text-slate-300 italic">Không có</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Thuốc đang sử dụng</p>
                                <ul className="space-y-3">
                                    {(profileData?.ongoingMedications || []).map((med: string, i: number) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 italic">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            {med}
                                        </li>
                                    ))}
                                    {(!profileData?.ongoingMedications || profileData.ongoingMedications.length === 0) && (
                                        <li className="text-xs font-bold text-slate-300 italic">Không có thuốc điều trị định kỳ</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Emergency Contact */}
                    <section className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[2.5rem] p-8 border-2 border-dashed border-emerald-500/20 relative">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500 text-white rounded-xl">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            Liên hệ khẩn cấp
                        </h3>

                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-emerald-500/10">
                            <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">
                                {profileData?.emergencyContact?.name || 'Chưa cài đặt'}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                Quan hệ: {profileData?.emergencyContact?.relationship || '—'}
                            </p>

                            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl w-fit">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm font-black">{profileData?.emergencyContact?.phone || '—'}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsPassModalOpen(true)}
                            className="mt-6 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
                        >
                            <Lock className="w-4 h-4" />
                            Đổi mật khẩu bảo mật
                        </button>
                    </section>
                </div>
            </div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {isPassModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPassModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-md relative z-10 shadow-24 border border-slate-100 dark:border-slate-800"
                        >
                            <button
                                onClick={() => setIsPassModalOpen(false)}
                                className="absolute top-8 right-8 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6 text-slate-300" />
                            </button>

                            <form onSubmit={handleChangePass} className="space-y-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Đổi mật khẩu</h3>
                                    <p className="text-slate-400 font-bold text-xs mt-1">Sử dụng mật khẩu mạnh để bảo vệ dữ liệu y tế.</p>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</p>
                                        <div className="relative">
                                            <input
                                                type={showOldPass ? 'text' : 'password'}
                                                required
                                                value={passData.oldPassword}
                                                onChange={e => {
                                                    setPassData({ ...passData, oldPassword: e.target.value })
                                                    if (passErrors.oldPassword) setPassErrors({ ...passErrors, oldPassword: '' })
                                                }}
                                                className={`w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border transition-all pr-12 font-black text-sm ${passErrors.oldPassword ? 'border-rose-300 bg-rose-50' : 'border-slate-100 dark:border-slate-700 focus:border-emerald-500'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOldPass(!showOldPass)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                                            >
                                                {showOldPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</p>
                                        <div className="relative">
                                            <input
                                                type={showNewPass ? 'text' : 'password'}
                                                required
                                                value={passData.newPassword}
                                                onChange={e => {
                                                    setPassData({ ...passData, newPassword: e.target.value })
                                                    if (passErrors.newPassword) setPassErrors({ ...passErrors, newPassword: '' })
                                                }}
                                                className={`w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border transition-all pr-12 font-black text-sm ${passErrors.newPassword ? 'border-rose-300 bg-rose-50' : 'border-slate-100 dark:border-slate-700 focus:border-emerald-500'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPass(!showNewPass)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                                            >
                                                {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordMutation.isPending}
                                    className="w-full py-5 bg-slate-900 dark:bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 dark:hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                                >
                                    {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Cập nhật mật khẩu ngay
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
