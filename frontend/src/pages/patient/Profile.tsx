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
    Globe,
    Loader2,
    Lock,
    X,
    Eye,
    EyeOff,
    ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { UpdatePatientProfileRequest, ChangePasswordRequest } from '@/types/api'
import { getPortalProfile, updatePortalProfile, changePortalPassword, uploadPortalAvatar } from '@/api/portal'

function CustomSelect({ value, onChange, options, placeholder, className = '' }: {
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    className?: string;
}) {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find(o => o.value === value)

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border transition-all ${isOpen ? 'border-blue-400 bg-white shadow-lg shadow-blue-400/10' : 'border-slate-100'}`}
            >
                <span className={`font-bold transition-colors ${selectedOption ? 'text-slate-700' : 'text-slate-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-50 mt-2 w-full max-h-60 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-y-auto scrollbar-hide py-2"
                        >
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full text-left px-5 py-3 text-sm font-bold transition-all ${value === opt.value ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

const genderMap: Record<string, string> = {
    'MALE': 'Nam',
    'FEMALE': 'Nữ',
    'OTHER': 'Khác'
}

export default function PatientProfile() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
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
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Password change state
    const [isPassModalOpen, setIsPassModalOpen] = useState(false)
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
    const [passErrors, setPassErrors] = useState<Record<string, string>>({})
    const [showOldPass, setShowOldPass] = useState(false)
    const [showNewPass, setShowNewPass] = useState(false)
    const [showConfirmPass, setShowConfirmPass] = useState(false)

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
        setErrors(newErrors)
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
            setErrors({})
        },
        onError: (err: any) => {
            if (err.details?.errors) {
                const newErrors: Record<string, string> = {}
                err.details.errors.forEach((e: any) => {
                    newErrors[e.field] = e.message
                })
                setErrors(newErrors)
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

    if (isLoading) return <div className="p-12 text-center text-slate-400 font-bold">Đang tải hồ sơ...</div>

    return (
        <div className="px-4 py-4 space-y-8 pb-12">

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Avatar & Quick Info */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 text-center"
                    >
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-200 overflow-hidden ring-4 ring-white">
                                {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    profile?.fullNameVi?.charAt(0)
                                )}
                            </div>
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploadMutation.isPending}
                            />
                            <label
                                htmlFor="avatar-upload"
                                className={`absolute -bottom-2 -right-2 p-3 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl shadow-xl border border-slate-100 cursor-pointer transition-all group-hover:scale-110 ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploadMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                ) : (
                                    <Camera className="w-5 h-5" />
                                )}
                            </label>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mt-6">{profile?.fullNameVi}</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Bệnh nhân</p>

                        <div className="mt-8 pt-6 border-t border-slate-50 space-y-4 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase leading-none">Mã hồ sơ</p>
                                    <p className="text-xs font-bold text-slate-600">ID-{profile?.id?.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPassModalOpen(true)}
                                className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group"
                            >
                                <div className="w-8 h-8 bg-white text-slate-400 rounded-xl flex items-center justify-center shrink-0 group-hover:text-blue-600">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Đổi mật khẩu</span>
                            </button>
                        </div>
                    </motion.div>

                    <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/20">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Quốc tịch & Dân tộc</h4>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 transition-all hover:translate-x-1 group">
                                <div className="w-11 h-11 bg-white text-slate-400 rounded-2xl flex items-center justify-center shadow-sm group-hover:text-blue-600 group-hover:shadow-md transition-all">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mb-0.5">Quốc tịch {profile?.nationality ? '(Cố định)' : ''}</p>
                                    {profile?.nationality ? (
                                        <p className="font-bold text-slate-700">{profile.nationality}</p>
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.nationality}
                                            onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                                            className="w-full bg-transparent border-none font-bold text-slate-700 focus:outline-none"
                                            placeholder="Nhập quốc tịch..."
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 transition-all hover:translate-x-1 group">
                                <div className="w-11 h-11 bg-white text-slate-400 rounded-2xl flex items-center justify-center shadow-sm group-hover:text-blue-600 group-hover:shadow-md transition-all">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mb-0.5">Dân tộc {profile?.ethnicity ? '(Cố định)' : ''}</p>
                                    {profile?.ethnicity ? (
                                        <p className="font-bold text-slate-700">{profile.ethnicity}</p>
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.ethnicity}
                                            onChange={e => setFormData({ ...formData, ethnicity: e.target.value })}
                                            className="w-full bg-transparent border-none font-bold text-slate-700 focus:outline-none"
                                            placeholder="Nhập dân tộc..."
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Form */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Thông tin cơ bản</h3>
                                <p className="text-sm text-slate-400 font-medium mt-1">Các thông tin cá nhân dùng cho hồ sơ bệnh án</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 group"
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                )}
                                Lưu thay đổi
                            </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số CCCD / Hộ chiếu {profile?.cccd ? '(Cố định)' : ''}</label>
                                {profile?.cccd ? (
                                    <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-2xl border border-slate-200 opacity-60">
                                        <ShieldCheck className="w-5 h-5 text-slate-400" />
                                        <span className="font-bold text-slate-500">{profile.cccd}</span>
                                    </div>
                                ) : (
                                    <div className={`flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border transition-all ${errors.cccd ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus-within:border-blue-400'}`}>
                                        <ShieldCheck className={`w-5 h-5 ${errors.cccd ? 'text-rose-400' : 'text-slate-300'}`} />
                                        <input
                                            type="text"
                                            value={formData.cccd}
                                            onChange={e => {
                                                setFormData({ ...formData, cccd: e.target.value })
                                                if (errors.cccd) setErrors({ ...errors, cccd: '' })
                                            }}
                                            placeholder="Nhập số CCCD của bạn"
                                            className="w-full bg-transparent border-none font-bold text-slate-700 focus:outline-none placeholder:text-slate-300"
                                        />
                                    </div>
                                )}
                                {errors.cccd && <p className="text-[10px] font-bold text-rose-500 ml-2">{errors.cccd}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                                <div className={`flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border transition-all ${errors.fullNameVi ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus-within:border-blue-400'}`}>
                                    <User className={`w-5 h-5 ${errors.fullNameVi ? 'text-rose-400' : 'text-slate-300'}`} />
                                    <input
                                        type="text"
                                        value={formData.fullNameVi}
                                        onChange={e => {
                                            setFormData({ ...formData, fullNameVi: e.target.value })
                                            if (errors.fullNameVi) setErrors({ ...errors, fullNameVi: '' })
                                        }}
                                        className="w-full bg-transparent border-none font-bold text-slate-700 focus:outline-none"
                                    />
                                </div>
                                {errors.fullNameVi && <p className="text-[10px] font-bold text-rose-500 ml-2">{errors.fullNameVi}</p>}
                            </div>
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">Ngày sinh</label>
                                <div className="flex gap-3">
                                    {/* Day Custom Select */}
                                    <CustomSelect
                                        value={formData.dateOfBirth ? (formData.dateOfBirth.split('-')[2]?.replace(/^0/, '') || '') : ''}
                                        onChange={(val: string) => {
                                            const parts = (formData.dateOfBirth || '1990-01-01').split('-');
                                            parts[2] = val.padStart(2, '0');
                                            setFormData({ ...formData, dateOfBirth: parts.join('-') });
                                        }}
                                        options={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }))}
                                        placeholder="Ngày"
                                        className="flex-1"
                                    />

                                    {/* Month Custom Select */}
                                    <CustomSelect
                                        value={formData.dateOfBirth ? (formData.dateOfBirth.split('-')[1]?.replace(/^0/, '') || '') : ''}
                                        onChange={(val: string) => {
                                            const parts = (formData.dateOfBirth || '1990-01-01').split('-');
                                            parts[1] = val.padStart(2, '0');
                                            setFormData({ ...formData, dateOfBirth: parts.join('-') });
                                        }}
                                        options={Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: `Tháng ${i + 1}` }))}
                                        placeholder="Tháng"
                                        className="flex-[1.5]"
                                    />

                                    {/* Year Custom Select */}
                                    <CustomSelect
                                        value={formData.dateOfBirth ? (formData.dateOfBirth.split('-')[0] || '') : ''}
                                        onChange={(val: string) => {
                                            const parts = (formData.dateOfBirth || '1990-01-01').split('-');
                                            parts[0] = val;
                                            setFormData({ ...formData, dateOfBirth: parts.join('-') });
                                        }}
                                        options={Array.from({ length: 100 }, (_, i) => ({ value: (new Date().getFullYear() - i).toString(), label: (new Date().getFullYear() - i).toString() }))}
                                        placeholder="Năm"
                                        className="flex-[1.2]"
                                    />
                                </div>
                                {errors.dateOfBirth && <p className="text-[10px] font-bold text-rose-500 ml-2 animate-in slide-in-from-left-2">{errors.dateOfBirth}</p>}
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">Giới tính</label>
                                <div className="flex p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100 relative w-full sm:w-80">
                                    {Object.entries(genderMap).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: value })}
                                            className={`relative flex-1 py-3 text-sm font-black transition-all z-10 ${formData.gender === value ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {label}
                                            {formData.gender === value && (
                                                <motion.div
                                                    layoutId="activeGender"
                                                    className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-200/50 z-[-1]"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                                <div className={`flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border transition-all ${errors.phone ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus-within:border-blue-400'}`}>
                                    <Phone className={`w-5 h-5 ${errors.phone ? 'text-rose-400' : 'text-slate-300'}`} />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => {
                                            setFormData({ ...formData, phone: e.target.value })
                                            if (errors.phone) setErrors({ ...errors, phone: '' })
                                        }}
                                        className="w-full bg-transparent border-none font-bold text-slate-700 focus:outline-none"
                                    />
                                </div>
                                {errors.phone && <p className="text-[10px] font-bold text-rose-500 ml-2">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <div className={`flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border transition-all ${errors.email ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus-within:border-blue-400'}`}>
                                    <Mail className={`w-5 h-5 ${errors.email ? 'text-rose-400' : 'text-slate-300'}`} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => {
                                            setFormData({ ...formData, email: e.target.value })
                                            if (errors.email) setErrors({ ...errors, email: '' })
                                        }}
                                        className="w-full bg-transparent border-none font-bold text-slate-700 focus:outline-none"
                                    />
                                </div>
                                {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-2">{errors.email}</p>}
                            </div>

                            <div className="sm:col-span-2 pt-6 border-t border-slate-50">
                                <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Địa chỉ cư trú</h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2 sm:col-span-2">
                                        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-blue-400 transition-all">
                                            <MapPin className="w-5 h-5 text-slate-300 mt-0.5" />
                                            <input
                                                type="text"
                                                placeholder="Số nhà, tên đường..."
                                                value={formData.addressLine}
                                                onChange={e => setFormData({ ...formData, addressLine: e.target.value })}
                                                className="w-full bg-transparent border-none font-bold text-slate-700 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            placeholder="Phường/Xã"
                                            value={formData.ward}
                                            onChange={e => setFormData({ ...formData, ward: e.target.value })}
                                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            placeholder="Quận/Huyện"
                                            value={formData.district}
                                            onChange={e => setFormData({ ...formData, district: e.target.value })}
                                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1 sm:col-span-2">
                                        <input
                                            type="text"
                                            placeholder="Thành phố/Tỉnh"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
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
                            className="bg-white rounded-[3rem] p-10 w-full max-w-md relative z-10 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsPassModalOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6 text-slate-300" />
                            </button>

                            <form onSubmit={handleChangePass} className="space-y-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Đổi mật khẩu</h3>
                                    <p className="text-slate-400 font-medium text-sm mt-1">Cập nhật mật khẩu để bảo mật tài khoản của bạn.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu cũ</label>
                                        <div className="relative">
                                            <input
                                                type={showOldPass ? 'text' : 'password'}
                                                required
                                                value={passData.oldPassword}
                                                onChange={e => {
                                                    setPassData({ ...passData, oldPassword: e.target.value })
                                                    if (passErrors.oldPassword) setPassErrors({ ...passErrors, oldPassword: '' })
                                                }}
                                                className={`w-full p-4 bg-slate-50 rounded-2xl border transition-all pr-12 font-bold ${passErrors.oldPassword ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-blue-400'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOldPass(!showOldPass)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                                            >
                                                {showOldPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {passErrors.oldPassword && <p className="text-[10px] font-bold text-rose-500 ml-2">{passErrors.oldPassword}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPass ? 'text' : 'password'}
                                                required
                                                value={passData.newPassword}
                                                onChange={e => {
                                                    setPassData({ ...passData, newPassword: e.target.value })
                                                    if (passErrors.newPassword) setPassErrors({ ...passErrors, newPassword: '' })
                                                }}
                                                className={`w-full p-4 bg-slate-50 rounded-2xl border transition-all pr-12 font-bold ${passErrors.newPassword ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-blue-400'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPass(!showNewPass)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                                            >
                                                {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {passErrors.newPassword && <p className="text-[10px] font-bold text-rose-500 ml-2">{passErrors.newPassword}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu mới</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPass ? 'text' : 'password'}
                                                required
                                                value={passData.confirmPassword}
                                                onChange={e => {
                                                    setPassData({ ...passData, confirmPassword: e.target.value })
                                                    if (passErrors.confirmPassword) setPassErrors({ ...passErrors, confirmPassword: '' })
                                                }}
                                                className={`w-full p-4 bg-slate-50 rounded-2xl border transition-all pr-12 font-bold ${passErrors.confirmPassword ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-blue-400'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                                            >
                                                {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {passErrors.confirmPassword && <p className="text-[10px] font-bold text-rose-500 ml-2">{passErrors.confirmPassword}</p>}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordMutation.isPending}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                                >
                                    {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    Cập nhật mật khẩu
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
