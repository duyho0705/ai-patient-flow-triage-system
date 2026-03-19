import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import {
    User,
    Phone,
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
    Download,
    Contact
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { UpdatePatientProfileRequest, ChangePasswordRequest } from '@/api-client'
import { getPortalProfile, updatePortalProfile, changePortalPassword, uploadPortalAvatar } from '@/api/portal'

// Extend api-client type with fields not yet in backend OpenAPI spec
type ExtendedProfileRequest = UpdatePatientProfileRequest & { height?: string; weight?: string }


const genderMap: Record<string, string> = {
    'MALE': 'Nam',
    'FEMALE': 'Nữ',
    'OTHER': 'Khác'
}

export default function PatientProfile() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<ExtendedProfileRequest>({
        fullNameVi: '',
        dateOfBirth: '',
        gender: 'OTHER',
        phone: '',
        email: '',
        addressLine: '',
        city: '',
        district: '',
        ward: '',
        nationality: '',
        ethnicity: '',
        cccd: '',
        height: '',
        weight: ''
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
                nationality: profile.nationality || '',
                ethnicity: profile.ethnicity || '',
                cccd: profile.cccd || '',
                height: profile.height || '',
                weight: profile.weight || ''
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
        mutationFn: (data: ExtendedProfileRequest) => updatePortalProfile(data as any, headers),
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
            <Loader2 className="w-10 h-10 text-[#10b981] animate-spin" />
        </div>
    )

    const profileData = profile as any

    return (
        <div className="space-y-8 pb-20 py-8">
            {/* 1. Header Card */}
            <header className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="relative flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative group">
                        <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border-4 border-[#10b981]/20 p-1 overflow-hidden shadow-lg">
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full bg-[#10b981] text-slate-900 flex items-center justify-center text-3xl font-bold">
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
                            className={`absolute bottom-1 right-1 bg-[#10b981] text-slate-900 p-2.5 rounded-full border-4 border-white dark:border-slate-900 cursor-pointer shadow-lg transition-transform ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        </label>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                {isEditing ? formData.fullNameVi : profile?.fullNameVi}
                            </h2>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 w-fit mx-auto md:mx-0">
                                Đang theo dõi sức khỏe
                            </span>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {profile?.createdAt && (
                                <>Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</>
                            )}
                        </p>

                        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                                    <Droplets className="w-4 h-4 text-rose-500" />
                                </div>
                                <span>Nhóm máu: {profileData?.bloodType || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                    <Ruler className="w-4 h-4 text-[#10b981]" />
                                </div>
                                <span>Chiều cao: {profileData?.height ? `${profileData.height} cm` : '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                                    <Weight className="w-4 h-4 text-blue-500" />
                                </div>
                                <span>Cân nặng: {profileData?.weight ? `${profileData.weight} kg` : '—'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#10b981] text-slate-900 font-bold text-sm rounded-lg hover:bg-[#10b981]/90 transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                            {isEditing ? 'Hủy Chỉnh Sửa' : 'Chỉnh Sửa Hồ Sơ'}
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Tải Tóm Tắt Bệnh Án
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* 2. Personal & Contact Info (Left/Middle) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Information Form/View */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-[#10b981]" />
                                Thông tin cá nhân
                            </h3>
                            {isEditing && (
                                <button
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-slate-900 rounded-lg font-bold text-sm hover:bg-[#10b981]/90 active:scale-95 transition-all"
                                >
                                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Lưu Thay Đổi
                                </button>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Họ và tên */}
                            <div className="group">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Họ và tên</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.fullNameVi}
                                        onChange={e => setFormData({ ...formData, fullNameVi: e.target.value })}
                                        className="w-full px-1 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-[#10b981] outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Nhập họ tên đầy đủ..."
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 px-1 py-2 border-b border-slate-100 dark:border-slate-800">
                                        {profile?.fullNameVi || '—'}
                                    </p>
                                )}
                            </div>

                            {/* CCCD */}
                            <div className="group">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Số CCCD / hộ chiếu</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.cccd}
                                        onChange={e => setFormData({ ...formData, cccd: e.target.value })}
                                        className="w-full px-1 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-[#10b981] outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Nhập số CCCD..."
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 px-1 py-2 border-b border-slate-100 dark:border-slate-800">
                                        {profile?.cccd || '—'}
                                    </p>
                                )}
                            </div>

                            {/* Ngày sinh */}
                            <div className="group">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Ngày sinh</p>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-sm text-slate-700 dark:text-slate-200 focus:border-emerald-500 outline-none transition-all"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 px-1 py-2 border-b border-slate-100 dark:border-slate-800">
                                        {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : '—'}
                                    </p>
                                )}
                            </div>

                            {/* Giới tính */}
                            <div className="group">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Giới tính</p>
                                {isEditing ? (
                                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 h-[42px]">
                                        {Object.entries(genderMap).map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, gender: value })}
                                                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${formData.gender === value ? 'bg-white dark:bg-slate-700 text-[#10b981] shadow-sm' : 'text-slate-400'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 px-1 py-2 border-b border-slate-100 dark:border-slate-800">
                                        {genderMap[profile?.gender || ''] || '—'}
                                    </p>
                                )}
                            </div>

                            {/* Chiều cao */}
                            <div className="group">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Chiều cao (cm)</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.height}
                                        onChange={e => setFormData({ ...formData, height: e.target.value })}
                                        className="w-full px-1 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-[#10b981] outline-none transition-all placeholder:text-slate-300"
                                        placeholder="172 cm..."
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 px-1 py-2 border-b border-slate-100 dark:border-slate-800">
                                        {profile?.height || '—'}
                                    </p>
                                )}
                            </div>

                            {/* Cân nặng */}
                            <div className="group">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Cân nặng (kg)</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.weight}
                                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full px-1 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-[#10b981] outline-none transition-all placeholder:text-slate-300"
                                        placeholder="68 kg..."
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 px-1 py-2 border-b border-slate-100 dark:border-slate-800">
                                        {profile?.weight || '—'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Information Contact Section */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Section: Liên hệ */}
                            <div className="sm:col-span-2 pb-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Contact className="w-5 h-5 text-[#10b981]" />
                                    Thông tin liên lạc
                                </h3>
                            </div>

                            {/* SĐT */}
                            <div className="group">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Số điện thoại</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-1 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-[#10b981] outline-none transition-all placeholder:text-slate-300"
                                        placeholder="0912345678..."
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 px-1 py-2 border-b border-slate-100 dark:border-slate-800">
                                        {profile?.phone || '—'}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="group">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Địa chỉ email</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-1 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-[#10b981] outline-none transition-all placeholder:text-slate-300"
                                        placeholder="example@gmail.com..."
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 px-1 py-2 border-b border-slate-100 dark:border-slate-800">
                                        {profile?.email || '—'}
                                    </p>
                                )}
                            </div>

                            {/* Địa chỉ - Số nhà */}
                            <div className="group sm:col-span-2">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.addressLine}
                                        onChange={e => setFormData({ ...formData, addressLine: e.target.value })}
                                        className="w-full px-1 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-[#10b981] outline-none transition-all placeholder:text-slate-300"
                                        placeholder="123 Đường ABC..."
                                    />
                                ) : null}
                            </div>

                            {isEditing ? (
                                <>
                                    <div className="group">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Phường / xã</p>
                                        <input
                                            type="text"
                                            value={formData.ward}
                                            onChange={e => setFormData({ ...formData, ward: e.target.value })}
                                            className="w-full px-1 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 font-medium text-sm text-slate-700 dark:text-slate-200 focus:border-[#10b981] outline-none transition-all"
                                            placeholder="Phường..."
                                        />
                                    </div>
                                    <div className="group">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Quận / huyện</p>
                                        <input
                                            type="text"
                                            value={formData.district}
                                            onChange={e => setFormData({ ...formData, district: e.target.value })}
                                            className="w-full px-1 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 font-medium text-sm text-slate-700 dark:text-slate-200 focus:border-[#10b981] outline-none transition-all"
                                            placeholder="Quận..."
                                        />
                                    </div>
                                    <div className="group">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Tỉnh / thành phố</p>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-1 py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 font-medium text-sm text-slate-700 dark:text-slate-200 focus:border-[#10b981] outline-none transition-all"
                                            placeholder="Thành phố..."
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="group sm:col-span-2">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Địa chỉ thường trú</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 px-1 py-2 border-b border-slate-100 dark:border-slate-800">
                                        {[profile?.addressLine, profile?.ward, profile?.district, profile?.city].filter(Boolean).join(', ') || 'Chưa cập nhật'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* 3. Summary & Emergency (Right Column) */}
                <div className="space-y-8">
                    {/* Medical Quick Summary */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <History className="w-5 h-5 text-[#10b981]" />
                            Tóm Tắt Y Tế
                        </h3>

                        <div className="space-y-8">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Bệnh lý mãn tính</p>
                                <div className="flex flex-wrap gap-2">
                                    {(profileData?.chronicConditions || []).map((cond: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-bold border border-red-100 dark:border-red-900/30">
                                            {cond}
                                        </span>
                                    ))}
                                    {(!profileData?.chronicConditions || profileData.chronicConditions.length === 0) && (
                                        <span className="text-sm font-medium text-slate-300 italic">Không có</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Tiền sử dị ứng</p>
                                <div className="flex flex-wrap gap-2">
                                    {(profileData?.allergies || []).map((alg: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold border border-orange-100 dark:border-orange-900/30">
                                            {alg}
                                        </span>
                                    ))}
                                    {(!profileData?.allergies || profileData.allergies.length === 0) && (
                                        <span className="text-sm font-medium text-slate-300 italic">Không có</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Thuốc đang sử dụng</p>
                                <ul className="space-y-3">
                                    {(profileData?.ongoingMedications || []).map((med: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 italic">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                                            {med}
                                        </li>
                                    ))}
                                    {(!profileData?.ongoingMedications || profileData.ongoingMedications.length === 0) && (
                                        <li className="text-xs font-medium text-slate-300 italic">Không có thuốc điều trị định kỳ</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Emergency Contact */}
                    <section className="bg-[#10b981]/10 dark:bg-[#10b981]/5 rounded-xl p-6 border-2 border-dashed border-[#10b981]/30 relative">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-[#10b981]" />
                            Liên Hệ Khẩn Cấp
                        </h3>

                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                                {profileData?.emergencyContact?.name || 'Chưa cài đặt'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                Quan hệ: {profileData?.emergencyContact?.relationship || '—'}
                            </p>

                            <div className="flex items-center gap-2 text-[#10b981]">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm font-bold">{profileData?.emergencyContact?.phone || '—'}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsPassModalOpen(true)}
                            className="mt-4 w-full text-xs font-bold text-slate-400 hover:text-[#10b981] transition-colors uppercase tracking-widest text-center py-3 flex items-center justify-center gap-2"
                        >
                            <Lock className="w-4 h-4" />
                            Đổi Mật Khẩu Bảo Mật
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
                            className="absolute inset-0"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-xl p-8 w-full max-w-md relative z-10 shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <button
                                onClick={() => setIsPassModalOpen(false)}
                                className="absolute top-8 right-8 p-2 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6 text-slate-300" />
                            </button>

                            <form onSubmit={handleChangePass} className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Đổi mật khẩu</h3>
                                    <p className="text-slate-400 font-medium text-xs mt-1">Sử dụng mật khẩu mạnh để bảo vệ dữ liệu y tế.</p>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Mật khẩu hiện tại</p>
                                        <div className="relative">
                                            <input
                                                type={showOldPass ? 'text' : 'password'}
                                                required
                                                value={passData.oldPassword}
                                                onChange={e => {
                                                    setPassData({ ...passData, oldPassword: e.target.value })
                                                    if (passErrors.oldPassword) setPassErrors({ ...passErrors, oldPassword: '' })
                                                }}
                                                className={`w-full px-1 py-2 bg-transparent border-b-2 transition-all pr-12 font-medium text-sm ${passErrors.oldPassword ? 'border-rose-300' : 'border-slate-200 dark:border-slate-800 focus:border-[#10b981]'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOldPass(!showOldPass)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors"
                                            >
                                                {showOldPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Mật khẩu mới</p>
                                        <div className="relative">
                                            <input
                                                type={showNewPass ? 'text' : 'password'}
                                                required
                                                value={passData.newPassword}
                                                onChange={e => {
                                                    setPassData({ ...passData, newPassword: e.target.value })
                                                    if (passErrors.newPassword) setPassErrors({ ...passErrors, newPassword: '' })
                                                }}
                                                className={`w-full px-1 py-2 bg-transparent border-b-2 transition-all pr-12 font-medium text-sm ${passErrors.newPassword ? 'border-rose-300' : 'border-slate-200 dark:border-slate-800 focus:border-[#10b981]'}`}
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
                                    className="w-full py-3 bg-[#10b981] text-slate-900 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-[#10b981]/90"
                                >
                                    {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    Cập Nhật Mật Khẩu Ngay
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
